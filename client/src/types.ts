import { ITokenColorSettings } from "./interfaces";

export type TokenColors = Map<string, ITokenColorSettings>;

const TYPES = {
  GeneratorNode: Symbol("GeneratorNode"),
  ExtensionContext: Symbol("ExtensionContext"),
  IEventService: Symbol("IEventService"),
  IExtensionService: Symbol("IExtensionService"),
  IGeneratorProvider: Symbol("IGeneratorProvider"),
  IGeneratorService: Symbol("IGeneratorService"),
  ILanguageProvider: Symbol("ILanguageProvider"),
  IProjectService: Symbol("IProjectService"),
  ISyntaxHighlightService: Symbol("ISyntaxHighlightService"),
  IWatcherService: Symbol("IWatcherService"),
  TextXNode: Symbol("LanguageNode"),
};

export default TYPES;
