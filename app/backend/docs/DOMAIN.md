# Домены (модули)

Справочник по слою бизнес-логики: что такое домен, из каких слоёв он состоит,
правила и конвенции создания нового модуля. За эталон взят `modules/drink/`.

Парный документ — [DATABASE.md](./DATABASE.md) (слой моделей и БД).

## Содержание

- [Что такое домен](#что-такое-домен)
- [Структура модуля](#структура-модуля)
- [Слой Schema](#слой-schema)
- [Слой Repository](#слой-repository)
- [Слой Service](#слой-service)
- [Слой Resolver](#слой-resolver)
- [Поток зависимостей (DI)](#поток-зависимостей-di)
- [Обработка ошибок](#обработка-ошибок)
- [Защита эндпоинтов (guards)](#защита-эндпоинтов-guards)
- [Подключение модуля в приложение](#подключение-модуля-в-приложение)
- [Чек-лист создания нового домена](#чек-лист-создания-нового-домена)

---

## Что такое домен

**Домен (модуль)** — вертикальный срез функциональности в `src/modules/<entity>/`,
инкапсулирующий всё необходимое для одной сущности. Каждый модуль самодостаточен
и состоит из четырёх слоёв.

Поток обработки запроса:

```
HTTP-запрос
   │
   ▼
Resolver  (FastAPI-роутер: маршруты, статусы, валидация входа)
   │  Depends
   ▼
Service   (бизнес-логика, доменные исключения, маппинг в схемы)
   │
   ▼
Repository (доступ к данным, SQL-запросы)
   │
   ▼
Model     (ORM-сущность, см. DATABASE.md)
```

Наружу данные отдаются только через **Pydantic-схемы**, не через ORM-объекты.

---

## Структура модуля

```
modules/<entity>/
├── schema.py       # Pydantic-схемы входа/выхода
├── repository.py   # доступ к данным (наследник BaseRepository)
├── service.py      # бизнес-логика
└── resolver.py     # FastAPI-роутер (эндпоинты)
```

Правила:

- **Один слой — один файл.** Не смешивать ответственность.
- Каждый слой предоставляет **фабрику `get_*`**, через которую он создаётся
  (используется как точка для `Depends` и для связывания слоёв).
- Зависимости направлены строго вниз: `resolver → service → repository → model`.
  Слой не знает о тех, кто стоит выше него.

---

## Слой Schema

`schema.py` — контракты данных на Pydantic v2. Разделяем схемы **входа** и **выхода**.

```python
from pydantic import BaseModel, ConfigDict, Field


class SchemaDrinkIn(BaseModel):
    title: str = Field(min_length=1)


class SchemaDrinkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
```

Конвенции:

- Именование — `Schema<Entity><In|Out>` (`SchemaDrinkIn`, `SchemaDrinkOut`).
- **`*In`** — то, что приходит от клиента; валидация полей через `Field`
  (`min_length`, `max_length`, `ge` и т. п.). Без `id`.
- **`*Out`** — то, что отдаём клиенту; обязательно
  `model_config = ConfigDict(from_attributes=True)`, чтобы собираться напрямую из
  ORM-объекта через `model_validate(instance)`. Содержит `id`.
- Разные операции при необходимости получают разные схемы (не переиспользуем `*In`
  для частичного обновления, если правила валидации отличаются).

---

## Слой Repository

`repository.py` — единственное место, где пишутся запросы к БД. Наследуется от
дженерика `BaseRepository[<Model>]` (`core/strategies/repository.py`), который
хранит `session` и тип таблицы.

```python
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.strategies.repository import BaseRepository
from database.models import DrinkModel


class DrinkRepository(BaseRepository[DrinkModel]):
    model = DrinkModel

    async def list(self) -> Sequence[DrinkModel]:
        query = select(self.table)
        stmt = await self.session.execute(query)

        return stmt.scalars().all()

    async def get_by_id(self, *, drink_id: int) -> DrinkModel | None:
        return await self.session.get(self.table, drink_id)

    async def create(self, *, title: str) -> DrinkModel:
        instance = DrinkModel(title=title)

        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)

        return instance

    async def destroy(self, instance: DrinkModel) -> None:
        await self.session.delete(instance)


def get_drink_repository(session: AsyncSession) -> DrinkRepository:
    return DrinkRepository(session)
```

Конвенции:

- Имя класса — `<Entity>Repository`; обязателен атрибут `table = <Model>`.
- Все методы **асинхронные**.
- Доменные аргументы передаются **только по ключу** (через `*`): `get_by_id(*, drink_id)`.
- В `create` после `add` делаем `flush()` + `refresh()`, чтобы получить
  сгенерированные БД значения (`id`, server-default) ещё до коммита.
- **`commit` здесь не вызываем** — транзакцией управляет `get_session()` (см. DATABASE.md).
  Репозиторий только формирует изменения (`add` / `delete` / `flush`).
- Репозиторий не содержит бизнес-правил и не бросает доменные исключения — он
  возвращает данные (в т. ч. `None`), решения принимает сервис.
- Фабрика `get_<entity>_repository(session)` создаёт экземпляр.

---

## Слой Service

`service.py` — бизнес-логика. Принимает `AsyncSession`, создаёт репозиторий,
оркеструет вызовы, маппит результат в схемы и бросает доменные исключения.

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from core.exceptions import NotFoundException
from database.session import get_session
from modules.drink.repository import get_drink_repository
from modules.drink.schema import SchemaDrinkOut, SchemaDrinkIn


class DrinkService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = get_drink_repository(session)

    async def list(self) -> list[SchemaDrinkOut]:
        items = await self.repository.list()
        return [SchemaDrinkOut.model_validate(item) for item in items]

    async def create(self, data: SchemaDrinkIn) -> SchemaDrinkOut:
        instance = await self.repository.create(
            title=data.title
        )

        return SchemaDrinkOut.model_validate(instance)

    async def destroy(self, drink_id: int) -> None:
        instance = await self.repository.get_by_id(drink_id=drink_id)
        if instance is None:
            raise NotFoundException(f'Drink with id {drink_id} not found')

        await self.repository.destroy(instance)


def get_drink_service(session: AsyncSession = Depends(get_session)) -> DrinkService:
    return DrinkService(session)
```

Конвенции:

- Имя класса — `<Entity>Service`. В конструкторе получает `session` и создаёт
  репозиторий через его фабрику.
- На вход принимает **схемы** (`*In`), на выход отдаёт **схемы** (`*Out`),
  собирая их через `model_validate`. ORM-объекты за пределы сервиса не утекают.
- Здесь живут все проверки бизнес-правил. Отсутствие сущности и прочие ошибки —
  через **доменные исключения** (`NotFoundException`, `BadRequestException`).
- Фабрика `get_<entity>_service(session = Depends(get_session))` — точка входа DI:
  именно здесь подключается сессия из `database.session`.

---

## Слой Resolver

`resolver.py` — тонкий HTTP-слой: объявляет роутер и эндпоинты, делегирует всё сервису.

```python
from fastapi import APIRouter, Depends, status

from modules.drink.schema import SchemaDrinkOut, SchemaDrinkIn
from modules.drink.service import DrinkService, get_drink_service


class DrinkResolver:

    router = APIRouter(
        prefix="/drink",
        tags=["Drink"],
    )

    @staticmethod
    @router.get("")
    async def list(
        service: DrinkService = Depends(get_drink_service)
    ) -> list[SchemaDrinkOut]:
        return await service.list()

    @staticmethod
    @router.post("", status_code=status.HTTP_201_CREATED)
    async def create(
        data: SchemaDrinkIn,
        service: DrinkService = Depends(get_drink_service)
    ) -> SchemaDrinkOut:
        return await service.create(data)

    @staticmethod
    @router.delete("/{drink_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def destroy(
        drink_id: int,
        service: DrinkService = Depends(get_drink_service)
    ) -> None:
        return await service.destroy(drink_id)


def get_drink_resolver() -> DrinkResolver:
    return DrinkResolver()
```

Конвенции:

- Имя класса — `<Entity>Resolver`; внутри классовый атрибут
  `router = APIRouter(prefix="/<entity>", tags=["<Entity>"])`.
- Эндпоинты — `@staticmethod` под декоратором `@router.<verb>(...)`.
- Сервис инъектируется через `Depends(get_<entity>_service)`.
- Указываем **явный `status_code`** там, где он не 200 (`201_CREATED`, `204_NO_CONTENT`).
- Аннотации возвращаемого типа — схемы (`SchemaDrinkOut`), чтобы FastAPI строил
  корректную OpenAPI-документацию и сериализацию.
- В резолвере **нет** бизнес-логики и работы с БД — только маршрутизация.
- Фабрика `get_<entity>_resolver()` отдаёт экземпляр резолвера; в `main.py`
  подключается его `.router`.

---

## Поток зависимостей (DI)

Зависимости связываются через FastAPI `Depends` и фабрики `get_*`:

```
get_session            (database/session.py — выдаёт AsyncSession, ведёт транзакцию)
   │  Depends
   ▼
get_<entity>_service   (service.py — создаёт Service с этой сессией)
   │  внутри конструктора
   ▼
get_<entity>_repository (repository.py — создаёт Repository с той же сессией)
```

Почему фабрики, а не прямое создание:

- единая точка подключения `Depends` (сессия приходит из одного места — `get_session`);
- одна `AsyncSession` живёт на весь запрос и проходит сквозь все слои, поэтому
  транзакция атомарна (commit/rollback делает `get_session`);
- слои остаются развязанными и легко подменяются в тестах.

---

## Обработка ошибок

Доменные исключения объявлены в `core/exceptions.py`:

```python
class DomainException(Exception):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_message = "Internal Server Error"

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.default_message)
        self.message = message or self.default_message


class BadRequestException(DomainException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_message = "Bad request"


class ForbiddenException(DomainException):
    status_code = status.HTTP_403_FORBIDDEN
    default_message = "Forbidden"


class NotFoundException(DomainException):
    status_code = status.HTTP_404_NOT_FOUND
    default_message = "Not found"
```

Правило обработки:

- Сервис **бросает** доменное исключение (`raise NotFoundException(...)`) — он не
  знает про HTTP-ответы.
- Глобальный хендлер в `main.py` перехватывает любой `DomainException` и
  превращает его в JSON с нужным статусом и сообщением:

```python
@app.exception_handler(DomainException)
async def domain_exception_handler(_: Request, exc: DomainException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message},
    )
```

- Новый тип ошибки — это новый подкласс `DomainException` со своими `status_code`
  и `default_message`; отдельный хендлер писать не нужно.

---

## Защита эндпоинтов (guards)

**Guard** — это FastAPI-зависимость, которая выполняется **до тела эндпоинта** и
бросает доменное исключение, если доступ запрещён. Сам эндпоинт остаётся тонким и
ничего не знает про проверку — он просто перестаёт выполняться, если guard упал.

Guard'ы лежат в `core/guards/` и переиспользуются между модулями. Пример —
`is_super_user_guard` (`core/guards/permissions.py`): пускает дальше только если в
заголовке `X-BOT-USER-ID` пришёл id, совпадающий с `tg_bot_super_user_id` из конфига.

```python
from fastapi import Header

from core.config import get_settings
from core.exceptions import ForbiddenException

BOT_USER_ID_HEADER = "X-BOT-USER-ID"


async def is_super_user_guard(
    x_bot_user_id: str | None = Header(default=None, alias=BOT_USER_ID_HEADER),
) -> str:
    settings = get_settings()
    if x_bot_user_id != settings.tg.tg_bot_super_user_id:
        raise ForbiddenException("Only the super user can perform this action")
    return x_bot_user_id
```

Конвенции:

- Заголовок объявляем как **необязательный** (`Header(default=None, ...)`): тогда его
  отсутствие даёт чистый `403 Forbidden` от нашего хендлера, а не `422` от FastAPI.
  Отсутствующий, пустой и неверный заголовок проваливаются одинаково.
- Guard ничего не возвращает в HTTP-слой полезного — упал, значит `DomainException`
  превратится в JSON-ответ глобальным хендлером (см. [Обработка ошибок](#обработка-ошибок)).
- Именование — `<правило>_guard`.

Подключается guard двумя способами.

**1. На отдельный эндпоинт** — когда защищена только часть ручек модуля.
Результат не нужен в теле, поэтому связываем его с `_`. Так сделано в `drink`:
`list` открыт, а `create` и `destroy` — под guard'ом.

```python
from fastapi import APIRouter, Depends, status

from core.guards.permissions import is_super_user_guard
from modules.drink.schema import SchemaDrinkOut, SchemaDrinkIn
from modules.drink.service import DrinkService, get_drink_service


class DrinkResolver:

    router = APIRouter(prefix="/drink", tags=["Drink"])

    @staticmethod
    @router.get("")  # открыт для всех
    async def list(
        service: DrinkService = Depends(get_drink_service),
    ) -> list[SchemaDrinkOut]:
        return await service.list()

    @staticmethod
    @router.post("", status_code=status.HTTP_201_CREATED)
    async def create(
        data: SchemaDrinkIn,
        service: DrinkService = Depends(get_drink_service),
        _: str = Depends(is_super_user_guard),  # только супер-пользователь
    ) -> SchemaDrinkOut:
        return await service.create(data)
```

**2. На весь роутер** — когда защищены **все** ручки модуля. Указываем guard один
раз в `dependencies` у `APIRouter`, и он применится ко всем эндпоинтам. Так
сделано в `guest`:

```python
from fastapi import APIRouter, Depends

from core.guards.permissions import is_super_user_guard
from modules.guest.schema import SchemaGuestOut
from modules.guest.service import GuestService, get_guest_service


class GuestResolver:

    router = APIRouter(
        prefix="/guest",
        tags=["Guest"],
        dependencies=[Depends(is_super_user_guard)],  # guard на все ручки роутера
    )

    @staticmethod
    @router.get("")
    async def list(
        service: GuestService = Depends(get_guest_service),
    ) -> list[SchemaGuestOut]:
        return await service.list()
```

Правило выбора: **весь роутер** — если guard нужен на все ручки сразу; **на
эндпоинт** — если часть маршрутов остаётся открытой.

Пример запроса к защищённой ручке:

```bash
# без заголовка или с неверным id → 403 {"message": "Only the super user ..."}
curl -i -X POST localhost:8000/drink \
  -H 'Content-Type: application/json' -d '{"title":"Beer"}'

# с id из TG_BOT_SUPER_USER_ID_LIST → 201
curl -i -X POST localhost:8000/drink \
  -H 'X-BOT-USER-ID: 1529841680' \
  -H 'Content-Type: application/json' -d '{"title":"Beer"}'
```

---

## Подключение модуля в приложение

Сборка приложения — в `src/main.py`. Роутер модуля подключается одной строкой
через его фабрику:

```python
from modules.drink.resolver import get_drink_resolver

app.include_router(get_drink_resolver().router)
```

Чтобы добавить новый домен в приложение, достаточно импортировать его
`get_<entity>_resolver` и вызвать `app.include_router(get_<entity>_resolver().router)`.

---

## Чек-лист создания нового домена

1. Создать пакет `src/modules/<entity>/` (с `__init__.py`).
2. **`schema.py`** — `Schema<Entity>In` (валидация входа) и `Schema<Entity>Out`
   (`from_attributes=True`).
3. **`repository.py`** — `class <Entity>Repository(BaseRepository[<Model>])` с
   `table = <Model>` и async-методами доступа; фабрика `get_<entity>_repository(session)`.
4. **`service.py`** — `class <Entity>Service` (принимает `AsyncSession`, создаёт
   репозиторий), методы возвращают схемы и бросают доменные исключения; фабрика
   `get_<entity>_service(session = Depends(get_session))`.
5. **`resolver.py`** — `class <Entity>Resolver` с `router = APIRouter(prefix, tags)`,
   эндпоинты-`@staticmethod` под `@router.<verb>`; фабрика `get_<entity>_resolver()`.
6. Подключить роутер в `main.py`: `app.include_router(get_<entity>_resolver().router)`.

Соглашения об именах:

| Слой | Класс | Фабрика |
|------|-------|---------|
| Schema | `Schema<Entity>In` / `Schema<Entity>Out` | — |
| Repository | `<Entity>Repository` | `get_<entity>_repository` |
| Service | `<Entity>Service` | `get_<entity>_service` |
| Resolver | `<Entity>Resolver` | `get_<entity>_resolver` |
