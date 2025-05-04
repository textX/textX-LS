import { existsSync } from "fs";
import { join } from "path";
import { ExtensionContext, ProgressLocation, window, workspace } from "vscode";
import { IS_WIN, LS_WHEELS_DIR, TEXTX_LS_SERVER } from "./constants";
import { execAsync, readdirAsync } from "./utils";

async function checkPythonVersion(python: string): Promise<boolean> {
  try {
    const [major, minor] = await getPythonVersion(python);
    return major === 3 && minor > 7;
  } catch {
    return false;
  }
}

export async function getPython(): Promise<string> {
  let python = workspace.getConfiguration("python").get<string>("defaultInterpreterPath", getPythonCrossPlatform());
  if (await checkPythonVersion(python)) {
    return python;
  }

  python = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "Enter a path to the python 3.8+.",
    prompt: "This python will be used to install necessary dependencies. You can use Python from a venv.",
    validateInput: async (value: string) => {
      if (await checkPythonVersion(value)) {
        return null;
      } else {
        return "Not a valid python path!";
      }
    },
  });

  // User canceled the input
  if (python === "undefined") {
    throw new Error("Python 3.8+ is required!");
  }

  return python;
}

function getPythonCrossPlatform(): string {
  return IS_WIN ? "python" : "python3";
}

async function getPythonVersion(python: string): Promise<number[]> {
  const getPythonVersionCmd = `${python} --version`;
  const version = await execAsync(getPythonVersionCmd);
  return version.match(new RegExp(/\d+/g)).map((v) => Number.parseInt(v));
}

async function getPackageVersion(python: string, name: string): Promise<number[] | null> {
  const listPipPackagesCmd = `${python} -m pip show ${name}`;
  try {
    const packageInfo = await execAsync(listPipPackagesCmd);
    const packageVersion = packageInfo.match(new RegExp(/Version: \d\.\d\.\d/g));
    return packageVersion.pop().match(new RegExp(/\d/g)).map((v) => Number.parseInt(v));
  } catch (err) {
    return null;
  }
}

async function installAllWheelsFromDirectory(python: string, cwd: string) {
  // install wheels
  const files = await readdirAsync(cwd);
  for (const file of files.filter((f) => f.endsWith(".whl"))) {
    await execAsync(`${python} -m pip install ${file}[vscode]`, { cwd });
  }
  // override requirements - must not be called in production
  if (existsSync(join(cwd, "requirements-dev.txt"))) {
    await execAsync(`${python} -m pip install --upgrade --force-reinstall -r requirements-dev.txt`, { cwd });
  }
}

export async function installLSWithProgress(context: ExtensionContext): Promise<string> {
  // Check if LS is already installed
  let python = await getPython();
  const isServerPackageInstalled = !!(await getPackageVersion(python, TEXTX_LS_SERVER));

  if (isServerPackageInstalled) {
    return Promise.resolve(python);
  }

  // Install with progress bar
  return window.withProgress({
    location: ProgressLocation.Notification,
  }, (progress): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
      try {
        progress.report({ message: "Installing textX language server..." });

        // Install source from wheels
        const wheelsPath = join(context.extensionPath, LS_WHEELS_DIR);
        await installAllWheelsFromDirectory(python, wheelsPath);

        window.showInformationMessage("textX extension is ready! :)");
        resolve(python);
      } catch (err) {
        reject(err);
      }
    });
  });

}


