from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import get_settings
from core.exceptions import DomainException
from middleware import RequestMiddleware
from modules.drink.resolver import get_drink_resolver
from modules.guest.resolver import get_guest_resolver
from modules.invitation.resolver import get_invitation_resolver

settings = get_settings()


app = FastAPI(title=settings.app_title, version=settings.app_version, root_path="/api")

app.add_middleware(RequestMiddleware)

if settings.app_cors_origin:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.app_cors_origin,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.exception_handler(DomainException)
async def domain_exception_handler(_: Request, exc: DomainException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message},
    )


@app.get("/health", tags=["Health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(get_drink_resolver().router)
app.include_router(get_guest_resolver().router)
app.include_router(get_invitation_resolver().router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_debug,
    )
