import { join } from "path";
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { RESOURCES_PATH } from "../../constants";
import { ITextXGeneratorConfig } from "../../interfaces";

export class GeneratorConfigNode extends TreeItem {

  public readonly contextValue = "generatorConfig";
  public readonly iconPath = {
    dark: join(RESOURCES_PATH , "dark", "json.svg"),
    light: join(RESOURCES_PATH, "light", "json.svg"),
  };

  constructor(
    public readonly configuration: ITextXGeneratorConfig,
  ) {
    super(configuration.name, TreeItemCollapsibleState.None);
  }

  public get tooltip(): string | undefined {
    return this.configuration.name;
  }

  public get description(): string | undefined {
    return this.configuration.name;
  }

}
