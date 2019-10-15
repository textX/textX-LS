import { injectable } from "inversify";
import { commands, extensions, Uri } from "vscode";
import { VS_CMD_INSTALL_EXTENSION, VS_CMD_UNINSTALL_EXTENSION } from "../constants";
import { ITextXExtensionInstall, ITextXExtensionUninstall } from "../interfaces";
import { textxExtensionName, timeoutPromise } from "../utils";

export interface IExtensionService {
  install(extensionPath: string): Promise<ITextXExtensionInstall>;
  uninstall(projectName: string): Promise<ITextXExtensionUninstall>;
}

@injectable()
export class ExtensionService implements IExtensionService {

  public async install(extensionPath: string): Promise<ITextXExtensionInstall> {
    const installExtensionPromise = new Promise<ITextXExtensionInstall>(async (resolve) => {
      // After the extension is installed, it should be caught here
      extensions.onDidChange(async (_) => {
        const extensionName = extensionPath.split("\\").pop().split("/").pop().split(".")[0];
        const extension = extensions.getExtension(textxExtensionName(extensionName));
        const isActive = extension === undefined ? false : extension.isActive;

        resolve({extension, isActive});
      });
      // Call VS Code command to install the extension
      await commands.executeCommand(VS_CMD_INSTALL_EXTENSION, Uri.file(extensionPath));
    });

    // Extension should be installed in less than 5 seconds, if not, promise will be rejected.
    return timeoutPromise<ITextXExtensionInstall>(5 * 1000, installExtensionPromise);
  }

  public uninstall(projectName: string): Promise<ITextXExtensionUninstall> {
    // After the extension is installed, it should be caught here
    const uninstallExtensionPromise = new Promise<ITextXExtensionUninstall>(async (resolve) => {
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
      } catch {} // tslint:disable-line: no-empty
    });

    // Extension should be uninstalled in less than 5 seconds, if not, promise will be rejected.
    return timeoutPromise<ITextXExtensionUninstall>(5 * 1000, uninstallExtensionPromise);
  }

}
