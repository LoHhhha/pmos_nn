# Copyright © 2024 PMoS. All rights reserved.

from pydantic import BaseModel

from flowing.server.common import get_json_response

NOT_INPUT_NODES_ERROR_RESPONSE = get_json_response(400, "Get an unexpected JSON that have not input_nodes")
NOT_OUTPUT_NODES_ERROR_RESPONSE = get_json_response(400, "Get an unexpected JSON that have not output_nodes")
NOT_NET_NODES_ERROR_RESPONSE = get_json_response(400, "Get an unexpected JSON that have not net_nodes")

INPUT_NODES_PARSE_ERROR_RESPONSE = get_json_response(400, "Get an unexpected input_nodes")
OUTPUT_NODES_PARSE_ERROR_RESPONSE = get_json_response(400, "Get an unexpected output_nodes")
NET_NODES_PARSE_ERROR_RESPONSE = get_json_response(400, "Get an unexpected net_nodes")


class ModelCalculateRequest(BaseModel):
    timestamp: int = -1
    data: str | None = None
    name: str | None = None

    def __repr__(self):
        return f"ModelCalculateRequest(timestamp={self.timestamp}, data={self.data}, name={self.name})"
