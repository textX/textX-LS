import "reflect-metadata";

import { Container } from "inversify";
import { GeneratorService, IGeneratorService } from "./services/generatorService";
import { ILanguageService, LanguageService } from "./services/languageService";
import TYPES from "./types";
import {
  IGeneratorProvider, ILanguageProvider, TextXGeneratorsProvider, TextXLanguageProvider,
} from "./ui/explorer";

const container = new Container();
// Services
container.bind<IGeneratorService>(TYPES.IGeneratorService).to(GeneratorService);
container.bind<ILanguageService>(TYPES.ILanguageService).to(LanguageService);

// Tree data providers
container.bind<IGeneratorProvider>(TYPES.IGeneratorProvider).to(TextXGeneratorsProvider);
container.bind<ILanguageProvider>(TYPES.ILanguageProvider).to(TextXLanguageProvider);

export default container;
