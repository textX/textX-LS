import { ITokenColorSettings } from "./interfaces";

export type TokenColors = Map<string, ITokenColorSettings>;

const TYPES = {
  GeneratorNode: Symbol("GeneratorNode"),
  IEventService: Symbol("IEventService"),
  IExtensionService: Symbol("IExtensionService"),
  IGeneratorProvider: Symbol("IGeneratorProvider"),
  IGeneratorService: Symbol("IGeneratorService"),
  ILanguageProvider: Symbol("ILanguageProvider"),
  IProjectService: Symbol("IProjectService"),
  ISyntaxHighlightService: Symbol("ISyntaxHighlightService"),
  IWatcherService: Symbol("IWatcherService"),
  LanguageNode: Symbol("LanguageNode"),
  TextXNode: Symbol("TextXNode"),
};

export default TYPES;
