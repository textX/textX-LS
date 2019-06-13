import "reflect-metadata";

import { Container } from "inversify";
import { EventService, IEventService } from "./services/eventService";
import { GeneratorService, IGeneratorService } from "./services/generatorService";
import { IProjectService, ProjectService } from "./services/projectService";
import { IWatcherService, WatcherService } from "./services/watcherService";
import TYPES from "./types";
import {
  IGeneratorProvider, ILanguageProvider, TextXGeneratorProvider, TextXLanguageProvider,
} from "./ui/explorer";

const container = new Container();
// Services
container.bind<IEventService>(TYPES.IEventService).to(EventService).inSingletonScope();
container.bind<IGeneratorService>(TYPES.IGeneratorService).to(GeneratorService);
container.bind<IProjectService>(TYPES.IProjectService).to(ProjectService);
container.bind<IWatcherService>(TYPES.IWatcherService).to(WatcherService);

// Tree data providers
container.bind<IGeneratorProvider>(TYPES.IGeneratorProvider).to(TextXGeneratorProvider);
container.bind<ILanguageProvider>(TYPES.ILanguageProvider).to(TextXLanguageProvider);

export default container;
