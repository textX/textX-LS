import { mkdtemp, readFileSync, unlink } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { extensions, window, workspace } from "vscode";
import { ICommand } from "./interfaces";
import { TokenColors } from "./types";

export function getCommands(command: string): ICommand {
  return {
    external: `textx/${command}`,
    internal: `textx.${command}`,
  };
}

export function getCurrentTheme(): string {
  return workspace.getConfiguration("workbench").get("colorTheme");
}

export function getTokenColorsForTheme(themeName: string): TokenColors {
  const tokenColors = new Map();
  let currentThemePath;
  for (const extension of extensions.all) {
    const themes = extension.packageJSON.contributes && extension.packageJSON.contributes.themes;
    const currentTheme = themes && themes.find((theme) => theme.id === themeName);
    if (currentTheme) {
      currentThemePath = join(extension.extensionPath, currentTheme.path);
      break;
    }
  }
  const themePaths = [];
  if (currentThemePath) { themePaths.push(currentThemePath); }
  while (themePaths.length > 0) {
    const themePath = themePaths.pop();
    const theme = safelyLoadJSON(themePath);
    if (theme) {
      if (theme.include) {
        themePaths.push(join(dirname(themePath), theme.include));
      }
      if (theme.tokenColors) {
        theme.tokenColors.forEach((rule) => {
          if (typeof rule.scope === "string" && !tokenColors.has(rule.scope)) {
            tokenColors.set(rule.scope, rule.settings);
          } else if (rule.scope instanceof Array) {
            rule.scope.forEach((scope) => {
              if (!tokenColors.has(rule.scope)) {
                tokenColors.set(scope, rule.settings);
              }
            });
          }
        });
      }
    }
  }
  return tokenColors;
}

export function mkdtempWrapper(callback: (folder: string) => Promise<void>): void {
  mkdtemp(join(tmpdir(), "textx-"), async (err, folder) => {
    if (err) {
      window.showErrorMessage(`Cannot create temp directory.`);
    }
    await callback(folder);
    unlink(folder, (unlinkErr) => unlinkErr );
  });
}

function removeJSONErrors(jsonStr: string): string {
  jsonStr = jsonStr.replace(/,[\n|\s]*?(?=\]|\})/g, ""); // removes trailing commas
  jsonStr = JSON.parse(JSON.stringify(jsonStr)); // removes comments
  return jsonStr;
}

export function safelyLoadJSON(path: string): any {
  const jsonStr = readFileSync(path).toString()
  try {
    return JSON.parse(jsonStr);
  } catch {
    return JSON.parse(removeJSONErrors(jsonStr));
  }
}

export function timeoutPromise<T>(ms: number, promise: Promise<T>): Promise<T> {
  const timeout = new Promise((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject();
    }, ms);
  });

  return Promise.race<any>([
    promise,
    timeout,
  ]);
}

export function textxExtensionName(name: string): string {
  return `textX.${name.toLowerCase().replace(/_/g, "-")}`;
}
