import { execSync } from "child_process";
import { injectable } from "inversify";
import { basename, dirname, join } from "path";
import { commands, languages, Uri, window } from "vscode";
import {
  CMD_GENERATE_EXTENSION, CMD_LANGUAGE_INSTALL, CMD_LANGUAGE_INSTALL_EDITABLE, CMD_LANGUAGE_LIST,
  CMD_LANGUAGE_SCAFFOLD, CMD_LANGUAGE_UNINSTALL, EXTENSION_GENERATOR_TARGET,
  VS_CMD_INSTALL_EXTENSION,
} from "../constants";
import { ITextXLanguage } from "../interfaces";
import { getPython } from "../setup";
import { LanguageNode } from "../ui/explorer/languageNode";
import { mkdtempWrapper } from "../utils";

export interface ILanguageService {
  getInstalled(): Promise<ITextXLanguage[]>;
  install(pyModulePath: string, editableMode?: boolean): Promise<void>;
  scaffold(languageName: string): void;
  uninstall(languageName: string): void;
}

@injectable()
export class LanguageService implements ILanguageService {

  constructor() {
    this.registerCommands();
  }

  public async getInstalled(): Promise<ITextXLanguage[]> {
    const langs = await commands.executeCommand<ITextXLanguage[]>(CMD_LANGUAGE_LIST.external);
    return langs || [];
  }

  public async install(pyModulePath: string, editableMode: boolean = false): Promise<void> {
    const langName = await commands.executeCommand<string>(CMD_LANGUAGE_INSTALL.external,
                                                           pyModulePath, editableMode);

    if (langName) {
      mkdtempWrapper(async (folder) => {
        const extensionPath = await commands.executeCommand<string>(
          CMD_GENERATE_EXTENSION.external, langName, EXTENSION_GENERATOR_TARGET, folder);

        if (extensionPath) {
          await commands.executeCommand(VS_CMD_INSTALL_EXTENSION, Uri.file(extensionPath));
        }
      });
    }
  }

  public scaffold(languageName: string): void {
    commands.executeCommand(CMD_LANGUAGE_SCAFFOLD.external, languageName);
  }

  public uninstall(languageName: string): void {
    commands.executeCommand(CMD_LANGUAGE_UNINSTALL.external, languageName);
  }

  private registerCommands() {
    commands.registerCommand(CMD_LANGUAGE_INSTALL.internal, async () => {
      const pyWheel = await window.showOpenDialog({
        canSelectMany: false,
        filters: {
          Wheels: ["whl"],
        },
      });

      if (pyWheel && pyWheel.length === 1) {
        this.install(pyWheel.pop().path);
      }
    });

    commands.registerCommand(CMD_LANGUAGE_INSTALL_EDITABLE.internal, async (fileOrFolder) => {
      if (fileOrFolder) {
        const path = fileOrFolder.path;
        const pyModulePath = basename(path) === "setup.py" ? dirname(path) : path;
        this.install(pyModulePath, true);
      } else {
        window.showErrorMessage("Cannot get python module path.");
      }
    });

    commands.registerCommand(CMD_LANGUAGE_SCAFFOLD.internal, async () => {
      const languageName = await window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: "Enter a language name.",
        validateInput: (value: string) => {
          if (value && value.trim().length > 0) {
            return null;
          } else {
            return "Language package name is required.";
          }
        },
      });

      if (languageName) {
        this.scaffold(languageName.trim());
       }
    });

    commands.registerCommand(CMD_LANGUAGE_UNINSTALL.internal, async (fileOrFolderOrTreeItem) => {
      let languageName = null;
      if (fileOrFolderOrTreeItem instanceof LanguageNode) {
        // Language name is not same as package name - REVISIT
        languageName = fileOrFolderOrTreeItem.label;
      } else {
        // Get language name from setup.py - REVISIT
        const path = fileOrFolderOrTreeItem.path;
        const setuppyPath = basename(path) === "setup.py" ? path : join(path, "setup.py");
        languageName = execSync(`${getPython()} ${setuppyPath} --name`);
      }

      if (languageName) {
        const decision = await window.showQuickPick(["Yes", "No"], {
          canPickMany: false,
          ignoreFocusOut: true,
          placeHolder: `Are you sure you want to delete ${languageName}?`,
        });

        if (decision === "Yes") {
          this.uninstall(languageName.toString().trim());
        }
      }
    });
  }
}
