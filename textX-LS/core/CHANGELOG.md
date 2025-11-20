# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog][keepachangelog],
and this project adheres to [Semantic Versioning][semver].

## [0.3.1]

### Fixed
- Support Python older than 3.11

## [0.3.0] (released 2025-05-09)

### Added
- dev: debug adapter and protocol

### Changed
- Use Nix flake for creating development setup.
- User virtual env is used for client VS Code extension so it can be interacted
  with from the CLI easily.
- Python is searched in user virtual env (env variable VIRUAL_ENV) or using
  setup from MS Python extension.
- Moved to pyproject.toml
- dropped dependency to setuptools pkg_resources
- use flit for build
- moved to logging module for server and deps
- Removed dependency to vsce (change in textx-gen-vscode)
- improved dynamic syntax highlighting
- more robust LSP server connection handling
- LSP server restarts on client close
- improved IO LSP communication

### Fixed
- added lsprotocol server dependency
- race condition on activation
- better error reporting on installation failure and other errors

## [0.1.2] (released 12/30/2019)

### Fixed

- Pass project root when loading models ([#37])
- Prevent server idle state on windows ([#26])

[#37]: https://github.com/textX/textX-LS/pull/37
[#26]: https://github.com/textX/textX-LS/pull/26

## [0.1.1] (released 12/29/2019)

### Changed

- Read python path from input-box if not found automatically ([#23])

### Fixed

- Various fixes for windows platform ([#23])

[#23]: https://github.com/textX/textX-LS/pull/23

## [0.1.0] (released 10/22/2019)

### Added

- Implement a mechanism to install/uninstall textX language project ([#18])
- Generate and install VS Code extension for installed language project ([#18])
- Add custom activity bar with registered languages and generator ([#18])
- Use webpack to optimize VS Code extension ([#16])

[#18]: https://github.com/textX/textX-LS/pull/18
[#16]: https://github.com/textX/textX-LS/pull/16/
[keepachangelog]: https://keepachangelog.com/en/1.0.0/
[semver]: https://semver.org/spec/v2.0.0.html
[unreleased]: https://github.com/textX/textX-LS/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/textX/textX-LS/compare/v0.1.0...v0.1.2
[0.1.1]: https://github.com/textX/textX-LS/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/textX/textX-LS/compare/1f9a72a73cf69411587644d2715f2e6adf79e0ea...v0.1.0
