import { join } from "path";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { RESOURCES_PATH } from "../../constants";

export class TextXGeneratorNode extends TreeItem {

  public readonly contextValue = "generator";
  public readonly iconPath = {
    dark: join(RESOURCES_PATH , "dark", "gears.svg"),
    light: join(RESOURCES_PATH, "light", "gears.svg"),
  };

  constructor(
    public readonly language: string,
    public readonly target: string,
    private readonly desc?: string,
  ) {
    super(`${language}-${target}`, TreeItemCollapsibleState.None);
  }

  public get tooltip(): string {
    return this.desc;
  }

  public get description(): string {
    return this.desc;
  }

}
