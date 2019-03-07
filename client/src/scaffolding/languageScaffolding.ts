import { commands, Disposable, ExtensionContext, StatusBarItem, window, workspace } from "vscode";
import { CMD_LANG_SCAFFOLD } from "../constants";
import { ICommands } from "../interfaces";
import { createWidget, getCommands } from "../utils";

export class LanguageScaffoldingWidgetController implements Disposable {

  private readonly commands: ICommands;
  private readonly context: ExtensionContext;

  private languageScaffoldingWidget: StatusBarItem;

  constructor(context: ExtensionContext) {
    this.context = context;
    this.commands = getCommands(CMD_LANG_SCAFFOLD);

    this.registerCommand();
    this.initializeWidget();
  }

  public dispose() {
    this.languageScaffoldingWidget.dispose();
  }

  private async scaffold() {
    const langName = await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "",
    });

    commands.executeCommand(this.commands.external, langName, workspace.rootPath);
  }

  private initializeWidget() {
    this.languageScaffoldingWidget = createWidget(
      this.commands.internal, "plus", "New textX language project", false, "  ", "  ",
    );
  }

  private registerCommand() {
    this.context.subscriptions.push(
      commands.registerTextEditorCommand(this.commands.internal, this.scaffold, this));
  }

}
