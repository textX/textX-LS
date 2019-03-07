import { StatusBarItem, window } from "vscode";
import { ICommands } from "./interfaces";

export function createWidget(command: string, icon?: any, tooltip?: string, hide: boolean = true,
  // tslint:disable-next-line:align
  iconPrefix?: string, iconSuffix?: string): StatusBarItem {

  const widget = window.createStatusBarItem();

  if (icon) {
    widget.text = (iconPrefix || "") + `$(${icon})` + (iconSuffix || "");
  }

  widget.command = command;
  widget.tooltip = tooltip;

  if (!hide) {
    widget.show();
  }

  return widget;
}

export function getCommands(command: string): ICommands {
  return {
    external: `textX/${command}`,
    internal: `textX.${command}`,
  };
}
