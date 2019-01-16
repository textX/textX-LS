import { execSync } from "child_process";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { ExtensionContext, ProgressLocation, window, workspace} from "vscode";
import { IS_WIN, LS_VENV_NAME, LS_WHEELS_DIR, TEXTX_LS_SERVER } from "./constants";

function createVirtualEnvironment(python: string, name: string, cwd: string): string {
  const path = join(cwd, name);
  if (!existsSync(path)) {
    const createVenvCmd = `virtualenv -p ${python} ${name}`;
    execSync(createVenvCmd, { cwd });
  }
  return path;
}

function getPython(): string {
  return workspace.getConfiguration("python").get<string>("pythonPath", getPythonCrossPlatform());
}

function getPythonCrossPlatform(): string {
  return IS_WIN ? "python" : "python3";
}

function getPythonFromVenvPath(venvPath: string): string {
  return IS_WIN ? join(venvPath, "Scripts", "python") : join(venvPath, "bin", "python");
}

function getPythonVersion(python: string): number[] {
  const getPythonVersionCmd = `${python} --version`;
  const version = execSync(getPythonVersionCmd).toString();
  return version.match(new RegExp(/\d/g)).map((v) => Number.parseInt(v));
}

function getVenvPackageVersion(python: string, name: string): number[] | null {
  const listPipPackagesCmd = `${python} -m pip show ${name}`;

  try {
    const packageInfo = execSync(listPipPackagesCmd).toString();
    const packageVersion = packageInfo.match(new RegExp(/Version: \d\.\d\.\d/g));
    return packageVersion.pop().match(new RegExp(/\d/g)).map((v) => Number.parseInt(v));

  } catch (err) {
    return null;
  }
}

function installAllWheelsFromDirectory(python: string, cwd: string) {
  readdirSync(cwd).forEach((file) => {
    if (file.endsWith(".whl")) {
      execSync(`${python} -m pip install ${file}`, { cwd });
    }
  });
}

function* installLS(context: ExtensionContext): IterableIterator<string> {
  yield "Installing textX language server";

  // Get python interpreter
  const python = getPython();
  // Check python version (3.5+ is required)
  const [major, minor] = getPythonVersion(python);
  if (major !== 3 || minor < 5) {
    throw new Error("Python 3.5+ is required!");
  }

  // Create virtual environment
  const venv = createVirtualEnvironment(python, LS_VENV_NAME, context.extensionPath);
  yield `Virtual Environment created in: ${venv}`;

  // Install source from wheels
  const venvPython = getPythonFromVenvPath(venv);
  const wheelsPath = join(context.extensionPath, LS_WHEELS_DIR);
  installAllWheelsFromDirectory(venvPython, wheelsPath);
  yield `Successfully installed textX-LS-core and textX-LS-server.`;
}

export async function installLSWithProgress(context: ExtensionContext): Promise<string> {
  // Check if LS is already installed
  const venvPython = getPythonFromVenvPath(join(context.extensionPath, LS_VENV_NAME));
  const isServerPackageInstalled = !!getVenvPackageVersion(venvPython, TEXTX_LS_SERVER);

  if (isServerPackageInstalled) {
    return Promise.resolve(venvPython);
  }

  // Install with progress bar
  return await window.withProgress({
    location: ProgressLocation.Window,
  }, (progress): Promise<string> => {
    return new Promise<string>((resolve, reject) => {

      // Catch generator errors
      try {
        // Go through installation steps
        for (const step of installLS(context)) {
          progress.report({ message: step });
        }

      } catch (err) {
        reject(err);
      }

      resolve(venvPython);
    });
  });

}
