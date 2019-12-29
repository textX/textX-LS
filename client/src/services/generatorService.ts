import { inject, injectable } from "inversify";
import { join } from "path";
import { commands, window } from "vscode";
import { IExtensionService, ISyntaxHighlightService } from ".";
import {
  CMD_GENERATE_EXTENSION, CMD_GENERATE_SYNTAXES, CMD_GENERATOR_LIST, EXTENSION_GENERATOR_TARGET,
  EXTENSION_SYNTAX_HIGHLIGHT_TARGET, VS_CMD_WINDOW_RELOAD, VSCE_COMMAND_PATH,
} from "../constants";
import { ITextXExtensionInstall, ITextXGenerator } from "../interfaces";
import TYPES from "../types";
import { mkdtempWrapper } from "../utils";

export interface IGeneratorService {
  // tslint:disable-next-line: max-line-length
  generateAndInstallExtension(projectName: string, projectVersion: string, editableMode: boolean): Promise<ITextXExtensionInstall>;
  generateLanguagesSyntaxes(projectName: string): Promise<Map<string, string>>;
  getAll(): Promise<ITextXGenerator[]>;
  getByLanguage(languageName: string): Promise<ITextXGenerator[]>;
}

@injectable()
export class GeneratorService implements IGeneratorService {

  constructor(
    @inject(TYPES.ISyntaxHighlightService) private readonly syntaxHighlightService: ISyntaxHighlightService,
    @inject(TYPES.IExtensionService) private readonly extensionService: IExtensionService,
  ) { }

  public async generateAndInstallExtension(
    projectName: string, projectVersion: string, editableMode: boolean = false,
  ): Promise<ITextXExtensionInstall> {

    return new Promise(async (resolve) => {
      mkdtempWrapper(async (folder) => {
        const cmdArgs = {
          project_name: projectName,
          skip_keywords: editableMode,
          version: projectVersion,
          vsce: VSCE_COMMAND_PATH,
          vsix: 1,
        };

        const isGenerated = await commands.executeCommand(
          CMD_GENERATE_EXTENSION.external, EXTENSION_GENERATOR_TARGET, folder, cmdArgs);

        if (isGenerated) {
          const extensionPath = join(folder, projectName + ".vsix");

          try {
            const install = await this.extensionService.install(extensionPath, projectVersion);

            if (install.isUpdated) {
              return await commands.executeCommand(VS_CMD_WINDOW_RELOAD);
            }

            if (editableMode) {
              const languageSyntaxes = await this.generateLanguagesSyntaxes(projectName);
              this.syntaxHighlightService.addLanguageKeywordsFromTextmate(languageSyntaxes);
              this.syntaxHighlightService.highlightAllEditorsDocument();
            }

            resolve(install);
          } catch (_) {
            window.showWarningMessage(`Installing extension for project '${projectName}' failed.`);
          }
        }

      });
    });
  }

  public async generateLanguagesSyntaxes(projectName: string): Promise<Map<string, string>> {
    return await commands.executeCommand(CMD_GENERATE_SYNTAXES.external, projectName,
      EXTENSION_SYNTAX_HIGHLIGHT_TARGET, { silent: 1 });
  }

  public async getAll(): Promise<ITextXGenerator[]> {
    const gens = await commands.executeCommand<ITextXGenerator[]>(CMD_GENERATOR_LIST.external);
    return gens || [];
  }

  public async getByLanguage(languageName: string): Promise<ITextXGenerator[]> {
    window.showWarningMessage("GeneratorService.getByLanguage is not implemented!");
    return [];
  }

}
