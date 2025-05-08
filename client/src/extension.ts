import * as net from "net";
import { commands, ExtensionContext, window, StatusBarAlignment } from "vscode";
import { Executable, LanguageClient, LanguageClientOptions, ServerOptions, State, TransportKind } from "vscode-languageclient/node";
import { CMD_PING, PING_INTERVAL, TEXTX_LS_SERVER } from "./constants";
import container from "./inversify.config";
import { installLSWithProgress } from "./python";
import TYPES from "./types";
import { IGeneratorProvider, ILanguageProvider } from "./ui/explorer";

// Connection state tracking
enum ConnectionState {
  Disconnected,
  Connecting,
  Connected
}

let client: LanguageClient;
let connectionState: ConnectionState = ConnectionState.Disconnected;
let statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
let serverSocket: net.Socket | null = null;
let pingInterval: NodeJS.Timeout | null = null;

function updateStatusBar() {
  switch (connectionState) {
    case ConnectionState.Connected:
      statusBarItem.text = "$(check) textX";
      statusBarItem.tooltip = "textX language server connected";
      break;
    case ConnectionState.Connecting:
      statusBarItem.text = "$(sync~spin) textX";
      statusBarItem.tooltip = "Connecting to textX language server...";
      break;
    case ConnectionState.Disconnected:
      statusBarItem.text = "$(alert) textX";
      statusBarItem.tooltip = "textX language server disconnected";
      break;
  }
  statusBarItem.show();
}

function getClientOptions(): LanguageClientOptions {
  return {
    documentSelector: ["*"],
    outputChannelName: "textX",
  };
}

function isStartedInDebugMode(): boolean {
  return process.env.VSCODE_DEBUG_MODE === "true";
}

async function startLangServerTCP(context: ExtensionContext, port: number): Promise<LanguageClient> {
  return new Promise((resolve, reject) => {
    // Destroy any existing socket first
    if (serverSocket) {
      serverSocket.destroy();
      serverSocket = null;
    }

    serverSocket = net.createConnection({ port, host: '127.0.0.1' }, () => {
      const serverOptions: ServerOptions = () => Promise.resolve({
        reader: serverSocket!,
        writer: serverSocket!
      });
      const newClient = new LanguageClient("textX", serverOptions, getClientOptions());

      // Add error handler to the client
      newClient.onDidChangeState(({ newState }) => {
        if (newState === State.Stopped) {
          handleConnectionLoss(context);
        }
      });

      resolve(newClient);
    });

    serverSocket.on('error', (err) => {
      // Don't reject immediately for ECONNREFUSED - this might be temporary
      if ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
        setTimeout(() => reject(err), 1000); // Give server time to start
      } else {
        reject(err);
      }
    });

    serverSocket.on('close', () => {
      if (connectionState !== ConnectionState.Disconnected) {
        handleConnectionLoss(context);
      }
    });
  });
}
async function startLangServerProcess(command: string, args: string[], cwd: string): Promise<LanguageClient> {
  const serverOptions: ServerOptions = {
    args,
    command,
    options: { cwd },
    transport: TransportKind.stdio,
  } as Executable;

  return new LanguageClient(
    "textX",
    serverOptions,
    getClientOptions()
  );
}

async function createClient(context: ExtensionContext): Promise<LanguageClient> {
  connectionState = ConnectionState.Connecting;
  updateStatusBar();

  try {
    let newClient: LanguageClient;
    if (isStartedInDebugMode()) {
      newClient = await connectWithRetry(context, parseInt(process.env.SERVER_PORT || "2087"));
    } else {
      const python = await installLSWithProgress(context);
      newClient = await startLangServerProcess(python, ["-m", TEXTX_LS_SERVER], context.extensionPath);
    }

    connectionState = ConnectionState.Connected;
    updateStatusBar();
    return newClient;
  } catch (err) {
    connectionState = ConnectionState.Disconnected;
    updateStatusBar();
    throw err;
  }
}

