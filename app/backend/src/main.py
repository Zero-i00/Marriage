from fastapi import FastAPI

from core.config import get_settings
from middleware import RequestMiddleware

settings = get_settings()

app = FastAPI(
    title=settings.app_title,
    version=settings.app_version,
)

app.add_middleware(RequestMiddleware)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_debug,
    )
