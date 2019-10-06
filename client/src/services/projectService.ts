import { execSync } from "child_process";
import { inject, injectable } from "inversify";
import { basename, dirname, join } from "path";
import { commands, extensions, window } from "vscode";
import {
    CMD_PROJECT_INSTALL, CMD_PROJECT_INSTALL_EDITABLE, CMD_PROJECT_LIST,
    CMD_PROJECT_LIST_REFRESH, CMD_PROJECT_SCAFFOLD, CMD_PROJECT_UNINSTALL, CMD_VALIDATE_DOCUMENTS,
    VS_CMD_UNINSTALL_EXTENSION, VS_CMD_WINDOW_RELOAD,
} from "../constants";
import { ITextXExtensionUninstall, ITextXProject } from "../interfaces";
import { getPython } from "../setup";
import TYPES from "../types";
import { ProjectNode } from "../ui/explorer/projectNode";
import { textxExtensionName } from "../utils";
import { IEventService } from "./eventService";
import { IGeneratorService } from "./generatorService";
import { ISyntaxHighlightService } from "./SyntaxHighlightService";
import { IWatcherService } from "./watcherService";

export interface IProjectService {
  getInstalled(): Promise<Map<string, ITextXProject>>;
  install(pyModulePath: string, editableMode?: boolean): Promise<void>;
  scaffold(projectName: string): void;
  uninstall(projectName: string): Promise<void>;
}

@injectable()
export class ProjectService implements IProjectService {

  constructor(
    @inject(TYPES.IGeneratorService) private readonly generatorService: IGeneratorService,
    @inject(TYPES.IEventService) private readonly eventService: IEventService,
    @inject(TYPES.ISyntaxHighlightService) private readonly syntaxHighlightService: ISyntaxHighlightService, // tslint:disable: max-line-length
    @inject(TYPES.IWatcherService) private readonly watcherService: IWatcherService,
  ) {
    this.registerCommands();
  }

  public async getInstalled(): Promise<Map<string, ITextXProject>> {
    // tslint:disable-next-line:max-line-length
    let projects = await commands.executeCommand<Map<string, ITextXProject>>(CMD_PROJECT_LIST.external);
    projects = projects || new Map<string, ITextXProject>();
    // watch editable projects
    Object.values(projects).forEach((p: ITextXProject) => {
      if (p.editable) {
        this.watchProject(p.projectName, p.distLocation);
        this.loadLanguageKeywords(p.projectName);
      }
    });

    return projects;
  }

  public async install(pyModulePath: string, editableMode: boolean = false): Promise<void> {
    const [projectName, distLocation] = await commands.executeCommand<string>(
      CMD_PROJECT_INSTALL.external, pyModulePath, editableMode);

    if (projectName) {
      const isInstalled = await this.generatorService.generateAndInstallExtension(projectName, editableMode);
      if (isInstalled) {
        this.watchProject(projectName, distLocation);
      }
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
      // unwatch project
      this.unwatchProject(projectName);

      // Uninstall vscode extension
      const uninstall = await this.uninstallExtension(projectName);
      if (uninstall.isUninstalled && uninstall.isActive) {
        await commands.executeCommand(VS_CMD_WINDOW_RELOAD);
      }

      // Refresh textX languages view
      this.eventService.fireLanguagesChanged();
    }
  }

  private async loadLanguageKeywords(projectName: string) {
    const languageSyntaxes: Map<string, string> = await this.generatorService.generateLanguagesSyntaxes(projectName);
    this.syntaxHighlightService.addLanguageKeywordsFromTextmate(languageSyntaxes);
    this.syntaxHighlightService.highlightAllEditorsDocument();
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

  private uninstallExtension(projectName: string): Promise<ITextXExtensionUninstall> {
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

  private unwatchProject(projectName: string): void {
    this.watcherService.unwatch(projectName);
  }

  private watchProject(projectName: string, distLocation: string): void {
    // watch grammars
    this.watcherService.watch(projectName, `${distLocation}/**/*.tx`).onDidChange(async (_) => {
      this.loadLanguageKeywords(projectName);
      commands.executeCommand(CMD_VALIDATE_DOCUMENTS.external, projectName);
    });
  }

}
