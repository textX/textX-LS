import { mkdtemp, unlink } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { commands, extensions, Uri, window } from "vscode";
import {
  CMD_GENERATE_EXTENSION, EXTENSION_GENERATOR_TARGET, VS_CMD_INSTALL_EXTENSION,
  VS_CMD_UNINSTALL_EXTENSION,
 } from "./constants";
import { ICommand, ITextXExtensionInstall, ITextXExtensionUninstall } from "./interfaces";

export function getCommands(command: string): ICommand {
  return {
    external: `textx/${command}`,
    internal: `textx.${command}`,
  };
}

// tslint:disable-next-line:max-line-length
export function mkdtempWrapper(callback: (folder: string) => Promise<void>): void {
  mkdtemp(join(tmpdir(), "textx-"), async (err, folder) => {
    if (err) {
      window.showErrorMessage(`Cannot create temp directory.`);
    }
    await callback(folder);
    unlink(folder, (unlinkErr) => unlinkErr );
  });
}

export function generateAndInstallExtension(projectName: string): Promise<ITextXExtensionInstall> {
  return new Promise((resolve) => {
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

      commands.executeCommand(VS_CMD_INSTALL_EXTENSION, Uri.file(extensionPath));
    });
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

    await commands.executeCommand(VS_CMD_UNINSTALL_EXTENSION, extensionName);
    resolve({ isActive, isUninstalled: true });
  });
}

export function textxExtensionName(name: string): string {
  return `textx.${name.toLowerCase()}`;
}