async function connectWithRetry(context: ExtensionContext, port: number, maxRetries = 10): Promise<LanguageClient> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await startLangServerTCP(context, port);

      // Add small delay to let server stabilize
      await new Promise(resolve => setTimeout(resolve, 500));
      return client;

    } catch (err) {
      lastError = err as Error;

      // Special handling for connection refused
      if (err.code === 'ECONNREFUSED') {
        window.setStatusBarMessage(`Waiting for server... (attempt ${attempt}/${maxRetries})`, 3000);
      } else {
        window.setStatusBarMessage(`Connection failed: ${lastError.message}`, 3000);
      }

      if (attempt < maxRetries) {
        // More aggressive delay for ECONNREFUSED
        const delay = err.code === 'ECONNREFUSED'
          ? 1000 * attempt
          : Math.min(1000 * Math.pow(2, attempt), 30000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max connection retries reached");
}

function handleConnectionLoss(context: ExtensionContext) {
  if (connectionState !== ConnectionState.Disconnected) {
    connectionState = ConnectionState.Disconnected;
    updateStatusBar();
    window.showWarningMessage("textX server disconnected. Attempting to reconnect...");
    restartClient(context);
  }
}

async function setupClientMonitor(context: ExtensionContext) {
  // Clear any existing interval
  if (pingInterval) {
    clearInterval(pingInterval);
  }

  // Ping-based detection
  pingInterval = setInterval(async () => {
    if (connectionState === ConnectionState.Connected) {
      try {
        await commands.executeCommand(CMD_PING.external);
      } catch {
        handleConnectionLoss(context);
      }
    }
  }, PING_INTERVAL);

  // State change detection
  client.onDidChangeState(({ newState }) => {
    if (newState === State.Stopped) {
      handleConnectionLoss(context);
    }
  });
}

let isRestarting = false;

async function restartClient(context: ExtensionContext) {
  if (isRestarting) {
    return;
  }
  isRestarting = true;

  try {
    connectionState = ConnectionState.Connecting;
    updateStatusBar();

    // Clean up old connection
    if (client) {
      try {
        await client.stop().catch(() => { });
      } catch (err) {
        console.warn("Error stopping client:", err);
      }
    }

    if (serverSocket) {
      serverSocket.destroy();
      serverSocket = null;
    }

    // Add delay before reconnecting
    await new Promise(resolve => setTimeout(resolve, 1000));

    client = await createClient(context);
    await client.start();

    // Additional stabilization delay
    await new Promise(resolve => setTimeout(resolve, 500));

    setupClientMonitor(context);

  } catch (err) {
    connectionState = ConnectionState.Disconnected;
    updateStatusBar();
    window.showErrorMessage(`Failed to reconnect: ${err.message}`);
  } finally {
    isRestarting = false;
  }
}

export async function activate(context: ExtensionContext) {
  try {
    client = await createClient(context);
    await client.start();

    setupClientMonitor(context);

    // Register providers
    const generatorProvider = container.get<IGeneratorProvider>(TYPES.IGeneratorProvider);
    const languageProvider = container.get<ILanguageProvider>(TYPES.ILanguageProvider);

    context.subscriptions.push(
      window.registerTreeDataProvider("textxGenerators", generatorProvider),
      window.registerTreeDataProvider("textxLanguages", languageProvider),
      client,
      statusBarItem,
      commands.registerCommand("textX.reconnect", restartClient),
      {
        dispose: () => {
          if (pingInterval) {
            clearInterval(pingInterval);
          }
          if (serverSocket) {
            serverSocket.destroy();
          }
        }
      }
    );

  } catch (err) {
    connectionState = ConnectionState.Disconnected;
    updateStatusBar();
    window.showErrorMessage(`textX server failed to initialize: ${err}`);
  }
}

export function deactivate(): Thenable<void> {
  connectionState = ConnectionState.Disconnected;
  updateStatusBar();

  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }

  if (serverSocket) {
    serverSocket.destroy();
    serverSocket = null;
  }

  if (!client) {
    return Promise.resolve();
  }
  return client.stop();
}
