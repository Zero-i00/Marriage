from functools import lru_cache

from pydantic import Field, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

BaseConfig = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


class DatabaseConfig(BaseSettings):
    model_config = BaseConfig

    postgres_host: str
    postgres_port: int
    postgres_db: str
    postgres_user: str
    postgres_password: str

    @computed_field
    @property
    def url(self) -> PostgresDsn:
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.postgres_user,
            password=self.postgres_password,
            host=self.postgres_host,
            port=self.postgres_port,
            path=self.postgres_db,
        )


class Config(BaseSettings):
    model_config = BaseConfig

    app_debug: bool
    app_host: str
    app_post: int
    app_version: str

    app_cors_origin: list[str] = Field(default_factory=list)

    db: DatabaseConfig = Field(default_factory=DatabaseConfig)


@lru_cache
def get_config() -> Config:
    return Config()
