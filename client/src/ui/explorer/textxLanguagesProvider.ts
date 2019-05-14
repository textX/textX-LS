import { commands, TreeDataProvider, TreeItem } from "vscode";
import { CMD_GET_LANGUAGES } from "../../constants";
import { ITextXLanguage } from "../../interfaces";
import { TextXLanguageNode } from "./languageNode";

export class TextXLanguagesProvider implements TreeDataProvider<TextXLanguageNode> {

  public getChildren(element?: TextXLanguageNode): Thenable<TextXLanguageNode[]> {
    return new Promise(async (resolve) => {
        const languages = await commands.executeCommand<ITextXLanguage[]>(CMD_GET_LANGUAGES);
        resolve(
          languages.map(
            (lang) => new TextXLanguageNode(lang.name, lang.description, lang.metamodel_path)),
        );
      });
  }

  public getTreeItem(element: TextXLanguageNode): TreeItem {
    return element;
  }
}
