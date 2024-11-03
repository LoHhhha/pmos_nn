from starlette.responses import JSONResponse


def get_json_response(status_code: int = 200, msg: str = "OK", **kwargs):
    return JSONResponse(
        status_code=status_code,
        content={
            "msg": msg,
            **kwargs,
        })
