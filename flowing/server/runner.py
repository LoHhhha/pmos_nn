# Copyright © 2024 PMoS. All rights reserved.

import argparse
import uvicorn

from flowing.shower import Logger

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="PMoS Server Runner")
    parser.add_argument("--port", default=54321, type=int)
    parser.add_argument("--host", default="127.0.0.1", type=str)
    parser.add_argument(
        "--log_level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR", "FAULT"],
        type=str
    )

    args = parser.parse_args()

    Logger.LOGGER_LEVER = eval(f"Logger.{args.log_level}_MSG")
    uvicorn.run('flowing.server.server:app', port=args.port, host=args.host)
