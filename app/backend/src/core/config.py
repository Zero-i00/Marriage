from functools import lru_cache

from pydantic import Field, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

BaseConfig = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


class DatabaseSettings(BaseSettings):
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


class TelegramBotSettings(BaseSettings):
    model_config = BaseConfig

    tg_bot_super_user_id: str


class Settings(BaseSettings):
    model_config = BaseConfig

    app_debug: bool
    app_host: str
    app_port: int
    app_version: str
    app_title: str = 'Marriage API'

    app_cors_origin: list[str] = Field(default_factory=list)

    db: DatabaseSettings = Field(default_factory=DatabaseSettings)
    tg: TelegramBotSettings = Field(default_factory=TelegramBotSettings)


@lru_cache
def get_settings() -> Settings:
    return Settings()
