import "reflect-metadata";

import { Container } from "inversify";

import * as services from "./services";
import TYPES from "./types";
import {
  IGeneratorProvider, ILanguageProvider, TextXGeneratorProvider, TextXLanguageProvider,
} from "./ui/explorer";

const container = new Container();
// Services
container.bind<services.IEventService>(TYPES.IEventService).to(services.EventService).inSingletonScope();
container.bind<services.IExtensionService>(TYPES.IExtensionService).to(services.ExtensionService).inSingletonScope();
container.bind<services.IGeneratorService>(TYPES.IGeneratorService).to(services.GeneratorService);
container.bind<services.IProjectService>(TYPES.IProjectService).to(services.ProjectService);
container.bind<services.ISyntaxHighlightService>(TYPES.ISyntaxHighlightService).to(services.SyntaxHighlightService)
                                                                               .inSingletonScope();
container.bind<services.IWatcherService>(TYPES.IWatcherService).to(services.WatcherService).inSingletonScope();

// Tree data providers
container.bind<IGeneratorProvider>(TYPES.IGeneratorProvider).to(TextXGeneratorProvider).inSingletonScope();
container.bind<ILanguageProvider>(TYPES.ILanguageProvider).to(TextXLanguageProvider).inSingletonScope();

export default container;
