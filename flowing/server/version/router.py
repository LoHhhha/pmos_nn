# Copyright © 2025 PMoS. All rights reserved.

from fastapi import APIRouter

from flowing.config import Mate
from flowing.server.common import get_json_response

router = APIRouter(
    prefix="/version",
    tags=["version"],
)


@router.post("/package")
async def package_version():
    return get_json_response(version=Mate.VERSION)


@router.post("/web")
async def web_version():
    return get_json_response(version=Mate.WEB_VERSION)
