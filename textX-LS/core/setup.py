# flake8: noqa
import codecs
import os
from platform import python_version

from setuptools import find_packages, setup

PACKAGE_NAME = "textx-ls-core"
VERSION = "0.2.0"
AUTHOR = "Daniel Elero"
AUTHOR_EMAIL = "danixeee@gmail.com"
DESCRIPTION = (
    "a core language server logic for domain specific languages based on textX"
)
KEYWORDS = "textX DSL python domain specific languages"
LICENSE = "MIT"
URL = "https://github.com/textX/textX-LS/core"

packages = find_packages()

print("packages:", packages)

README = codecs.open(
    os.path.join(os.path.dirname(__file__), "README.md"), "r", encoding="utf-8"
).read()

dev_require = ["bandit==1.5.1", "flake8==3.7.7", "textx_gen_vscode>=0.1.3"]

tests_require = ["coverage==4.5.3", "pytest==4.3.1", "pytest-cov==2.6.1"]

# pip install textx_ls_core[vscode]
vscode_require = ["textx_gen_vscode>=0.1.3"]


if python_version().startswith("3.6"):  # For python 3.6
    dev_require.append("black")


setup(
    name=PACKAGE_NAME,
    version=VERSION,
    description=DESCRIPTION,
    long_description=README,
    long_description_content_type="text/markdown",
    url=URL,
    author=AUTHOR,
    author_email=AUTHOR_EMAIL,
    keywords=KEYWORDS,
    license=LICENSE,
    packages=packages,
    include_package_data=True,
    package_data={"": ["*.tx"]},
    install_requires=["textX>=2.1.0", "wheel_inspect==1.3.0"],
    extras_require={
        "dev": dev_require,
        "test": tests_require,
        "vscode": vscode_require,
    },
    tests_require=tests_require,
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
