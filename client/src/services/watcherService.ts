import { injectable } from "inversify";
import { FileSystemWatcher, workspace, GlobPattern } from "vscode";
import { Disposable } from "vscode-languageclient";

export interface IWatcherService extends Disposable {
  watch(key: string, pattern: GlobPattern): FileSystemWatcher;
  unwatch(key: string): void;
}

@injectable()
export class WatcherService implements IWatcherService {
  private watchers: Map<string, FileSystemWatcher> = new Map<string, FileSystemWatcher>();

  public dispose(): void {
    this.watchers.forEach((watcher) => watcher.dispose());
    this.watchers.clear();
  }

  public watch(key: string, pattern: GlobPattern): FileSystemWatcher {
    const watcher = workspace.createFileSystemWatcher(pattern);
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
