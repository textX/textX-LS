import "reflect-metadata";

import { Container } from "inversify";
import { EventService, IEventService } from "./services/eventService";
import { GeneratorService, IGeneratorService } from "./services/generatorService";
import { ILanguageService, LanguageService } from "./services/languageService";
import TYPES from "./types";
import {
  IGeneratorProvider, ILanguageProvider, TextXGeneratorProvider, TextXLanguageProvider,
} from "./ui/explorer";

const container = new Container();
// Services
container.bind<IEventService>(TYPES.IEventService).to(EventService).inSingletonScope();
container.bind<IGeneratorService>(TYPES.IGeneratorService).to(GeneratorService);
container.bind<ILanguageService>(TYPES.ILanguageService).to(LanguageService);

// Tree data providers
container.bind<IGeneratorProvider>(TYPES.IGeneratorProvider).to(TextXGeneratorProvider);
container.bind<ILanguageProvider>(TYPES.ILanguageProvider).to(TextXLanguageProvider);

export default container;
