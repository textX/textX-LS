import { existsSync } from "fs";
import { join } from "path";
import { ExtensionContext, ProgressLocation, window, extensions } from "vscode";
import { LS_WHEELS_DIR, TEXTX_LS_CORE, TEXTX_LS_SERVER } from "./constants";
import { execAsync, readdirAsync } from "./utils";

async function checkPythonVersion(python: string): Promise<boolean> {
  try {
    const [major, minor] = await getPythonVersion(python);
    return major === 3 && minor > 7;
  } catch {
    return false;
  }
}

async function getPython(): Promise<string> {
  // 1. Try python configured through Python extension "Select Interpreter"
  const pythonExt = extensions.getExtension('ms-python.python');
  if (pythonExt) {
    await pythonExt.activate();
    const api = pythonExt.exports;
    const envPath = api.environments?.getActiveEnvironmentPath?.();
    console.log('Active Python environment:', envPath);
    return envPath?.path;
  }

  // 2. Fallback to VIRTUAL_ENV python (if in virtual environment)
  const virtualEnvPython = process.env.VIRTUAL_ENV
    ? join(process.env.VIRTUAL_ENV, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python')
    : undefined;

  if (virtualEnvPython && await checkPythonVersion(virtualEnvPython)) {
    return virtualEnvPython;
  }

  // 3. Try system python (cross-platform)
  const systemPython = await getSystemPythonPath(); // Implement this function based on OS
  if (systemPython && await checkPythonVersion(systemPython)) {
    return systemPython;
  }

  // 4. Finally prompt user
  const python = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: "Enter path to Python 3.8+ interpreter",
    prompt: "Could not find valid Python automatically. Please specify path to Python 3.8+",
    validateInput: async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return "Path cannot be empty";
      }
      return await checkPythonVersion(trimmed)
        ? null
        : "Invalid Python (requires 3.8+)";
    },
  });

  if (python === undefined) {
    throw new Error("Python 3.8+ is required for this extension.");
  }

  return python.trim();
}

// Helper function to get system Python path
async function getSystemPythonPath(): Promise<string | undefined> {
  const candidates = [
    'python3',  // Unix-like systems
    'python',   // Windows/fallback
    'python38', // Specific version fallbacks
    'python3.8'
  ];

  for (const cmd of candidates) {
    try {
      const result = await execAsync(`${cmd} --version`, { stdio: 'pipe' });
      if (result) {
        return cmd;
      }
    } catch {
      continue;
    }
  }
  return undefined;
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

/**
 * Get the package name from an editable-installed Python project.
 * @param projectPath - Absolute path to the Python project.
 * @returns Package name (or `undefined` if not found).
 */
export async function getEditablePackageName(projectPath: string): Promise<string | undefined> {
  const python = await getPython();
  const jsonPackageMetadata = await execAsync(`${python} -m pip list --editable --format json`);
  try {
      const packages = JSON.parse(jsonPackageMetadata);
      const foundPackage = packages.find((pkg: any) =>
          pkg.editable_project_location.toLowerCase() === projectPath.toLowerCase()
      );
      return foundPackage?.name;
  } catch (e) {
      console.error(`Failed to parse pip output: ${e}`);
  }
}

function isNewerVersion(candidate: number[], installed: number[]): boolean {
  for (let i = 0; i < 3; i++) {
    if (candidate[i] !== installed[i]) {
      return candidate[i] > installed[i];
    }
  }
  return false;
}

async function findBundledWheel(
  wheelsPath: string,
  distribution: string,
): Promise<{ file: string; version: number[] } | null> {
  if (!existsSync(wheelsPath)) {
    return null;
  }
  const files = await readdirAsync(wheelsPath);
  const prefix = `${distribution}-`;
  const wheel = files.find((file) => file.startsWith(prefix) && file.endsWith(".whl"));
  if (!wheel) {
    return null;
  }
  const version = wheel.slice(prefix.length).split("-")[0]
    .split(".")
    .map((part) => Number.parseInt(part, 10));
  if (version.length !== 3 || version.some((part) => Number.isNaN(part))) {
    return null;
  }
  return { file: wheel, version };
}

async function bundledWheelIfNewer(
  python: string,
  wheelsPath: string,
  distribution: string,
): Promise<{ file: string; version: number[] } | null> {
  const bundled = await findBundledWheel(wheelsPath, distribution);
  if (!bundled) {
    return null;
  }
  const installed = await getPackageVersion(python, distribution);
  if (installed && !isNewerVersion(bundled.version, installed)) {
    return null;
  }
  return bundled;
}

async function upgradeBundledWheelsIfNewer(python: string, wheelsPath: string): Promise<void> {
  const core = await bundledWheelIfNewer(python, wheelsPath, TEXTX_LS_CORE);
  const server = await bundledWheelIfNewer(python, wheelsPath, TEXTX_LS_SERVER);
  if (!core && !server) {
    return;
  }

  await window.withProgress({
    location: ProgressLocation.Notification,
  }, async (progress) => {
    progress.report({ message: "Updating textX language server..." });
    if (core) {
      await execAsync(`${python} -m pip install --upgrade ${core.file}[vscode]`, { cwd: wheelsPath });
    }
    if (server) {
      await execAsync(`${python} -m pip install --upgrade ${server.file}`, { cwd: wheelsPath });
    }
  });
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
    await upgradeBundledWheelsIfNewer(python, join(context.extensionPath, LS_WHEELS_DIR));
    return python;
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

        // Install vscode and syntax coloring generators
        await execAsync(`${python} -m pip install textx-gen-vscode`);
        await execAsync(`${python} -m pip install textx-gen-coloring`);

        window.showInformationMessage("textX extension is ready! :)");
        resolve(python);
      } catch (err) {
        reject(err);
      }
    });
  });

}


