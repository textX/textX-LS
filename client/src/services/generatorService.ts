import { inject, injectable } from "inversify";
import { join } from "path";
import { commands, extensions, Uri , window } from "vscode";
import {
  CMD_GENERATE_EXTENSION, CMD_GENERATE_SYNTAXES, CMD_GENERATOR_LIST, EXTENSION_GENERATOR_TARGET,
  EXTENSION_SYNTAX_HIGHLIGHT_TARGET, VS_CMD_INSTALL_EXTENSION, VSCE_COMMAND_PATH,
} from "../constants";
import { ITextXExtensionInstall, ITextXGenerator } from "../interfaces";
import TYPES from "../types";
import { mkdtempWrapper, textxExtensionName } from "../utils";
import { ISyntaxHighlightService } from "./SyntaxHighlightService";

export interface IGeneratorService {
  generateAndInstallExtension(projectName: string, editableMode: boolean): Promise<ITextXExtensionInstall>; // tslint:disable: max-line-length
  generateLanguagesSyntaxes(projectName: string): Promise<Map<string, string>>;
  getAll(): Promise<ITextXGenerator[]>;
  getByLanguage(languageName: string): Promise<ITextXGenerator[]>;
}

@injectable()
export class GeneratorService implements IGeneratorService {

  constructor(
    @inject(TYPES.ISyntaxHighlightService) private readonly syntaxHighlightService: ISyntaxHighlightService, // tslint:disable: max-line-length
  ) { }

  public async generateAndInstallExtension(
    projectName: string, editableMode: boolean = false,
  ): Promise<ITextXExtensionInstall> {

    return new Promise(async (resolve) => {
      mkdtempWrapper(async (folder) => {
        const cmdArgs = { project_name: projectName, vsix: 1, skip_keywords: editableMode, vsce: VSCE_COMMAND_PATH };

        const isGenerated = await commands.executeCommand(
          CMD_GENERATE_EXTENSION.external, EXTENSION_GENERATOR_TARGET, folder, cmdArgs);

        if (isGenerated) {
          const extensionPath = join(folder, projectName + ".vsix");

          extensions.onDidChange(async (_) => {
            const extensionName = extensionPath.split("\\").pop().split("/").pop().split(".")[0];
            const extension = extensions.getExtension(textxExtensionName(extensionName));
            const isActive = extension === undefined ? false : extension.isActive;

            const languageSyntaxes = await this.generateLanguagesSyntaxes(projectName);
            this.syntaxHighlightService.addLanguageKeywordsFromTextmate(languageSyntaxes);
            this.syntaxHighlightService.highlightAllEditorsDocument();

            resolve({extension, isActive, isInstalled: extension !== undefined });
          });

          await commands.executeCommand(VS_CMD_INSTALL_EXTENSION, Uri.file(extensionPath));
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
