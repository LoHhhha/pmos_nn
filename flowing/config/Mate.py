import os

VERSION = '0.2.202508'
WEB_VERSION = '0.2.alpha202508'
PACKAGE_NAME = 'flowing'
PACKAGE_FULL_NAME = f'PMoS.nn.{PACKAGE_NAME}'
OWNER = 'PMoS'
PACKAGE_PATH = os.path.dirname(__file__)

while PACKAGE_PATH != os.path.dirname(PACKAGE_PATH) and PACKAGE_PATH.split(os.sep)[-1] != PACKAGE_NAME:
    PACKAGE_PATH = os.path.dirname(PACKAGE_PATH)

del os
