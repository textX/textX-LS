import { inject, injectable } from "inversify";
import { TreeDataProvider, TreeItem } from "vscode";
import { ILanguageService } from "../../services/languageService";
import TYPES from "../../types";
import { LanguageNode } from "./languageNode";

export interface ILanguageProvider extends TreeDataProvider<LanguageNode> {}

@injectable()
export class TextXLanguageProvider implements ILanguageProvider {

  constructor(
    @inject(TYPES.ILanguageService) private readonly languageService: ILanguageService,
  ) {}

  public getChildren(element?: LanguageNode): Thenable<LanguageNode[]> {
    return new Promise(async (resolve) => {
      const languages = await this.languageService.getInstalled();
      const nodes = languages.map((lang) => new LanguageNode(lang.name,
                                                                  lang.description,
                                                                  lang.metamodel_path));
      resolve(nodes);
    });
  }

  public getTreeItem(element: LanguageNode): TreeItem {
    return element;
  }
}
