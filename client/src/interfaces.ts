export interface ICommand {
  // Used to execute command on language server
  external: string;
  // Used to execute client command
  internal: string;
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
