import { inject, injectable } from "inversify";
import { Event, TreeDataProvider, TreeItem } from "vscode";
import { IEventService } from "../../services/eventService";
import { ILanguageService } from "../../services/languageService";
import TYPES from "../../types";
import { LanguageNode } from "./languageNode";

export interface ILanguageProvider extends TreeDataProvider<LanguageNode> {}

@injectable()
export class TextXLanguageProvider implements ILanguageProvider {

  public onDidChangeTreeData: Event<LanguageNode | undefined>;

  constructor(
    @inject(TYPES.IEventService) private readonly eventService: IEventService,
    @inject(TYPES.ILanguageService) private readonly languageService: ILanguageService,
  ) {
    this.onDidChangeTreeData = this.eventService.getEmitter<LanguageNode>(TYPES.LanguageNode).event;
  }

  public getChildren(element?: LanguageNode): Thenable<LanguageNode[]> {
    // TODO: Make project name parent for languages

    return new Promise(async (resolve) => {
      const languages = await this.languageService.getInstalled();
      const nodes = languages.map((lang) => new LanguageNode(lang.name,
                                                             lang.projectName,
                                                             lang.description));
      resolve(nodes);
    });
  }

  public getTreeItem(element: LanguageNode): TreeItem {
    return element;
  }

}
