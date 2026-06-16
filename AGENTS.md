# AGENTS.md

Гайд для агентов и разработчиков по проекту **Marriage**. Описывает структуру,
архитектуру и конвенции. Источник истины по слою бизнес-логики и БД —
[`app/backend/docs/DOMAIN.md`](app/backend/docs/DOMAIN.md) и
[`app/backend/docs/DATABASE.md`](app/backend/docs/DATABASE.md); этот файл — точка входа
и не дублирует их, а ссылается.

## О проекте

**Marriage** — сервис свадебного RSVP: гости отправляют анкеты-приглашения (придут ли,
музыкальные пожелания, напитки, комментарий), а супер-пользователь управляет данными
через Telegram-бот. Создание приглашения публично (гость отправляет сам), просмотр и
управление — только для супер-пользователя.

## Структура репозитория

Монорепозиторий из трёх приложений:

```
app/
├── backend/    # REST API (FastAPI) — основное приложение, описано ниже
├── bot/        # Telegram-бот
└── frontend/   # веб-клиент
docker-compose-local.yml / docker-compose-prod.yml   # оркестрация всего стека
```

Бэкенд (`app/backend/`):

```
src/
├── main.py            # сборка FastAPI-приложения, middleware, хендлеры, роутеры
├── core/
│   ├── config.py      # настройки (pydantic-settings)
│   ├── exceptions.py  # иерархия DomainException
│   ├── guards/        # переиспользуемые FastAPI-зависимости (авторизация)
│   └── strategies/    # BaseRepository (дженерик)
├── middleware/        # RequestMiddleware (X-Request-ID)
├── database/
│   ├── session.py     # async engine, session_factory, get_session
│   ├── declarative.py # Base, аннотации полей
│   ├── models/        # ORM-модели и ассоциации
│   └── migrations/    # Alembic (async)
└── modules/           # домены: drink, guest, invitation
docs/                  # DOMAIN.md, DATABASE.md — эталонная документация
```

## Стек

Python 3.12 · FastAPI · SQLAlchemy 2.0 (async) · asyncpg · PostgreSQL 16 ·
Alembic · Pydantic v2 / pydantic-settings. Пакетный менеджер — **`uv`**.

## Архитектура

Каждый домен в `src/modules/<entity>/` — самодостаточный вертикальный срез из
четырёх слоёв с зависимостями строго вниз:

```
Resolver (FastAPI-роутер) → Service (бизнес-логика) → Repository (доступ к БД) → Model (ORM)
```

- Слои связываются через фабрики `get_*` и FastAPI `Depends`.
- Наружу данные отдаются только Pydantic-схемами (`*Out`), ORM-объекты за пределы
  сервиса не утекают.
- Одна `AsyncSession` живёт на весь запрос; **транзакцию ведёт `get_session()`**
  (commit/rollback). Репозитории делают только `add/delete/flush/refresh`, **без commit**.

Подробности и образцы кода каждого слоя — в `docs/DOMAIN.md` (эталон — `modules/drink/`).

## Конвенции именования

| Слой | Класс | Фабрика |
|------|-------|---------|
| Schema | `Schema<Entity>In` / `Schema<Entity>Out` | — |
| Repository | `<Entity>Repository` | `get_<entity>_repository` |
| Service | `<Entity>Service` | `get_<entity>_service` |
| Resolver | `<Entity>Resolver` | `get_<entity>_resolver` |

Резолвер подключается в `main.py` как `app.include_router(get_<entity>_resolver().router)`.
Доменные аргументы репозитория передаются только по ключу (`get_by_id(*, drink_id)`).

> Примечание: в `docs/DOMAIN.md` местами встречается устаревший вариант
> `get_<entity>_router()` — ориентируйтесь на фактический код (`get_<entity>_resolver()`
> + `.router`).

## REST и обработка ошибок

- Статус-коды: `200` (GET), `201 CREATED` (POST), `204 NO_CONTENT` (DELETE).
- Response-модель выводится из аннотации возвращаемого типа эндпоинта.
- Ошибки — через доменные исключения из `core/exceptions.py`: `BadRequestException` (400),
  `ForbiddenException` (403), `NotFoundException` (404), базовый `DomainException` (500).
- Сервис бросает доменное исключение; единый хендлер в `main.py` превращает любой
  `DomainException` в JSON `{"message": ...}` с нужным статусом. Отдельные хендлеры писать
  не нужно — достаточно нового подкласса со своими `status_code` и `default_message`.

## Авторизация (guards)

`is_super_user_guard` (`core/guards/permissions.py`) пускает дальше, только если в
заголовке `X-BOT-USER-ID` пришёл id, равный `TG_BOT_SUPER_USER_ID` из конфига; иначе —
`403`. Заголовок опционален → отсутствие даёт чистый `403`, а не `422`.

Матрица доступа по эндпоинтам:

| Эндпоинт | Доступ |
|----------|--------|
| `GET /health` | публичный (liveness) |
| `GET /drink` | публичный |
| `POST /drink`, `DELETE /drink/{id}` | супер-пользователь |
| `GET /guest` | супер-пользователь (guard на всём роутере) |
| `POST /invitation` | публичный (RSVP — гость отправляет сам) |
| `GET /invitation`, `DELETE /invitation/{id}` | супер-пользователь |

Guard подключают либо на отдельный эндпоинт (`_: str = Depends(is_super_user_guard)`),
либо на весь роутер (`APIRouter(..., dependencies=[Depends(is_super_user_guard)])`).

## Конфигурация

Все настройки — из `.env` через `pydantic-settings` (шаблон — `app/backend/.env.example`):
`APP_*`, `POSTGRES_*`, `APP_CORS_ORIGIN`, `TG_BOT_SUPER_USER_ID`. Доступ — через
`get_settings()` (кешируется `@lru_cache`). DSN собирается в `DatabaseSettings.url`.

## Команды разработки

Из `app/backend/` (`Makefile`):

```bash
make install       # uv sync --group dev
make lint          # ruff check src/
make lint-fix       # ruff check --fix src/
make format        # ruff format + black
make check         # lint + format-check (цель по умолчанию)
```

Запуск стека — через Docker Compose (`docker-compose-local.yml`); миграции
применяются автоматически в entrypoint (`alembic upgrade head`).

## Стиль кода

ruff + black, `line-length = 100`, таргет `py312`. Набор правил ruff:
`E, F, I, B, UP, SIM`. Каталог миграций (`src/database/migrations/versions`) исключён
из линта; миграции форматируются `ruff format` через post-write hook Alembic.

## Чек-лист нового домена

1. Пакет `src/modules/<entity>/` с `__init__.py`.
2. `schema.py` — `Schema<Entity>In` (валидация входа) и `Schema<Entity>Out`
   (`ConfigDict(from_attributes=True)`).
3. `repository.py` — `<Entity>Repository(BaseRepository[<Model>])`, `table = <Model>`,
   async-методы + фабрика `get_<entity>_repository(session)`.
4. `service.py` — `<Entity>Service` (принимает `AsyncSession`), методы возвращают схемы
   и бросают доменные исключения + фабрика `get_<entity>_service(session = Depends(get_session))`.
5. `resolver.py` — `<Entity>Resolver` с `router = APIRouter(prefix, tags)`,
   эндпоинты-`@staticmethod` + фабрика `get_<entity>_resolver()`.
6. Подключить в `main.py`: `app.include_router(get_<entity>_resolver().router)`.

Полная версия с образцами кода — в [`docs/DOMAIN.md`](app/backend/docs/DOMAIN.md).
