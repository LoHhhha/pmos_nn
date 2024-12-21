# Copyright © 2024 PMoS. All rights reserved.

from pydantic import BaseModel

from flowing.server.common import get_json_response

NET_NODE_INFOS_PARSE_ERROR_RESPONSE = get_json_response(400, "Get an unexpected net_node_infos")


class ShapeCalculateRequest(BaseModel):
    timestamp: int = -1
    data: str | None = None
    name: str | None = None

    def __repr__(self):
        return f"ShapeCalculateRequest(timestamp={self.timestamp}, data={self.data}, name={self.name})"
