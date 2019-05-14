import { ICommand } from "./interfaces";

export function getCommands(command: string): ICommand {
  return {
    external: `textx/${command}`,
    internal: `textx.${command}`,
  };
}
