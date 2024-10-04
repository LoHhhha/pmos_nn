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

import flowing

"""
>>> python flowing_setup.py sdist bdist_wheel
"""

setup(
    name="flowing",
    version=flowing.__version__,
    author="0x4c48",
    author_email="lohhhha@qq.com",
    description="PMoS-flowing",
    packages=["flowing"],
    install_requires=[
        'torch',
        'opencv-python',
        'matplotlib',
        'tqdm',
        'numpy'
    ],
    include_package_data=True,
    package_data={
        '': [
            '*.tmpl',  # net template
            '*.md'
        ]
    },
)
