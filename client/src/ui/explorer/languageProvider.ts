import { inject, injectable } from "inversify";
import { commands, Event, EventEmitter, TreeDataProvider, TreeItem } from "vscode";
import { CMD_LANGUAGE_LIST_REFRESH } from "../../constants";
import { ILanguageService } from "../../services/languageService";
import TYPES from "../../types";
import { LanguageNode } from "./languageNode";

export interface ILanguageProvider extends TreeDataProvider<LanguageNode> {}

@injectable()
export class TextXLanguageProvider implements ILanguageProvider {

  private _onDidChangeTreeData: EventEmitter<LanguageNode | undefined> = new EventEmitter<LanguageNode | undefined>(); // tslint:disable-line
  public onDidChangeTreeData: Event<LanguageNode | undefined> = this._onDidChangeTreeData.event; // tslint:disable-line

  constructor(
    @inject(TYPES.ILanguageService) private readonly languageService: ILanguageService,
  ) {
    this.registerCommands();
  }

  public getChildren(element?: LanguageNode): Thenable<LanguageNode[]> {
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

  public refresh() {
    this._onDidChangeTreeData.fire();
  }

  private registerCommands() {
    commands.registerCommand(CMD_LANGUAGE_LIST_REFRESH.internal, this.refresh, this);
  }

}
