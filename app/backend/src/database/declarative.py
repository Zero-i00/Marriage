import datetime

from sqlalchemy import DateTime, Identity, Integer, MetaData
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

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


class Base(DeclarativeBase):
    metadata = METADATA

    type_annotation_map = {
        datetime.datetime: DateTime(timezone=True),
    }

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True)

    def __repr__(self) -> str:
        return f"<{type(self).__name__} id={self.id}>"
