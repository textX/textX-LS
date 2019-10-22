import { join } from "path";
import { TreeItemCollapsibleState } from "vscode";
import { RESOURCES_PATH } from "../../constants";
import { TextXNode } from "./textxNode";

export class ProjectNode extends TextXNode {

  public readonly contextValue = "project";
  public readonly iconPath = {
    dark: join(RESOURCES_PATH , "dark", "x.svg"),
    light: join(RESOURCES_PATH, "light", "x.svg"),
  };

  constructor(
    public readonly label: string,
    public readonly projectName: string,
    public readonly projectVersion: string,
  ) {
    super(label, TreeItemCollapsibleState.Expanded);
  }

}
