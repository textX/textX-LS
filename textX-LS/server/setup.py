import codecs
import os

from setuptools import find_packages, setup

PACKAGE_NAME = 'textx-ls-server'
VERSION = '0.1.0'
AUTHOR = 'textX team'
AUTHOR_EMAIL = 'danixeee@gmail.com'
DESCRIPTION = 'a language server for domain specific languages based on textX'
KEYWORDS = 'textX DSL python domain specific languages language server protocol pygls'
LICENSE = 'MIT'
URL = 'https://github.com/textX/textX-LS/server'

packages = find_packages()

print('packages:', packages)

README = codecs.open(os.path.join(os.path.dirname(__file__), 'README.md'),
                     'r', encoding='utf-8').read()

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
    install_requires=["pygls==0.7.2"],
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
