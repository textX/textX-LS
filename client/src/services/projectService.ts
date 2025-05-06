import { inject, injectable } from "inversify";
import { basename, dirname } from "path";
import { commands, window, workspace } from "vscode";
import { IEventService, IExtensionService, IGeneratorService, ISyntaxHighlightService } from ".";
import {
  CMD_PROJECT_INSTALL, CMD_PROJECT_INSTALL_EDITABLE, CMD_PROJECT_LIST,
  CMD_PROJECT_LIST_REFRESH, CMD_PROJECT_SCAFFOLD, CMD_PROJECT_UNINSTALL,
  CMD_VALIDATE_DOCUMENTS,
  CMD_VALIDATE_DOCUMENTS_FOR_GRAMMAR,
  VS_CMD_WINDOW_RELOAD,
} from "../constants";
import { ITextXProject } from "../interfaces";
import TYPES from "../types";
import { ProjectNode } from "../ui/explorer/projectNode";
import { getEditablePackageName } from "../python";

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
  ) {
    this.registerCommands();

    // Refresh syntax higlighting keywords on grammar save
    workspace.onDidSaveTextDocument(doc => {
      if (doc.languageId === 'textx') {
        this.loadLanguageKeywordsForGrammar(doc.fileName);
        -       commands.executeCommand(CMD_VALIDATE_DOCUMENTS_FOR_GRAMMAR.external, doc.fileName);
      }
    });

    this.refreshInstalled();
  }

  public async getInstalled(): Promise<Map<string, ITextXProject>> {
    let projects = await commands.executeCommand<Map<string, ITextXProject>>(CMD_PROJECT_LIST.external);
    projects = projects || new Map<string, ITextXProject>();
    return projects;
  }

  async refreshInstalled() {
    let projects = await this.getInstalled();
    Object.values(projects).forEach((p: ITextXProject) => {
      this.loadLanguageKeywordsForProject(p.projectName);
      commands.executeCommand(CMD_VALIDATE_DOCUMENTS.external, p.projectName);
    });
  }

  public async install(pyModulePath: string, editableMode: boolean = false): Promise<void> {
    const [projectName, projectVersion, _distLocation] = await commands.executeCommand<string>(
      CMD_PROJECT_INSTALL.external, pyModulePath, editableMode);

    if (projectName) {
      // Refresh textX languages view
      this.eventService.fireLanguagesChanged();

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

      // Uninstall vscode extension
      try {
        const { isActive } = await this.extensionService.uninstall(projectName);
        if (isActive) {
          await commands.executeCommand(VS_CMD_WINDOW_RELOAD);
        }
      } catch (err) {
        window.showErrorMessage(`Uninstalling extension for project '${projectName}' failed: ${err}`);
      }
    }
  }

  private async loadLanguageKeywordsForGrammar(grammarPath: string) {
    const languageSyntaxes: Map<string, string> =
      await this.generatorService.generateLanguagesSyntaxesForGrammar(grammarPath);
    this.syntaxHighlightService.addLanguageKeywordsFromTextmate(languageSyntaxes);
    this.syntaxHighlightService.highlightAllEditorsDocument();
  }

  private async loadLanguageKeywordsForProject(project_name: string) {
    const languageSyntaxes: Map<string, string> =
      await this.generatorService.generateLanguagesSyntaxes(project_name);
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
        const pyModulePath = ["setup.py", "setup.cfg", "pyproject.toml"].includes(basename(path))
          ? dirname(path) : path;
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
        const projectPath = ["setup.py", "setup.cfg", "pyproject.toml"].includes(basename(path))
          ? dirname(path) : path;
        projectName = await getEditablePackageName(projectPath);
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
      } else {
        window.showErrorMessage("Project is not installed");
      }
    });
  }

}
