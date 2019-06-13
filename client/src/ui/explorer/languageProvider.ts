import { inject, injectable } from "inversify";
import { Event, TreeDataProvider, TreeItem } from "vscode";
import { ITextXProject } from "../../interfaces";
import { IEventService } from "../../services/eventService";
import { IProjectService } from "../../services/projectService";
import TYPES from "../../types";
import { LanguageNode } from "./languageNode";
import { ProjectNode } from "./projectNode";
import { TextXNode } from "./textxNode";

export interface ILanguageProvider extends TreeDataProvider<TextXNode> {}

@injectable()
export class TextXLanguageProvider implements ILanguageProvider {

  public onDidChangeTreeData: Event<LanguageNode | undefined>;

  private projects: Map<string, ITextXProject>;

  constructor(
    @inject(TYPES.IEventService) private readonly eventService: IEventService,
    @inject(TYPES.IProjectService) private readonly projectService: IProjectService,
  ) {
    this.onDidChangeTreeData = this.eventService.getEmitter<LanguageNode>(TYPES.TextXNode).event;
  }

  public getChildren(element?: TextXNode): Thenable<TextXNode[]> {
    // NOTE: All languages are returned in one call!
    if (element instanceof ProjectNode) {
      return new Promise(async (resolve) => {
        resolve((this.projects[element.projectName].languages || []).map(
          (l) => new LanguageNode(l.name, l.projectName, l.description)));
      });
    } else {
      return new Promise(async (resolve) => {
        this.projects = await this.projectService.getInstalled();
        resolve(Object.values(this.projects).map(
          (p) => new ProjectNode(p.projectName, p.projectName)));
      });
    }
  }

  public getTreeItem(element: LanguageNode): TreeItem {
    return element;
  }

}
