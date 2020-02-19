import { Extension, TextEditorDecorationType } from "vscode";

export interface ICommand {
  // Used to execute command on language server
  external: string;
  // Used to execute client command
  internal: string;
}

export interface IKeywordInfo {
  decoration: TextEditorDecorationType;
  keyword: string;
  length: number;
  regex: RegExp;
  scope: string;
}

// tslint:disable-next-line:no-empty-interface
export interface ITextXExtensionAPI {}

export interface ITextXExtensionInstall {
  extension?: Extension<ITextXExtensionAPI>;
  isActive: boolean;
  isUpdated?: boolean;
}

export interface ITextXExtensionUninstall {
  isActive: boolean;
}

export interface ITextXGenerator {
  language: string;
  target: string;
  description?: string;
  configurations?: ITextXGeneratorConfig[];
}

export interface ITextXGeneratorConfig {
  name: string; // configuration file name - set on loading
  models: string[];
  grammar?: string;
  ignoreCase?: boolean;
  overwrite?: boolean;
  outputPath?: string;
}

export interface ITextXLanguage {
  name: string;
  projectName: string;
  description?: string;
}

export interface ITextXProject {
  projectName: string;
  version: string;
  editable: boolean;
  distLocation: string;
  languages?: ITextXLanguage[];
  generators?: ITextXGenerator[];
}

export interface ITokenColorSettings {
  background?: string;
  fontStyle?: string;
  foreground?: string;
}
