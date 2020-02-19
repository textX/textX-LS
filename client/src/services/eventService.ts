import { injectable } from "inversify";
import { EventEmitter } from "vscode";
import TYPES from "../types";
import { TextXNode } from "../ui/explorer/textxNode";

export interface IEventService {
  getEmitter<T>(type: symbol): EventEmitter<T | undefined>;
  fireTextxProjectChanged(): void;
  onTextxProjectChange(listener: (e: TextXNode) => any, thisArgs?: any): void;
}

@injectable()
export class EventService implements IEventService {

  private readonly eventEmitters: Map<symbol, any> = new Map<symbol, any>();

  constructor() {
    this.eventEmitters[TYPES.TextXNode] = new EventEmitter<TextXNode | undefined>();
  }

  public getEmitter<T>(type: symbol): EventEmitter<T | undefined> {
    return this.eventEmitters[type];
  }

  public fireTextxProjectChanged(): void {
    this.getEmitter<TextXNode>(TYPES.TextXNode).fire();
  }

  public onTextxProjectChange(listener: (e: TextXNode) => any, thisArgs?: any): void {
    this.getEmitter(TYPES.TextXNode).event(listener, thisArgs);
  }

}
