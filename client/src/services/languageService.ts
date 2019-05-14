import { execSync } from "child_process";
import { injectable } from "inversify";
import { basename, dirname, join } from "path";
import { commands, window } from "vscode";
import {
  CMD_GET_LANGUAGES, CMD_INSTALL_LANGUAGE, CMD_INSTALL_LANGUAGE_EDITABLE, CMD_SCAFFOLD_LANGUAGE,
  CMD_UNINSTALL_LANGUAGE,
} from "../constants";
import { ITextXLanguage } from "../interfaces";
import { getPython } from "../setup";
import { LanguageNode } from "../ui/explorer/languageNode";

export interface ILanguageService {
  getInstalled(): Promise<ITextXLanguage[]>;
  install(pyModulePath: string, editableMode?: boolean): void;
  scaffold(languageName: string): void;
  uninstall(languageName: string): void;
}

@injectable()
export class LanguageService implements ILanguageService {

  constructor() {
    this.registerCommands();
  }

  public async getInstalled(): Promise<ITextXLanguage[]> {
    const langs = await commands.executeCommand<ITextXLanguage[]>(CMD_GET_LANGUAGES.external);
    return langs || [];
  }

  public install(pyModulePath: string, editableMode: boolean = false): void {
    commands.executeCommand(CMD_INSTALL_LANGUAGE.external, pyModulePath, editableMode);
  }

  public scaffold(languageName: string): void {
    commands.executeCommand(CMD_SCAFFOLD_LANGUAGE.external, languageName);
  }

  public uninstall(languageName: string): void {
    commands.executeCommand(CMD_UNINSTALL_LANGUAGE.external, languageName);
  }

  private registerCommands() {
    commands.registerCommand(CMD_INSTALL_LANGUAGE.internal, async () => {
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

    commands.registerCommand(CMD_INSTALL_LANGUAGE_EDITABLE.internal, async (fileOrFolder) => {
      if (fileOrFolder) {
        const path = fileOrFolder.path;
        const pyModulePath = basename(path) === "setup.py" ? dirname(path) : path;
        this.install(pyModulePath, true);
      } else {
        window.showErrorMessage("Cannot get python module path.");
      }
    });

    commands.registerCommand(CMD_SCAFFOLD_LANGUAGE.internal, async () => {
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

    commands.registerCommand(CMD_UNINSTALL_LANGUAGE.internal, async (fileOrFolderOrTreeItem) => {
      let languageName = null;
      if (fileOrFolderOrTreeItem instanceof LanguageNode) {
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
