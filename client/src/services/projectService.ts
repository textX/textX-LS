import { execSync } from "child_process";
import { inject, injectable } from "inversify";
import { basename, dirname, join } from "path";
import { trueCasePathSync } from "true-case-path";
import { commands, window } from "vscode";
import { IEventService, IExtensionService, IGeneratorService, ISyntaxHighlightService, IWatcherService } from ".";
import {
  CMD_PROJECT_INSTALL, CMD_PROJECT_INSTALL_EDITABLE, CMD_PROJECT_LIST,
  CMD_PROJECT_LIST_REFRESH, CMD_PROJECT_SCAFFOLD, CMD_PROJECT_UNINSTALL, CMD_VALIDATE_DOCUMENTS,
  IS_WIN, VS_CMD_WINDOW_RELOAD,
} from "../constants";
import { ITextXProject } from "../interfaces";
import { getPythonFromVenvPath } from "../setup";
import TYPES from "../types";
import { ProjectNode } from "../ui/explorer/projectNode";

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
    @inject(TYPES.IExtensionService) private readonly extensionService: IExtensionService,
    @inject(TYPES.ISyntaxHighlightService) private readonly syntaxHighlightService: ISyntaxHighlightService,
    @inject(TYPES.IWatcherService) private readonly watcherService: IWatcherService,
  ) {
    this.registerCommands();
  }

  public async getInstalled(): Promise<Map<string, ITextXProject>> {
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
    const [projectName, projectVersion, distLocation] = await commands.executeCommand<string>(
      CMD_PROJECT_INSTALL.external, pyModulePath, editableMode);

    if (projectName) {
      // Refresh textX languages view
      this.eventService.fireLanguagesChanged();
      this.watchProject(projectName, distLocation);

      await this.generatorService.generateAndInstallExtension(projectName, projectVersion, editableMode);
    }
  }

  public scaffold(projectName: string): void {
    commands.executeCommand(CMD_PROJECT_SCAFFOLD.external, projectName);
  }

  public async uninstall(projectName: string): Promise<void> {
    const isUninstalled = await commands.executeCommand<string>(CMD_PROJECT_UNINSTALL.external,
      projectName);
    if (isUninstalled) {
      // Refresh textX languages view
      this.eventService.fireLanguagesChanged();

      // unwatch project
      this.unwatchProject(projectName);

      // Uninstall vscode extension
      try {
        const { isActive } = await this.extensionService.uninstall(projectName);
        if (isActive) {
          await commands.executeCommand(VS_CMD_WINDOW_RELOAD);
        }
      } catch (_) {
        window.showErrorMessage(`Uninstalling extension for project '${projectName}' failed.`);
      }
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
        this.install(pyWheel.pop().fsPath);
      }
    });

    commands.registerCommand(CMD_PROJECT_INSTALL_EDITABLE.internal, async (fileOrFolder) => {
      if (fileOrFolder) {
        const path = fileOrFolder.fsPath;
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
        const path = fileOrFolderOrTreeItem.fsPath;
        const setuppyPath = basename(path) === "setup.py" ? path : join(path, "setup.py");
        projectName = execSync(`${getPythonFromVenvPath()} ${setuppyPath} --name`);
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

  private unwatchProject(projectName: string): void {
    this.watcherService.unwatch(projectName);
  }

  private watchProject(projectName: string, distLocation: string): void {
    // NOTE:
    // watch does not work on windows if path is not case-correct
    // also it does not work with drive letter, for e.g. "C:\\x\\y\\z"
    if (IS_WIN) {
      // correct case
      distLocation = trueCasePathSync(distLocation);
      if (distLocation && distLocation[1] === ":") {
        distLocation = `**\\${distLocation.slice(2)}`;
      }
    }

    // watch grammars
    this.watcherService
      .watch(projectName, join(distLocation, "**", "*.tx"))
      .onDidChange(async (_) => {
        this.loadLanguageKeywords(projectName);
        commands.executeCommand(CMD_VALIDATE_DOCUMENTS.external, projectName);
      });
  }

}
