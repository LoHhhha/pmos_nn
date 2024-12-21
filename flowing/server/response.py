# Copyright © 2024 PMoS. All rights reserved.

from flowing.server.common import get_json_response

JSON_PARSE_ERROR_RESPONSE = get_json_response(400, "Get an unexpected JSON and can not be parsed")
JSON_NOT_DICT_ERROR_RESPONSE = get_json_response(400, "Get an unexpected JSON that is not a dictionary")

NOT_IMPLEMENTED_ERROR_RESPONSE = get_json_response(400, "Not implemented API")
