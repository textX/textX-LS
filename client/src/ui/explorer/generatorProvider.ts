import { inject, injectable } from "inversify";
import { commands, Event, EventEmitter, TreeDataProvider, TreeItem } from "vscode";
import { CMD_GENERATOR_LIST_REFRESH } from "../../constants";
import { IGeneratorService } from "../../services";
import TYPES from "../../types";
import { GeneratorNode } from "./generatorNode";

export interface IGeneratorProvider extends TreeDataProvider<GeneratorNode> {}

@injectable()
export class TextXGeneratorProvider implements IGeneratorProvider {

  private _onDidChangeTreeData: EventEmitter<GeneratorNode | undefined> = new EventEmitter<GeneratorNode | undefined>(); // tslint:disable-line
  readonly onDidChangeTreeData: Event<GeneratorNode | undefined> = this._onDidChangeTreeData.event; // tslint:disable-line

  constructor(
    @inject(TYPES.IGeneratorService) private readonly generatorService: IGeneratorService,
  ) {
    this.registerCommands();
  }

  public getChildren(element?: GeneratorNode): Thenable<GeneratorNode[]> {
    return new Promise(async (resolve) => {
      const generators = await this.generatorService.getAll();
      const nodes = generators.map((gen) => new GeneratorNode(gen.language,
                                                                   gen.target,
                                                                   gen.description));
      resolve(nodes);
    });
  }

  public getTreeItem(element: GeneratorNode): TreeItem {
    return element;
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  private registerCommands() {
    commands.registerCommand(CMD_GENERATOR_LIST_REFRESH.internal, this.refresh);
  }

}
