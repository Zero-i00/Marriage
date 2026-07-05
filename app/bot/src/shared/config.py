from functools import lru_cache

from pydantic import Field, SecretStr, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

BaseConfig = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


class ServerSettings(BaseSettings):
    model_config = BaseConfig

    server_url: str

    @computed_field
    @property
    def server_api_url(self) -> str:
        return f"{self.server_url}/api"


class Settings(BaseSettings):
    model_config = BaseConfig

    bot_token: SecretStr
    bot_proxy_url: SecretStr
    tg_bot_super_user_id_list: list[int] = Field(default_factory=list)

    server: ServerSettings = Field(default_factory=ServerSettings)


@lru_cache
def get_settings() -> Settings:
    return Settings()
