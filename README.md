# _textX-LS_

[![Build Status](https://dev.azure.com/textX/textX-LS/_apis/build/status/textX.textX-LS?branchName=master)](https://dev.azure.com/textX/textX-LS/_build/latest?definitionId=6&branchName=master) [![MIT licensed](https://img.shields.io/cocoapods/l/AFNetworking.svg)](https://raw.githubusercontent.com/textX/textX-LS/master/LICENSE)

_textX-LS_ is a language server that provides smartness for all domain specific languages based on [textX](https://github.com/textX/textX).

This repository consists of two python packages:

- _[textX-LS-core](https://github.com/textX/textX-LS/tree/master/textX-LS/core)_

- _[textX-LS-server](https://github.com/textX/textX-LS/tree/master/textX-LS/server)_

and a _Visual Studio Code_ extension:

- _[client](https://github.com/textX/textX-LS/tree/master/client)_

## :warning: This project got a new maintainer

After several years of inactivity this project is in a transition to a new maintainer.
Please see [this announcement](https://github.com/textX/textX-LS/issues/68).

## Required textX Generator Plugins

Building a custom VS Code extension for newly registered language is delegated to the _textx-vscode_ generator which uses _textx-coloring_ to produce a syntax highlighting _Textmate_ file.

- [textX-gen-vscode](https://github.com/danixeee/textx-gen-vscode)
- [textX-gen-coloring](https://github.com/danixeee/textx-gen-coloring)

## Features

- [x] language project registration/unregistration (editable mode is supported)
- [x] languages and generators preview
- [x] language VS Code extension generation and installation
- [x] model and meta-model validations
- [x] default syntax highlighting
- [x] live-reload on grammar changes (editable mode)
- [ ] configure and run generators
- [ ] language project scaffolding
- [ ] optional environment configuration
- [ ] code completion
- [ ] jump to definition
- [ ] find all references
- [ ] configurable syntax highlighting
- [ ] code folding
- [ ] symbols tree view
- [ ] [viewX](https://github.com/textX/viewX-vscode) integration

## Development Setup

This project requires _python 3.6_ and _node v10.16_ for development.

**Installation steps:**

1. `python -m venv env && source env/bin/activate`
1. `pip install -r requirements.txt`
1. `cd client && npm i`

To register _pre-commit_ hooks, run: `pre-commit install`
To run _pre-commit_ hooks manually: `pre-commit run --all-files`

**Running the extension in VS Code**:

In order to run the extension, **client** directory must be added as a workspace folder or opened as a root project.

Now, switch to _debug_ view, choose `Server + Client` option and press _F5_.

A new VS Code window should be opened in [examples](./examples) directory.

## CI/CD and Artifacts

Take a look at [build process](./azure-devops/README.md).

## License

MIT

## Legend

- **textX language project** is a python package that registers _one or more_ languages using a [textX registration API](https://github.com/textX/textX/blob/master/textx/registration.py)

- **textX generator project** is a python package that registers _one or more_ generators using a [textX registration API](https://github.com/textX/textX/blob/master/textx/registration.py)
