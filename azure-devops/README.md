# Azure DevOps setup

This project uses Azure DevOps for CI/CD process.

## Continuous Integration

Every commit to any branch triggers the build and test pipeline on three different environments:

- macOS
- Linux
- Windows

_textX-LS-core_ and _textX-ls-server_ projects are tested for `3.5`, `3.6` and `3.7` versions of python.

Each successfully built commit ends up with 3 artifacts, for e.g. (also see picture below):

- textX-0.1.0+75a162ef.vsix
- textx_ls_core-0.1.0+75a162ef-py3-none-any.whl
- textx_ls_server-0.1.0+75a162ef-py3-none-any.whl

Artifacts versions are suffixed with 8 characters from git commit sha1.

<img src="../assets/azure-devops/artifacts.png" height="800px">

---

**NOTE**: Merge commits to the `master` branch and git `tags` won't append the suffix to artifact versions, because those artifacts are published to PyPI and Marketplace.

---

## Continuous Delivery

Continuous delivery is triggered after pushing git tags to the master branch.

This repository contains three projects, depending on which project we want to release, we can use three types of tags:

- core-0.1.0    - uploads _textX-LS-core_ package with version _0.1.0_ to PyPI
- server-1.3.2  - uploads _textX-LS-server_ package with version _1.3.2_ to PyPI
- vscode-0.12.5 - uploads _textX_ VS Code extension with version _0.12.5_ to Marketplace
