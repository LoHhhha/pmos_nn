# Copyright © 2024 PMoS. All rights reserved.

from fastapi import FastAPI

from flowing.server import frontend, model, shape, version

app = FastAPI()

app.include_router(model.router)
app.include_router(shape.router)
app.include_router(version.router)
app.include_router(frontend.router)
