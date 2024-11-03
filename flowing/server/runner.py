import argparse
import uvicorn

from flowing.shower import Logger

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="PMoS Server Runner")
    parser.add_argument("--port", default=54321, type=int)
    parser.add_argument("--host", default="127.0.0.1", type=str)

    args = parser.parse_args()

    Logger.LOGGER_LEVER = Logger.DEBUG_MSG
    uvicorn.run('flowing.server.server:app', port=args.port, host=args.host)
