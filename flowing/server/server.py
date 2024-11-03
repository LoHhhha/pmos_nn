from fastapi import FastAPI

from flowing.server import frontend, model

app = FastAPI()

app.include_router(model.router)
app.include_router(frontend.router)
