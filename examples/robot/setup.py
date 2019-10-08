# flake8: noqa
import codecs
import os

from setuptools import find_packages, setup

PACKAGE_NAME = "tx-robot"
VERSION = "0.1.0"
AUTHOR = "textX team"
AUTHOR_EMAIL = "danixeee@gmail.com"
DESCRIPTION = "robot extension"
KEYWORDS = "textX DSL python domain specific languages robot"
LICENSE = "MIT"
URL = "https://github.com/textX/textX-LS/examples/robot"

setup(
    name=PACKAGE_NAME,
    version=VERSION,
    description=DESCRIPTION,
    url=URL,
    author=AUTHOR,
    author_email=AUTHOR_EMAIL,
    keywords=KEYWORDS,
    license=LICENSE,
    packages=find_packages(),
    include_package_data=True,
    package_data={"": ["*.tx"]},
    install_requires=["textx_ls_core"],
    entry_points={"textx_languages": ["robot = tx_robot:robot"]},
    classifiers=[
        "Development Status :: 2 - Pre-Alpha",
        "Intended Audience :: Developers",
        "Intended Audience :: Information Technology",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
    ],
)
