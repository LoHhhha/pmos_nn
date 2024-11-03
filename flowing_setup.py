"""
  _____  _______  _____  _______
 |_____] |  |  | |     | |______
 |       |  |  | |_____| ______|

Copyright © 2024 PMoS. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
"""

from setuptools import setup, find_packages

from flowing.config import VERSION

"""
how to use this?
>>> python flowing_setup.py bdist_wheel
"""

setup(
    name="flowing",
    version=VERSION,
    author="0x4c48",
    author_email="lohhhha@qq.com",
    description="PMoS-flowing",
    packages=[f"flowing.{package}" for package in find_packages("flowing")],
    install_requires=[
        'torch',
        'opencv-python',
        'matplotlib',
        'tqdm',
        'numpy',
        'fastapi',
        'uvicorn',
        'autopep8'
    ],
    include_package_data=True,
    package_data={
        "": [
            "*.md",
        ],
        "flowing.net.template": [
            "*.tmpl",  # net template
        ],
        "flowing.server": [
            "public/**/*",  # frontend
        ]
    },
)
