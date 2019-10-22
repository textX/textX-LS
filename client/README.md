<h1 align="center">
  <br>
    <img src="https://raw.githubusercontent.com/textX/textX/master/art/textX-logo.png?raw=true" alt="logo" width="300">
  <br>
  for VS Code
</h1>

<h4 align="center">Provides a "smartness" to any textX language</h4>

---

[![Build Status](https://dev.azure.com/textX/textX-LS/_apis/build/status/textX.textX-LS?branchName=master)](https://dev.azure.com/textX/textX-LS/_build/latest?branchName=master) [![MIT licensed](https://img.shields.io/cocoapods/l/AFNetworking.svg)](https://raw.githubusercontent.com/textX/textX-LS/master/LICENSE)

textX for VS Code extension provides a syntax highlighting and intellisense for all domain specific languages based on [textX](https://github.com/textX/textX) using a [textX language server](https://github.com/textX/textX-LS).

## Features

### Install/Uninstall textX Language Project

There are two options for _installing_ a textX language project:

- **editable mode** - by _right_ clicking on a project root directory, or a _setup.py_ file and clicking on `Install textX project`
- **from wheel** - by opening a _textX view_, clicking on a _plus_ (+) icon and choosing a wheel (previously built manually)

Install in an editable mode|  Install from a wheel
:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/textX/textX-LS/master/client/media/install-project-editable.png" width="350" height="500" /> |  <img src="https://raw.githubusercontent.com/textX/textX-LS/master/client/media/install-project-wheel.png" width="400" height="500" />

Project could be uninstalled either from a context menu or by clicking on a _recycle bin_ icon (shows on hover), after which confirmation dialog will be shown.

> **NOTE**: If the VS Code extension for a language is previously been activated (used), VS Code window will be restarted.

<img src="https://raw.githubusercontent.com/textX/textX-LS/master/client/media/uninstall-project.png"/>

### Languages / Generators Preview

Registered textX languages and generators are listed in _textX view_.

<img src="https://raw.githubusercontent.com/textX/textX-LS/master/client/media/textX-view.png" width="250" height="600" />

### Model / Meta-model Validation

Metamodel validation|  Model validation
:-------------------------:|:-------------------------:
<img src="https://raw.githubusercontent.com/textX/textX-LS/master/client/media/metamodel-validation.png" width="350" height="400" /> |  <img src="https://raw.githubusercontent.com/textX/textX-LS/master/client/media/model-validation.png" width="350" height="400" />

### Default Syntax Highlighting

See images above.

> **NOTE**: Syntax highlighting for a languages installed in an editable mode is little bit hackish and not perfect, but it allows repaint model on grammar changes. See the following section.

### Live Reload in Editable Mode

When textX project is installed in **editable mode**, the extension watches for a `.tx` (grammar) file changes and generates a new syntax highlighting information from the changed grammar. Extension then re-paints and re-validates opened files.

<img src="https://raw.githubusercontent.com/textX/textX-LS/master/client/media/live-reload.png" width="800" height="550" />
