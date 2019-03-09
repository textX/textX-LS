import * as net from "net";
import { ExtensionContext, window, workspace } from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient";

import { TEXTX_LS_SERVER } from "./constants";
import { installLSWithProgress } from "./setup";
import { LanguagesManagerWidgetController } from "./ui/status-bar/languagesManagerStatusBarWidget";

let client: LanguageClient;

function getClientOptions(): LanguageClientOptions {
  return {
    documentSelector: ["*"],
    outputChannelName: "textX",
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };
}

function isStartedInDebugMode(): boolean {
  return process.env.VSCODE_DEBUG_MODE === "true";
}

function startLangServerTCP(addr: number): LanguageClient {
  const serverOptions: ServerOptions = () => {
    return new Promise((resolve, reject) => {
      const clientSocket = new net.Socket();
      clientSocket.connect(addr, "127.0.0.1", () => {
        resolve({
          reader: clientSocket,
          writer: clientSocket,
        });
      });
    });
  };

  return new LanguageClient(`textX-LS (port ${addr})`, serverOptions, getClientOptions());
}

function startLangServer(
  command: string, args: string[], cwd: string,
): LanguageClient {
  const serverOptions: ServerOptions = {
    args,
    command,
    options: { cwd },
  };

  return new LanguageClient(command, serverOptions, getClientOptions());
}

export async function activate(context: ExtensionContext) {

  // Instantiate widgets
  const langScaffoldWidgetController = new LanguagesManagerWidgetController(context);

  // Register widgets
  context.subscriptions.push(langScaffoldWidgetController);

  if (isStartedInDebugMode()) {
    // Development - Run the server manually
    client = startLangServerTCP(parseInt(process.env.SERVER_PORT));
  } else {
    // Production - Client is going to run the server (for use within `.vsix` package)
    try {
      const python = await installLSWithProgress(context);
      client = startLangServer(python, ["-m", TEXTX_LS_SERVER], context.extensionPath);
    } catch (err) {
      window.showErrorMessage(err);
    }
  }

  context.subscriptions.push(client.start());
}

export function deactivate(): Thenable<void> {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
