import os

from fastapi import APIRouter
from fastapi.responses import FileResponse

from flowing.server.config import MODEL_RESULT_PATH

router = APIRouter(
    prefix="/download",
    tags=["download"],
)


@router.get("/{file_name:path}")
async def get_result(file_name):
    file = os.path.join(MODEL_RESULT_PATH, file_name)
    if os.path.isfile(file):
        return FileResponse(file)
