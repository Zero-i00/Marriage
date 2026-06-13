from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from core.config import get_settings
from core.exceptions import DomainException
from middleware import RequestMiddleware
from modules.drink.resolver import get_drink_router
from modules.guest.resolver import get_guest_router

settings = get_settings()



app = FastAPI(
    title=settings.app_title,
    version=settings.app_version,
)

app.add_middleware(RequestMiddleware)


@app.exception_handler(DomainException)
async def domain_exception_handler(_: Request, exc: DomainException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message},
    )


app.include_router(get_drink_router())
app.include_router(get_guest_router())


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_debug,
    )
