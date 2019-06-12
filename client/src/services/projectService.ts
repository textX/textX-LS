import { execSync } from "child_process";
import { inject, injectable } from "inversify";
import { basename, dirname, join } from "path";
import { commands, Uri, window } from "vscode";
import {
  CMD_GENERATE_EXTENSION, CMD_PROJECT_INSTALL, CMD_PROJECT_INSTALL_EDITABLE, CMD_PROJECT_LIST,
  CMD_PROJECT_LIST_REFRESH, CMD_PROJECT_SCAFFOLD, CMD_PROJECT_UNINSTALL,
  EXTENSION_GENERATOR_TARGET, VS_CMD_INSTALL_EXTENSION, VS_CMD_UNINSTALL_EXTENSION,
} from "../constants";
import { ITextXProject } from "../interfaces";
import { getPython } from "../setup";
import TYPES from "../types";
import { ProjectNode } from "../ui/explorer/projectNode";
import { mkdtempWrapper } from "../utils";
import { IEventService } from "./eventService";

export interface IProjectService {
  getInstalled(): Promise<Map<string, ITextXProject>>;
  install(pyModulePath: string, editableMode?: boolean): Promise<void>;
  scaffold(projectName: string): void;
  uninstall(projectName: string): Promise<void>;
}

@injectable()
export class ProjectService implements IProjectService {

  constructor(
    @inject(TYPES.IEventService) private readonly eventService: IEventService,
  ) {
    this.registerCommands();
  }

  public async getInstalled(): Promise<Map<string, ITextXProject>> {
    // tslint:disable-next-line:max-line-length
    const langs = await commands.executeCommand<Map<string, ITextXProject>>(CMD_PROJECT_LIST.external);
    return langs || new Map<string, ITextXProject>();
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

  public scaffold(projectName: string): void {
    commands.executeCommand(CMD_PROJECT_SCAFFOLD.external, projectName);
  }

  public async uninstall(projectName: string): Promise<void> {
    const isUninstalled = await commands.executeCommand<string>(CMD_PROJECT_UNINSTALL.external,
                                                                projectName);
    if (isUninstalled) {
      await commands.executeCommand(VS_CMD_UNINSTALL_EXTENSION,
                                    `textx.${projectName.toLowerCase()}`);
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

    commands.registerCommand(CMD_PROJECT_LIST_REFRESH.internal,
                             () => this.eventService.fireLanguagesChanged());

    commands.registerCommand(CMD_PROJECT_SCAFFOLD.internal, async () => {
      const projectName = await window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: "Enter a project name.",
        validateInput: (value: string) => {
          if (value && value.trim().length > 0) {
            return null;
          } else {
            return "Project name is required.";
          }
        },
      });

      if (projectName) {
        this.scaffold(projectName.trim());
       }
    });

    commands.registerCommand(CMD_PROJECT_UNINSTALL.internal, async (fileOrFolderOrTreeItem) => {
      let projectName = null;
      if (fileOrFolderOrTreeItem instanceof ProjectNode) {
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
