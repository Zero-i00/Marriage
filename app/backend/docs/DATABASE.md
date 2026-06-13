# База данных

Справочник по слою работы с БД: используемый стек, конвенции и правила создания
моделей, общий вид текущей схемы и работа с миграциями.

## Содержание

- [Стек](#стек)
- [Структура слоя БД](#структура-слоя-бд)
- [Базовый класс `Base`](#базовый-класс-base)
- [Аннотированные типы полей](#аннотированные-типы-полей)
- [Сессия и движок](#сессия-и-движок)
- [Правила создания модели](#правила-создания-модели-чек-лист)
- [Общий вид схемы](#общий-вид-схемы)
- [Миграции (Alembic)](#миграции-alembic)

---

## Стек

| Компонент | Значение |
|-----------|----------|
| ORM | SQLAlchemy `>=2.0.50` (стиль 2.0: `Mapped` / `mapped_column`) |
| Драйвер | `asyncpg` (асинхронный, PostgreSQL) |
| Доступ к БД | полностью асинхронный (`AsyncEngine` / `AsyncSession`) |
| Миграции | Alembic `>=1.18.4` |
| Python | 3.12 |
| Формат кода | Black / Ruff, длина строки 100 |

Версии зафиксированы в `app/backend/pyproject.toml`.

---

## Структура слоя БД

```
src/database/
├── declarative.py      # Base, METADATA, схема именования ограничений
├── annotation.py       # переиспользуемые аннотации колонок (CHAR_FIELD, ...)
├── session.py          # async-движок, фабрика сессий, get_session()
├── models/             # ORM-модели (один класс на файл) + ассоциации
│   ├── __init__.py     # реэкспорт всех моделей (важно для Alembic)
│   ├── associations.py # M2M-таблицы (классический Table())
│   ├── drink.py
│   ├── guest.py
│   └── invitation.py
└── migrations/         # окружение и версии Alembic
```

Доступ к данным построен по слоям **Service → Repository → Model**:

- **Model** — ORM-класс (`database/models/`).
- **Repository** — инкапсулирует SQL-запросы, наследуется от
  `BaseRepository[Table]` (`core/strategies/repository.py`). Пример: `modules/drink/repository.py`.
- **Service** — бизнес-логика, работает с репозиторием, возвращает Pydantic-схемы.
  Пример: `modules/drink/service.py`.

```python
# core/strategies/repository.py
Table = TypeVar("Table", bound=Base)

class BaseRepository(Generic[Table]):
    """Describes basic methods for working with tables."""

    table: type[Table]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
```

---

## Базовый класс `Base`

Все модели наследуются от `Base` (`database/declarative.py`). Базовый класс задаёт:

- общий первичный ключ `id` — целочисленный, через PostgreSQL `Identity()`;
- `type_annotation_map`: любой `datetime.datetime` → `DateTime(timezone=True)`
  (все временные метки хранятся с таймзоной);
- единый `__repr__`.

```python
class Base(DeclarativeBase):
    metadata = METADATA

    type_annotation_map = {
        datetime.datetime: DateTime(timezone=True),
    }

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)

    def __repr__(self) -> str:
        return f"<{type(self).__name__} id={self.id}>"
```

### Схема именования ограничений

`METADATA` задаёт единую схему имён для индексов и ограничений — имена в БД и
миграциях получаются предсказуемыми и не зависят от автогенерации Alembic.

```python
METADATA = MetaData(
    naming_convention={
        "all_column_names": lambda constraint, table: "_".join(
            [column.name for column in constraint.columns.values()],
        ),
        "pk": "pk__%(table_name)s",
        "ix": "ix__%(table_name)s__%(all_column_names)s",
        "fk": "fk__%(table_name)s__%(all_column_names)s__%(referred_table_name)s",
        "uq": "uq__%(table_name)s__%(all_column_names)s",
        "ck": "ck__%(table_name)s__%(constraint_name)s",
    }
)
```

| Тип | Шаблон | Пример |
|-----|--------|--------|
| Первичный ключ | `pk__<table>` | `pk__invitations` |
| Индекс | `ix__<table>__<columns>` | `ix__guests__full_name` |
| Внешний ключ | `fk__<table>__<columns>__<referred_table>` | `fk__guests__invitation_id__invitations` |
| Уникальность | `uq__<table>__<columns>` | `uq__drinks__title` |
| Check | `ck__<table>__<name>` | `ck__invitations__is_plan_visit` |

---

## Аннотированные типы полей

`database/annotation.py` содержит переиспользуемые описания колонок через
`Annotated`. **Объявляя колонку, используйте готовую аннотацию, а не дублируйте
тип вручную.**

```python
CHAR_FIELD = Annotated[str, mapped_column(String(255))]
TEXT_FIELD = Annotated[str, mapped_column(TEXT)]

CREATED_AT_FIELD = Annotated[datetime.datetime, mapped_column(server_default=func.now())]

UPDATED_AT_FIELD = Annotated[
    datetime.datetime, mapped_column(server_default=func.now(), onupdate=func.now())
]
```

| Аннотация | Тип в БД | Назначение |
|-----------|----------|------------|
| `CHAR_FIELD` | `VARCHAR(255)` | короткие строки (имена, заголовки) |
| `TEXT_FIELD` | `TEXT` | длинный текст без ограничения длины |
| `CREATED_AT_FIELD` | `TIMESTAMPTZ` | момент создания, `server_default=now()` |
| `UPDATED_AT_FIELD` | `TIMESTAMPTZ` | момент обновления, `server_default` + `onupdate=now()` |

Временные метки заполняются **на стороне БД** (`server_default` / `onupdate`),
а не Python-дефолтами — это гарантирует консистентность даже при записи в обход ORM.

---

## Сессия и движок

`database/session.py` создаёт единый async-движок и фабрику сессий.

```python
settings = get_settings()

engine = create_async_engine(
    url=str(settings.db.url),
    echo=settings.app_debug,
    pool_pre_ping=True
)

session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

Особенности:

- URL берётся из настроек (`core.config.get_settings().db.url`); `echo` включается
  через `app_debug`; `pool_pre_ping=True` отсеивает «мёртвые» соединения из пула.
- `expire_on_commit=False` — объекты остаются доступными после `commit()`.
- `autoflush=False` — flush выполняется явно (`session.flush()`).
- `get_session()` — зависимость FastAPI (`Depends`): commit при успешном завершении
  запроса, rollback при исключении.

---

## Правила создания модели (чек-лист)

При добавлении новой модели:

1. **Один класс — один файл** в `database/models/`, имя класса — `<Entity>Model`
   (`DrinkModel`, `GuestModel`, `InvitationModel`).
2. **Наследоваться от `Base`.** Поле `id` **не** объявлять — оно уже есть в базовом классе.
3. **`__tablename__`** — множественное число в snake_case (`drinks`, `guests`, `invitations`).
4. **Колонки** объявлять через `Mapped[...]`. Для строк, текста и временных меток
   использовать аннотации из `annotation.py`, а не «сырые» типы.
5. **Nullable-колонки** — через `| None`: `music: Mapped[CHAR_FIELD | None]`.
6. **Уникальность** — `mapped_column(unique=True)`.
7. **Внешний ключ** — `mapped_column(ForeignKey("<table>.id"))`.
8. **Связи** — `relationship(back_populates=...)` с обеих сторон. На стороне-владельце
   связи one-to-many ставить `cascade="all, delete-orphan"`.
9. **Many-to-many** — отдельная таблица в `associations.py` через классический
   `Table(...)` с составным первичным ключом.
10. **Нормализация значений** на уровне модели — через `@validates`.
11. **Циклические импорты** между моделями закрывать `from __future__ import annotations`
    и блоком `if TYPE_CHECKING:`.
12. **Зарегистрировать** новую модель в `database/models/__init__.py` (реэкспорт) —
    иначе Alembic её не «увидит» при автогенерации миграций.

### Примеры

Простая модель с FK и обратной связью:

```python
class GuestModel(Base):
    __tablename__ = "guests"

    full_name: Mapped[CHAR_FIELD]

    invitation_id: Mapped[int] = mapped_column(ForeignKey("invitations.id"))
    invitation: Mapped["InvitationModel"] = relationship(back_populates="guests")
```

Модель-владелец с nullable-полями, каскадом, M2M и временными метками:

```python
class InvitationModel(Base):
    __tablename__ = "invitations"

    is_plan_visit: Mapped[bool]

    music: Mapped[CHAR_FIELD | None]
    comment: Mapped[TEXT_FIELD | None]

    guests: Mapped[list[GuestModel]] = relationship(
        back_populates="invitation",
        cascade="all, delete-orphan",
    )

    drinks: Mapped[list[DrinkModel]] = relationship(
        secondary=invitations_to_drinks,
        back_populates="invitations",
    )

    created_at: Mapped[CREATED_AT_FIELD]
    updated_at: Mapped[UPDATED_AT_FIELD]
```

Уникальное поле + нормализация через `@validates`:

```python
class DrinkModel(Base):
    __tablename__ = "drinks"

    title: Mapped[CHAR_FIELD] = mapped_column(unique=True)

    invitations: Mapped[list["InvitationModel"]] = relationship(
        secondary=invitations_to_drinks,
        back_populates="drinks",
    )

    @validates("title")
    def _capitalize_title(self, key: str, value: str) -> str:
        return value[:1].upper() + value[1:] if value else value
```

Ассоциативная таблица для M2M (классический `Table`, составной PK):

```python
invitations_to_drinks = Table(
    "invitations_to_drinks",
    Base.metadata,
    Column("invitation_id", ForeignKey("invitations.id"), primary_key=True),
    Column("drink_id", ForeignKey("drinks.id"), primary_key=True),
)
```

---

## Общий вид схемы

```
        ┌──────────────┐        ┌──────────────────────┐        ┌────────────┐
        │   guests     │        │     invitations      │        │   drinks   │
        ├──────────────┤        ├──────────────────────┤        ├────────────┤
        │ id (PK)      │   N  1 │ id (PK)              │ N    N │ id (PK)    │
        │ full_name    │───────▶│ is_plan_visit        │◀──────▶│ title (uq) │
        │ invitation_id│ FK     │ music (null)         │        └────────────┘
        └──────────────┘        │ comment (null)       │   через invitations_to_drinks
                                 │ created_at           │
          cascade               │ updated_at           │
          delete-orphan         └──────────────────────┘
```

Связи:

- `invitations` 1 → N `guests` — гости принадлежат приглашению, удаляются каскадно
  (`cascade="all, delete-orphan"`).
- `invitations` N ↔ N `drinks` — через ассоциативную таблицу `invitations_to_drinks`.

### Таблицы

**`invitations`** — приглашение (корневая сущность, ведёт временные метки).

| Колонка | Тип | Null | Примечание |
|---------|-----|------|------------|
| `id` | `integer` (Identity) | нет | PK |
| `is_plan_visit` | `boolean` | нет | |
| `music` | `varchar(255)` | да | |
| `comment` | `text` | да | |
| `created_at` | `timestamptz` | нет | `server_default = now()` |
| `updated_at` | `timestamptz` | нет | `server_default = now()`, `onupdate = now()` |

**`guests`** — гости приглашения.

| Колонка | Тип | Null | Примечание |
|---------|-----|------|------------|
| `id` | `integer` (Identity) | нет | PK |
| `full_name` | `varchar(255)` | нет | |
| `invitation_id` | `integer` | нет | FK → `invitations.id` |

**`drinks`** — напитки (справочные данные, без временных меток).

| Колонка | Тип | Null | Примечание |
|---------|-----|------|------------|
| `id` | `integer` (Identity) | нет | PK |
| `title` | `varchar(255)` | нет | уникально |

**`invitations_to_drinks`** — связь N↔N.

| Колонка | Тип | Примечание |
|---------|-----|------------|
| `invitation_id` | `integer` | PK, FK → `invitations.id` |
| `drink_id` | `integer` | PK, FK → `drinks.id` |

---

## Миграции (Alembic)

Конфигурация — `app/backend/alembic.ini`, окружение — `src/database/migrations/env.py`.

Ключевые настройки `alembic.ini`:

```ini
[alembic]
script_location = src/database/migrations
prepend_sys_path = src
file_template = %%(year)d_%%(month).2d_%%(day).2d_%%(hour).2d%%(minute).2d-%%(rev)s_%%(slug)s

[post_write_hooks]
hooks = ruff_format
ruff_format.type = exec
ruff_format.executable = ruff
ruff_format.options = format REVISION_SCRIPT_FILENAME
```

- Версии лежат в `src/database/migrations/versions/`; имя файла —
  `YYYY_MM_DD_HHMM-<rev>_<slug>.py` (читаемая хронология).
- После генерации файл автоматически форматируется `ruff format`.
- Окружение (`env.py`) использует async-движок с `NullPool`, берёт URL из настроек,
  `target_metadata = Base.metadata` и импортирует `database.models`, чтобы все таблицы
  были зарегистрированы перед автогенерацией.

Команды (из каталога `app/backend/`):

```bash
# создать новую миграцию по изменениям моделей
alembic revision --autogenerate -m "описание изменения"

# применить миграции до последней
alembic upgrade head

# откатить на одну миграцию назад
alembic downgrade -1
```

> После любого изменения моделей: убедитесь, что модель реэкспортирована в
> `database/models/__init__.py`, затем сгенерируйте и проверьте миграцию перед `upgrade`.
