{
  description = "A reproducible environment for textX-LS development";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };

        # Python development environment
        pythonEnv = pkgs.python311.withPackages (ps: with ps; [
          pip
          setuptools
          black
          pytest
          pytest-cov
          python-lsp-server
          debugpy
        ]);

        deps = with pkgs; [
          vscode
          nodejs
          typescript
          vscode-with-extensions
          ruff
        ];

      in {
        devShells.default = pkgs.mkShell {
          packages = [ pythonEnv ] ++ deps;

          VIRTUAL_ENV = "./venv";
          shellHook = ''
            echo "Python environment env: ${pythonEnv}"
            echo "Node.js version: $(node --version)"

            # Create .env file if it doesn't exist
            if [ ! -f .env ]; then
              echo "PYTHONPATH=$PWD" > .env
              echo "Creating .env file with PYTHONPATH"
            fi

            # Create virtualenv if it doesn't exist
            if [ ! -d "$VIRTUAL_ENV" ]; then
              echo "=== Creating Python virtual env and installing deps ==="
              python -m venv "$VIRTUAL_ENV"

              # Activate the virtualenv
              source "$VIRTUAL_ENV/bin/activate"

              pip install --upgrade pip
              pip install -r requirements.txt
            else
              # Activate the virtualenv
              source "$VIRTUAL_ENV/bin/activate"
            fi

            echo "Ready for the development!"
          '';

        };
      });
}
