import * as net from "net";
import { commands, ExtensionContext, window } from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient";

import { CMD_PING, IS_WIN, PING_INTERVAL, TEXTX_LS_SERVER } from "./constants";
import container from "./inversify.config";
import { IWatcherService } from "./services";
import { installLSWithProgress } from "./setup";
import TYPES from "./types";
import { IGeneratorProvider, ILanguageProvider } from "./ui/explorer";

let client: LanguageClient;

function getClientOptions(): LanguageClientOptions {
  return {
    documentSelector: ["*"],
    outputChannelName: "textX",
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

  if (isStartedInDebugMode()) {
    // Development - Run the server manually
    client = startLangServerTCP(parseInt(process.env.SERVER_PORT || "2087"));
  } else {
    // Production - Client is going to run the server (for use within `.vsix` package)
    try {
      const python = await installLSWithProgress(context);
      client = startLangServer(python, ["-m", TEXTX_LS_SERVER], context.extensionPath);
    } catch (err) {
      window.showErrorMessage(err);
    }
  }

  client.onReady().then(() => {
    // inversifyjs - get instances
    const generatorProvider = container.get<IGeneratorProvider>(TYPES.IGeneratorProvider);
    const languageProvider = container.get<ILanguageProvider>(TYPES.ILanguageProvider);
    const watcherService = container.get<IWatcherService>(TYPES.IWatcherService);

    // Tree Providers
    context.subscriptions.push(window.registerTreeDataProvider("textxGenerators", generatorProvider));
    context.subscriptions.push(window.registerTreeDataProvider("textxLanguages", languageProvider));
    context.subscriptions.push(watcherService);

    // Ping server -  temporary fix for windows
    // It's like server goes into IDLE state and subprocesses are paused
    if (!isStartedInDebugMode() && IS_WIN) {
      setInterval(() => {
        commands.executeCommand(CMD_PING.external);
      }, PING_INTERVAL);
    }
  });

  context.subscriptions.push(client.start());
}

export function deactivate(): Thenable<void> {
  if (!client) {
    return Promise.resolve();
  }
  return client.stop();
}
