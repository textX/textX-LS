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
          config = { allowUnfree = true; };
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


        esbuildPMExtension = pkgs.vscode-utils.extensionFromVscodeMarketplace {
          name = "esbuild-problem-matchers";
          publisher = "connor4312";
          version = "0.0.3";
          sha256 = "esLqld9bTlFJ9/qx4qlIx1F3MtMZpr8G9/FMqGvAvtg=";
        };

        vscode-with-extensions = pkgs.vscode-with-extensions.override {
          vscodeExtensions = with pkgs.vscode-extensions; [
            ms-python.python
            ms-python.debugpy
            esbuildPMExtension
          ];
        };

        deps = with pkgs; [
          nodejs
          typescript
          vscode-with-extensions
          ruff
        ];

      in {
        devShells.default = pkgs.mkShell {
          packages = [ pythonEnv ] ++ deps;

          venvDir = "./venv";
          shellHook = ''
            echo "Python environment env: ${pythonEnv}"
            echo "Node.js version: $(node --version)"

            # Create .env file if it doesn't exist
            if [ ! -f .env ]; then
              echo "PYTHONPATH=$PWD" > .env
              echo "Creating .env file with PYTHONPATH"
            fi

            # Create virtualenv if it doesn't exist
            if [ ! -d "$venvDir" ]; then
              echo "=== Creating Python virtual env and installing deps ==="
              python -m venv "$venvDir"

              # Activate the virtualenv
              source "$venvDir/bin/activate"

              pip install --upgrade pip
              pip install -r requirements.txt
            else
              # Activate the virtualenv
              source "$venvDir/bin/activate"
            fi

            echo "Ready for the development!"
          '';

        };
      });
}
