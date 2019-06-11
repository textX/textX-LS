import { execSync } from "child_process";
import { inject, injectable } from "inversify";
import { basename, dirname, join } from "path";
import { commands, Uri, window } from "vscode";
import {
  CMD_GENERATE_EXTENSION, CMD_LANGUAGE_LIST, CMD_LANGUAGE_LIST_REFRESH, CMD_PROJECT_INSTALL,
  CMD_PROJECT_INSTALL_EDITABLE, CMD_PROJECT_SCAFFOLD, CMD_PROJECT_UNINSTALL,
  EXTENSION_GENERATOR_TARGET, VS_CMD_INSTALL_EXTENSION, VS_CMD_UNINSTALL_EXTENSION,
} from "../constants";
import { ITextXLanguage } from "../interfaces";
import { getPython } from "../setup";
import TYPES from "../types";
import { LanguageNode } from "../ui/explorer/languageNode";
import { mkdtempWrapper } from "../utils";
import { IEventService } from "./eventService";

export interface ILanguageService {
  getInstalled(): Promise<ITextXLanguage[]>;
  install(pyModulePath: string, editableMode?: boolean): Promise<void>;
  scaffold(languageName: string): void;
  uninstall(languageName: string): Promise<void>;
}

@injectable()
export class LanguageService implements ILanguageService {

  constructor(
    @inject(TYPES.IEventService) private readonly eventService: IEventService,
  ) {
    this.registerCommands();
  }

  public async getInstalled(): Promise<ITextXLanguage[]> {
    const langs = await commands.executeCommand<ITextXLanguage[]>(CMD_LANGUAGE_LIST.external);
    return langs || [];
  }

  public async install(pyModulePath: string, editableMode: boolean = false): Promise<void> {
    const projectName = await commands.executeCommand<string>(CMD_PROJECT_INSTALL.external,
                                                                 pyModulePath, editableMode);

    if (projectName) {
      mkdtempWrapper(async (folder) => {
        const extensionPath = await commands.executeCommand<string>(
          CMD_GENERATE_EXTENSION.external, projectName, EXTENSION_GENERATOR_TARGET, folder,
        );

        if (extensionPath) {
          await commands.executeCommand(VS_CMD_INSTALL_EXTENSION, Uri.file(extensionPath));
        }
      });
    }

    // Refresh textX languages view
    this.eventService.fireLanguagesChanged();
  }

  public scaffold(languageName: string): void {
    commands.executeCommand(CMD_PROJECT_SCAFFOLD.external, languageName);
  }

  public async uninstall(projectName: string): Promise<void> {
    const langName = await commands.executeCommand<string>(CMD_PROJECT_UNINSTALL.external,
                                                           projectName);
    if (langName) {
      await commands.executeCommand(VS_CMD_UNINSTALL_EXTENSION, `textx.${langName.toLowerCase()}`);
    }

    // Refresh textX languages view
    this.eventService.fireLanguagesChanged();
  }

  private registerCommands() {
    commands.registerCommand(CMD_PROJECT_INSTALL.internal, async () => {
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

    commands.registerCommand(CMD_PROJECT_INSTALL_EDITABLE.internal, async (fileOrFolder) => {
      if (fileOrFolder) {
        const path = fileOrFolder.path;
        const pyModulePath = basename(path) === "setup.py" ? dirname(path) : path;
        this.install(pyModulePath, true);
      } else {
        window.showErrorMessage("Cannot get python module path.");
      }
    });

    commands.registerCommand(CMD_LANGUAGE_LIST_REFRESH.internal,
                             () => this.eventService.fireLanguagesChanged());

    commands.registerCommand(CMD_PROJECT_SCAFFOLD.internal, async () => {
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

    commands.registerCommand(CMD_PROJECT_UNINSTALL.internal, async (fileOrFolderOrTreeItem) => {
      let projectName = null;
      if (fileOrFolderOrTreeItem instanceof LanguageNode) {
        projectName = fileOrFolderOrTreeItem.projectName;
      } else {
        const path = fileOrFolderOrTreeItem.path;
        const setuppyPath = basename(path) === "setup.py" ? path : join(path, "setup.py");
        projectName = execSync(`${getPython()} ${setuppyPath} --name`);
      }

      if (projectName) {
        const decision = await window.showQuickPick(["Yes", "No"], {
          canPickMany: false,
          ignoreFocusOut: true,
          placeHolder: `Are you sure you want to delete ${projectName}?`,
        });

        if (decision === "Yes") {
          this.uninstall(projectName.toString().trim());
        }
      }
    });
  }

}
