import { mkdtemp, readFileSync, unlink } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { commands, extensions, Uri, window, workspace } from "vscode";
import {
  CMD_GENERATE_EXTENSION, EXTENSION_GENERATOR_TARGET, VS_CMD_INSTALL_EXTENSION,
  VS_CMD_UNINSTALL_EXTENSION,
} from "./constants";
import { ICommand, ITextXExtensionInstall, ITextXExtensionUninstall } from "./interfaces";
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
    const theme = JSON.parse(readFileSync(themePath).toString()); // change to async
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

export function generateAndInstallExtension(projectName: string): Promise<ITextXExtensionInstall> {
  return new Promise(async (resolve) => {
    mkdtempWrapper(async (folder) => {
      const extensionPath = await commands.executeCommand<string>(
        CMD_GENERATE_EXTENSION.external, projectName, EXTENSION_GENERATOR_TARGET, folder,
      );

      extensions.onDidChange((_) => {
        const extensionName = extensionPath.split("\\").pop().split("/").pop().split(".")[0];
        const extension = extensions.getExtension(textxExtensionName(extensionName));
        const isActive = extension === undefined ? false : extension.isActive;
        resolve({extension, isActive, isInstalled: extension !== undefined });
      });

      await commands.executeCommand(VS_CMD_INSTALL_EXTENSION, Uri.file(extensionPath));
    });
  });
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

export function uninstallExtension(projectName: string): Promise<ITextXExtensionUninstall> {
  return new Promise(async (resolve) => {
    const extensionName = textxExtensionName(projectName);
    let extension = extensions.getExtension(extensionName);
    const isActive = extension === undefined ? false : extension.isActive;

    extensions.onDidChange((_) => {
      // If extension is NOT active
      extension = extensions.getExtension(extensionName);
      resolve({ isActive, isUninstalled: extension === undefined });
    });

    try {
      await commands.executeCommand(VS_CMD_UNINSTALL_EXTENSION, extensionName);
      resolve({ isActive, isUninstalled: true });
    } catch (_) {
      resolve({ isActive, isUninstalled: false});
    }
  });
}

export function textxExtensionName(name: string): string {
  return `textX.${name.toLowerCase().replace(/_/g, "-")}`;
}
