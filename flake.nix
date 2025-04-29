# This Nix flake enable reproducible development environment.
# It provides the right Python version with needed system level libraries.
#
# Install Nix package manager: https://nixos.org/download/
# Be sure to configure flake feature by adding:
# experimental-features = nix-command flakes
# to ~/.config/nix/nix.conf
# See more here: https://nixos.wiki/wiki/flakes
#
# To run this flake: nix develop
# You will get bash shell with venv activated
{
  description = "A flake for VS Code, Python and required dependencies";
  inputs = {
    nixpkgs-old = {
      url = "github:NixOS/nixpkgs/253272ce9f1d83dfcd80946e63ef7c1d6171ba0e";
      flake = false;
    };
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-20.03";  # Stable release with good Python 3.8 support
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs-old, nixpkgs, flake-utils, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        oldPkgs = import nixpkgs-old { inherit system; config.allowUnfree = true; };
        pkgs = import nixpkgs { inherit system; config.allowUnfree = true; };

        old-vscode = oldPkgs.vscode.overrideAttrs (old: {
          src = builtins.fetchurl {
            url = "https://update.code.visualstudio.com/1.36.1/linux-x64/stable";
            sha256 = "1ck13xpnfklfc81jd8d5md09fcp0gjypacdqj276mzhr5mig29cd";
          };
          sourceRoot = ".";
          unpackCmd = "tar xzf $src --strip-components=1";
        });

        pythonEnv = pkgs.python38.withPackages (ps: with ps; [
          pip
          setuptools
          virtualenv
        ]);

      in {
        devShells.default = pkgs.mkShell {
          name = "old-vscode-dev";
          buildInputs = [
            old-vscode
            pythonEnv
          ];

          venvDir = "./venv";
          shellHook = ''
            echo "=== Creating Python virtual env and installing deps ==="
            # Create virtualenv if it doesn't exist
            if [ ! -d "$venvDir" ]; then
              python -m venv "$venvDir"

              # Activate the virtualenv
              source "$venvDir/bin/activate"

              pip install --upgrade pip
              pip install -r requirements.txt
            else
              # Activate the virtualenv
              source "$venvDir/bin/activate"
            fi

            # Add virtualenv packages to PYTHONPATH for pylint
            export PYTHONPATH="$PWD/$venvDir/${pythonEnv.sitePackages}:$PYTHONPATH"
          '';
        };
      }
    );
}
