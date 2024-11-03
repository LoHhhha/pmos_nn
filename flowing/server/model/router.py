from fastapi import APIRouter
from flowing.server.model import calculate, download

router = APIRouter(
    prefix="/model",
    tags=["model"],
)

router.include_router(calculate.router)
router.include_router(download.router)
