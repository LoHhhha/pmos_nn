# Copyright © 2024 PMoS. All rights reserved.

from fastapi import APIRouter
from flowing.server.shape import calculate

router = APIRouter(
    prefix="/shape",
    tags=["shape"],
)

router.include_router(calculate.router)
