# flake8: noqa
import codecs
import os

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

dev_require = ["bandit==1.7.9", "black==24.4.2", "flake8==7.0.0", "textx_gen_vscode>=0.1.3"]

tests_require = ["coverage==7.5.3", "pytest==8.2.2", "pytest-cov==5.0.0"]

# pip install textx_ls_core[vscode]
vscode_require = ["textx_gen_vscode>=0.1.3"]


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
    install_requires=["textX>=4.0.1", "wheel_inspect==1.7.1"],
    extras_require={
        "dev": dev_require,
        "test": tests_require,
        "vscode": vscode_require,
    },
    tests_require=tests_require,
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 2 - Pre-Alpha",
        "Intended Audience :: Developers",
        "Intended Audience :: Information Technology",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
)
