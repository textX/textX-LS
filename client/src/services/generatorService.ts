import { injectable } from "inversify";
import { commands, window } from "vscode";
import { CMD_GET_GENERATORS } from "../constants";
import { ITextXGenerator } from "../interfaces";

export interface IGeneratorService {
  getAll(): Promise<ITextXGenerator[]>;
  getByLanguage(languageName: string): Promise<ITextXGenerator[]>;
}

@injectable()
export class GeneratorService implements IGeneratorService {

  public async getAll(): Promise<ITextXGenerator[]> {
    const gens = await commands.executeCommand<ITextXGenerator[]>(CMD_GET_GENERATORS);
    return gens || [];
  }

  public async getByLanguage(languageName: string): Promise<ITextXGenerator[]> {
    window.showWarningMessage("GeneratorService.getByLanguage is not implemented!");
    return [];
  }

}
