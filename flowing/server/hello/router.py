# Copyright © 2025 PMoS. All rights reserved.

from fastapi import APIRouter

from flowing.config import Mate, ReadyDependencies
from flowing.server.common import get_json_response

router = APIRouter(
    prefix="/hello",
    tags=["version"],
)


@router.post("")
async def package_information():
    return get_json_response(
        package_version=Mate.VERSION,
        web_version=Mate.WEB_VERSION,
        mindspore_ready=ReadyDependencies.get("mindspore", False),
        tensorflow_ready=ReadyDependencies.get("tensorflow", False),
        torch_ready=ReadyDependencies.get("torch", False),
    )
