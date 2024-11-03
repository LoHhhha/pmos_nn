import os
from functools import lru_cache
from fastapi import APIRouter
from fastapi.responses import FileResponse

from flowing.server.config import PUBLIC_PATH

router = APIRouter()


@lru_cache(maxsize=None)
def get_file_response(file_path):
    file = os.path.join(PUBLIC_PATH, file_path)
    if os.path.isfile(file):
        return FileResponse(file)
    else:
        return FileResponse(os.path.join(PUBLIC_PATH, "index.html"))


@router.get("/{file_path:path}")
async def read_frontend_files(file_path):
    return get_file_response(file_path)
