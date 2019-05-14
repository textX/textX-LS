import { injectable } from "inversify";
import { commands, window } from "vscode";
import { CMD_GET_LANGUAGES } from "../constants";
import { ITextXLanguage } from "../interfaces";

export interface ILanguageService {
  getInstalled(): Promise<ITextXLanguage[]>;
  install(pyModulePath: string, editableMode?: boolean): void;
  uninstall(languageName: string): void;
}

@injectable()
export class LanguageService implements ILanguageService {

  public async getInstalled(): Promise<ITextXLanguage[]> {
    const langs = await commands.executeCommand<ITextXLanguage[]>(CMD_GET_LANGUAGES);
    return langs || [];
  }

  public install(pyModulePath: string, editableMode?: boolean): void {
    window.showWarningMessage("LanguageService.install is not implemented!");
  }

  public uninstall(languageName: string): void {
    window.showWarningMessage("LanguageService.uninstall is not implemented!");
  }

}
