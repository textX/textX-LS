import { inject, injectable } from "inversify";
import { TreeDataProvider, TreeItem } from "vscode";
import { IGeneratorService } from "../../services/generatorService";
import TYPES from "../../types";
import { GeneratorNode } from "./generatorNode";

export interface IGeneratorProvider extends TreeDataProvider<GeneratorNode> {}

@injectable()
export class TextXGeneratorsProvider implements IGeneratorProvider {

  constructor(
    @inject(TYPES.IGeneratorService) private readonly generatorService: IGeneratorService,
  ) {}

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
}
