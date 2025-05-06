import { commands, window } from "vscode";
import {
  CMD_GENERATE_SYNTAXES, CMD_GENERATE_SYNTAXES_FOR_GRAMMAR, CMD_GENERATOR_LIST,
  EXTENSION_SYNTAX_HIGHLIGHT_TARGET,
} from "../constants";
import { ITextXGenerator } from "../interfaces";
import { injectable } from "inversify";

export interface IGeneratorService {
  generateLanguagesSyntaxes(projectName: string): Promise<Map<string, string>>;
  generateLanguagesSyntaxesForGrammar(grammarPath: string): Promise<Map<string, string>>;
  getAll(): Promise<ITextXGenerator[]>;
  getByLanguage(languageName: string): Promise<ITextXGenerator[]>;
}

@injectable()
export class GeneratorService implements IGeneratorService {

  public async generateLanguagesSyntaxes(projectName: string): Promise<Map<string, string>> {
    return await commands.executeCommand(CMD_GENERATE_SYNTAXES.external, projectName,
      EXTENSION_SYNTAX_HIGHLIGHT_TARGET, { silent: 1 });
  }

  public async generateLanguagesSyntaxesForGrammar(grammarPath: string): Promise<Map<string, string>> {
    return await commands.executeCommand(CMD_GENERATE_SYNTAXES_FOR_GRAMMAR.external, grammarPath,
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
