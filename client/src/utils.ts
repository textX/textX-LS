import { mkdtemp, unlink } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { window } from "vscode";
import { ICommand } from "./interfaces";

export function getCommands(command: string): ICommand {
  return {
    external: `textx/${command}`,
    internal: `textx.${command}`,
  };
}

// tslint:disable-next-line:max-line-length
export function mkdtempWrapper(callback: (folder: string) => Promise<void>): void {
  mkdtemp(join(tmpdir(), "textx-"), async (err, folder) => {
    if (err) {
      window.showErrorMessage(`Cannot create temp directory.`);
    }
    await callback(folder);
    unlink(folder, (unlinkErr) => unlinkErr );
  });
}
