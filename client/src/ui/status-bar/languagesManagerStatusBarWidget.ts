import { existsSync } from "fs";
import { join } from "path";
import { commands, Disposable, ExtensionContext, StatusBarItem, window, workspace } from "vscode";
import {
  CMD_LANG_INSTALL, CMD_LANG_LIST, CMD_LANG_SCAFFOLD, CMD_LANG_UNINSTALL,
} from "../../constants";
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
      placeHolder: "Enter path to the language package.",
      validateInput: (value: string) => {
        const exists = existsSync(join(value, "setup.py"));
        if (exists) {
          return null;
        } else {
          return "Specified directory does not contain setup.py.";
        }
      },
    });
    if (!langPath) { return; }

    commands.executeCommand(CMD_LANG_INSTALL.external, langPath.trim());
  }

  private registerCommands() {
    this.context.subscriptions.push(
      commands.registerCommand(CMD_LANG_INSTALL.internal, this.install, this));

    this.context.subscriptions.push(
      commands.registerCommand(CMD_LANG_SCAFFOLD.internal, this.scaffold, this));

    this.context.subscriptions.push(
      commands.registerCommand(CMD_LANG_UNINSTALL.internal, this.uninstall, this));
  }

  private async scaffold() {
    const langName = await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "Enter language name.",
      validateInput: (value: string) => {
        if (value && value.trim().length > 0) {
          return null;
        } else {
          return "Language package name is required.";
        }
      },
    });
    if (!langName) { return; }

    commands.executeCommand(CMD_LANG_SCAFFOLD.external, langName.trim(), workspace.rootPath);
  }

  private async uninstall() {
    const languages = await commands.executeCommand<string[]>(CMD_LANG_LIST.external);
    const langName = await window.showQuickPick(
      languages
        .filter((langInfo) => !langInfo[2])
        .map((langInfo) => ({ label: langInfo[0], detail: langInfo[1] })),
      {
        placeHolder: "Pick a language to uninstall it.",
      },
    );
    if (!langName) { return; }

    commands.executeCommand(CMD_LANG_UNINSTALL.external, langName.label);
  }

}
