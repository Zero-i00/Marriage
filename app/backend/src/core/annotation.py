from typing import Annotated

from pydantic import Field

CHAR_FIELD = Annotated[str, Field(min_length=1, max_length=255)]
