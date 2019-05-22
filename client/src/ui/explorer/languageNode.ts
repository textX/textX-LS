import { join } from "path";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { RESOURCES_PATH } from "../../constants";

export class LanguageNode extends TreeItem {

  public readonly contextValue = "language";
  public readonly iconPath = {
    dark: join(RESOURCES_PATH , "dark", "x.svg"),
    light: join(RESOURCES_PATH, "light", "x.svg"),
  };

  constructor(
    public readonly label: string,
    public readonly projectName: string,
    private readonly desc?: string,
  ) {
    super(label, TreeItemCollapsibleState.None);
  }

  public get tooltip(): string | undefined {
    return this.desc;
  }

  public get description(): string | undefined {
    return this.desc;
  }

}
