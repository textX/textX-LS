import { injectable } from "inversify";
import { FileSystemWatcher, workspace } from "vscode";
import { Disposable } from "vscode-languageclient";

export interface IWatcherService extends Disposable {
  watch(key: string, path: string): FileSystemWatcher;
  unwatch(key: string): void;
}

@injectable()
export class WatcherService implements IWatcherService {
  private watchers: Map<string, FileSystemWatcher> = new Map<string, FileSystemWatcher>();

  public dispose(): void {
    this.watchers.forEach((watcher) => watcher.dispose());
    this.watchers.clear();
  }

  public watch(key: string, path: string): FileSystemWatcher {
    const watcher = workspace.createFileSystemWatcher(path);
    this.watchers.set(key, watcher);
    return watcher;
  }

  public unwatch(key: string): void {
    if (this.watchers.has(key)) {
      this.watchers.get(key).dispose();
      this.watchers.delete(key);
    }
  }

}
