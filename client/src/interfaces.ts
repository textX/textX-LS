import { Extension } from "vscode";

export interface ICommand {
  // Used to execute command on language server
  external: string;
  // Used to execute client command
  internal: string;
}

// tslint:disable-next-line:no-empty-interface
export interface ITextXExtensionAPI {}

export interface ITextXExtensionInstall {
  extension: Extension<ITextXExtensionAPI>;
  isActive: boolean;
  isInstalled: boolean;
}

export interface ITextXExtensionUninstall {
  isActive: boolean;
  isUninstalled: boolean;
}

export interface ITextXGenerator {
  language: string;
  target: string;
  description?: string;
}

export interface ITextXLanguage {
  name: string;
  projectName: string;
  description?: string;
}

export interface ITextXProject {
  projectName: string;
  editable: boolean;
  distLocation: string;
  languages?: ITextXLanguage[];
}
