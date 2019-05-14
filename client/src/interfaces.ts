export interface ITextXGenerator {
  language: string;
  target: string;
  description?: string;
}

export interface ITextXLanguage {
  name: string;
  description?: string;
  metamodel_path?: string;
}
