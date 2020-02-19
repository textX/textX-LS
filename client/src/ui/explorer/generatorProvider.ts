import { inject, injectable } from "inversify";
import { Event, TreeDataProvider, TreeItem } from "vscode";
import { ITextXProject, ITextXGenerator } from "../../interfaces";
import { IEventService, IGeneratorService, IProjectService } from "../../services";
import TYPES from "../../types";
import { GeneratorNode } from "./generatorNode";
import { TextXNode } from "./textxNode";
import { GeneratorConfigNode } from "./generatorConfigNode";

export interface IGeneratorProvider extends TreeDataProvider<TextXNode> {}

@injectable()
export class TextXGeneratorProvider implements IGeneratorProvider {

  public readonly onDidChangeTreeData: Event<TextXNode | undefined>;

  private generators: ITextXGenerator[];

  constructor(
    @inject(TYPES.IEventService) private readonly eventService: IEventService,
    @inject(TYPES.IGeneratorService) private readonly generatorService: IGeneratorService,
  ) {
    this.onDidChangeTreeData = this.eventService.getEmitter<TextXNode>(TYPES.TextXNode).event;
  }

  public getChildren(element?: TextXNode): Thenable<TextXNode[]> {
    if (element instanceof GeneratorNode) {
      return new Promise((resolve) => {
        resolve(element.configurations.map((c) => new GeneratorConfigNode(c)));
      });
    } else {
      return new Promise(async (resolve) => {
        this.generators = await this.generatorService.getAll();
        resolve(this.generators.map(
          (g) => new GeneratorNode(g.language, g.target, g.configurations, g.description)));
      });
    }
  }

  public getTreeItem(element: GeneratorConfigNode): TreeItem {
    return element;
  }

}
