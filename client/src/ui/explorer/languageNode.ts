import { TreeItemCollapsibleState } from "vscode";
import { TextXNode } from "./textxNode";

export class LanguageNode extends TextXNode {

  public readonly contextValue = "language";

  constructor(
    public readonly label: string,
    public readonly projectName: string,
    private readonly desc?: string,
  ) {
    super(label, TreeItemCollapsibleState.None);
  }

  // @ts-ignore
  public get tooltip(): string | undefined {
    return this.desc;
  }

  // @ts-ignore
  public get description(): string | undefined {
    return this.desc;
  }

}
