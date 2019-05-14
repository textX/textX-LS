import { commands, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from "vscode";
import { CMD_GET_GENERATORS } from "../../constants";
import { ITextXGenerator } from "../../interfaces";
import { TextXGeneratorNode } from "./generatorNode";

export class TextXGeneratorsProvider implements TreeDataProvider<TextXGeneratorNode> {

  public getChildren(element?: TextXGeneratorNode): Thenable<TextXGeneratorNode[]> {
    return new Promise(async (resolve) => {
      const generators = await commands.executeCommand<ITextXGenerator[]>(CMD_GET_GENERATORS);
      resolve(
        generators.map(
          (gen) => new TextXGeneratorNode(gen.language, gen.target, gen.description)),
      );
    });
  }

  public getTreeItem(element: TextXGeneratorNode): TreeItem {
    return element;
  }
}
