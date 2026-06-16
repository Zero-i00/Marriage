import datetime
from typing import Annotated

from sqlalchemy import TEXT, String, func
from sqlalchemy.orm import mapped_column

CHAR_FIELD = Annotated[str, mapped_column(String(255))]
TEXT_FIELD = Annotated[str, mapped_column(TEXT)]

CREATED_AT_FIELD = Annotated[datetime.datetime, mapped_column(server_default=func.now())]

UPDATED_AT_FIELD = Annotated[
    datetime.datetime, mapped_column(server_default=func.now(), onupdate=func.now())
]
