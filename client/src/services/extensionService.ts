import { injectable } from "inversify";
import { commands, extensions, Uri } from "vscode";
import { VS_CMD_INSTALL_EXTENSION, VS_CMD_UNINSTALL_EXTENSION } from "../constants";
import { ITextXExtensionInstall, ITextXExtensionUninstall } from "../interfaces";
import { textxExtensionName, timeoutPromise } from "../utils";

export interface IExtensionService {
  install(extensionPath: string, projectVersion: string): Promise<ITextXExtensionInstall>;
  uninstall(projectName: string): Promise<ITextXExtensionUninstall>;
}

@injectable()
export class ExtensionService implements IExtensionService {

  public async install(extensionPath: string, projectVersion: string): Promise<ITextXExtensionInstall> {
    const extensionName = extensionPath.split("\\").pop().split("/").pop().split(".")[0];
    const oldExtension = extensions.getExtension(textxExtensionName(extensionName));
    const oldExtensionVersion = oldExtension !== undefined ? oldExtension.packageJSON.version : null;

    const installExtensionPromise = new Promise<ITextXExtensionInstall>(async (resolve) => {
      // After the extension is installed, it should be caught here
      extensions.onDidChange(async (_) => {
        const extension = extensions.getExtension(textxExtensionName(extensionName));
        const isActive = extension === undefined ? false : extension.isActive;

        resolve({extension, isActive, isUpdated: false});
      });
      // Call VS Code command to install the extension
      await commands.executeCommand(VS_CMD_INSTALL_EXTENSION, Uri.file(extensionPath));
    });

    // Extension should be installed in less than 10 seconds, if not, promise will be rejected.
    return new Promise((resolve, reject) => {
      timeoutPromise<ITextXExtensionInstall>(10 * 1000, installExtensionPromise)
        .then((installed) => {
          resolve(installed);
        })
        .catch((_) => {
          // Check if extension already existed (version update)
          const newExtension = extensions.getExtension(textxExtensionName(extensionName));
          if (newExtension !== undefined) {
            if (projectVersion === oldExtensionVersion) {
              resolve({extension: newExtension, isActive: newExtension.isActive, isUpdated: false});
            } else {
              resolve({extension: newExtension, isActive: newExtension.isActive, isUpdated: true});
            }
          } else {
            reject();
          }
        });
    });
  }

  public uninstall(projectName: string): Promise<ITextXExtensionUninstall> {
    // After the extension is installed, it should be caught here
    return new Promise<ITextXExtensionUninstall>(async (resolve) => {
      const extensionName = textxExtensionName(projectName);
      let extension = extensions.getExtension(extensionName);
      const isActive = extension === undefined ? false : extension.isActive;

      extensions.onDidChange((_) => {
        // If extension is NOT active
        extension = extensions.getExtension(extensionName);
        resolve({isActive});
      });

      try {
        // Call VS Code command to uninstall the extension
        await commands.executeCommand(VS_CMD_UNINSTALL_EXTENSION, extensionName);
        resolve({isActive});
      } catch {
        resolve({isActive: false});
      }
    });
  }

}
