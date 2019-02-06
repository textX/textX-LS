# flake8: noqa
import codecs
import os

from setuptools import find_packages, setup

PACKAGE_NAME = 'textx-ls-core'
VERSION = '0.1.0'
AUTHOR = 'textX team'
AUTHOR_EMAIL = 'danixeee@gmail.com'
DESCRIPTION = 'a core language server logic for domain specific languages based on textX'
KEYWORDS = 'textX DSL python domain specific languages'
LICENSE = 'MIT'
URL = 'https://github.com/textX/textX-LS/core'

packages = find_packages()

print('packages:', packages)

README = codecs.open(os.path.join(os.path.dirname(__file__), 'README.md'),
                     'r', encoding='utf-8').read()

dev_require = [
    "bandit==1.5.1",
    "flake8==3.7.1"
]

tests_require = [
    "pytest==4.0.2"
]

setup(
    name=PACKAGE_NAME,
    version=VERSION,
    description=DESCRIPTION,
    long_description=README,
    long_description_content_type='text/markdown',
    url=URL,
    author=AUTHOR,
    author_email=AUTHOR_EMAIL,
    keywords=KEYWORDS,
    license=LICENSE,
    packages=packages,
    include_package_data=True,
    package_data={'': ['*.tx']},
    install_requires=["textX==1.8.0", "click==7.0"],
    extras_require={
        'dev': dev_require,
        'test': tests_require,
    },
    tests_require=tests_require,
    entry_points={
        'textx_command_groups': [
            'ls = textx_ls_core.cli:create_textxls_cli'
        ],
        'textxls_langs': [
            'textx = textx_ls_core.languages.textx:TextXLang',
            'textxfile = textx_ls_core.languages.textxfile:TextxfileLang'
        ]
    },
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Intended Audience :: Developers',
        'Intended Audience :: Information Technology',
        'Topic :: Software Development :: Libraries :: Python Modules',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 3 :: Only',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
    ]
)
