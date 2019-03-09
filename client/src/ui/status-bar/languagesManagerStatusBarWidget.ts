import { existsSync } from "fs";
import { join } from "path";
import { commands, Disposable, ExtensionContext, StatusBarItem, window, workspace } from "vscode";
import { CMD_LANG_INSTALL, CMD_LANG_SCAFFOLD, CMD_LANG_UNINSTALL } from "../../constants";
import { createWidget } from "../../utils";

export class LanguagesManagerWidgetController implements Disposable {

  private readonly context: ExtensionContext;

  private installWidget: StatusBarItem;
  private scaffoldWidget: StatusBarItem;
  private uninstallWidget: StatusBarItem;

  constructor(context: ExtensionContext) {
    this.context = context;

    this.registerCommands();
    this.initializeWidgets();
  }

  public dispose() {
    this.installWidget.dispose();
    this.scaffoldWidget.dispose();
    this.uninstallWidget.dispose();
  }

  private initializeWidgets() {
    this.installWidget = createWidget(
      CMD_LANG_INSTALL.internal, "zap", "Install textX language project", false, "  ", "",
    );

    this.scaffoldWidget = createWidget(
      CMD_LANG_SCAFFOLD.internal, "plus", "Scaffold textX language project", false, "", "",
    );

    this.uninstallWidget = createWidget(
      CMD_LANG_UNINSTALL.internal, "x", "Uninstall textX language project", false, "", "  ",
    );
  }

  private async install() {
    const langPath = await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "",
      prompt: "aaa",
      validateInput: (value: string) => {
        const exists = existsSync(join(value, "setup.py"));
        if (exists) {
          return null;
        } else {
          return "Specified directory does not contain setup.py";
        }
      },
    });

    commands.executeCommand(CMD_LANG_INSTALL.external, langPath);
  }

  private registerCommands() {
    this.context.subscriptions.push(
      commands.registerTextEditorCommand(CMD_LANG_INSTALL.internal, this.install, this));

    this.context.subscriptions.push(
      commands.registerTextEditorCommand(CMD_LANG_SCAFFOLD.internal, this.scaffold, this));

    this.context.subscriptions.push(
      commands.registerTextEditorCommand(CMD_LANG_UNINSTALL.internal, this.uninstall, this));
  }

  private async scaffold() {
    const langName = await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "",
    });

    commands.executeCommand(CMD_LANG_SCAFFOLD.external, langName, workspace.rootPath);
  }

  private async uninstall() {
    const langPath = await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "",
    });

    commands.executeCommand(CMD_LANG_UNINSTALL.external, langPath);
  }

}
