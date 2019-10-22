import { injectable } from "inversify";
import { EventEmitter } from "vscode";
import TYPES from "../types";
import { GeneratorNode } from "../ui/explorer/generatorNode";
import { TextXNode } from "../ui/explorer/textxNode";

export interface IEventService {
  getEmitter<T>(type: symbol): EventEmitter<T | undefined>;
  fireGeneratorsChanged(): void;
  fireLanguagesChanged(): void;
  onGeneratorsChanged(listener: (e: GeneratorNode) => any, thisArgs?: any): void;
  onLanguagesChanged(listener: (e: TextXNode) => any, thisArgs?: any): void;
}

@injectable()
export class EventService implements IEventService {

  private readonly eventEmitters: Map<symbol, any> = new Map<symbol, any>();

  constructor() {
    this.eventEmitters[TYPES.TextXNode] = new EventEmitter<TextXNode | undefined>();
    this.eventEmitters[TYPES.GeneratorNode] = new EventEmitter<GeneratorNode | undefined>();
  }

  public getEmitter<T>(type: symbol): EventEmitter<T | undefined> {
    return this.eventEmitters[type];
  }

  public fireGeneratorsChanged(): void {
    this.getEmitter<GeneratorNode>(TYPES.GeneratorNode).fire();
  }

  public fireLanguagesChanged(): void {
    this.getEmitter<TextXNode>(TYPES.TextXNode).fire();
  }

  public onGeneratorsChanged(listener: (e: GeneratorNode) => any, thisArgs?: any): void {
    this.getEmitter(TYPES.GeneratorNode).event(listener, thisArgs);
  }

  public onLanguagesChanged(listener: (e: TextXNode) => any, thisArgs?: any): void {
    this.getEmitter(TYPES.TextXNode).event(listener, thisArgs);
  }

}
