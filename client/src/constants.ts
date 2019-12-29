import { join } from "path";
import { extensions } from "vscode";
import { ICommand } from "./interfaces";
import { getCommands } from "./utils";

// Extension info
export const EXTENSION_JSON = extensions.getExtension("textX.textX").packageJSON;
export const EXTENSION_NAME = EXTENSION_JSON.displayName;
export const EXTENSION_PATH = EXTENSION_JSON.extensionLocation.fsPath;
export const RESOURCES_PATH = join(EXTENSION_PATH, "resources");

// Other
export const EXTENSION_GENERATOR_TARGET = "vscode";
export const EXTENSION_SYNTAX_HIGHLIGHT_TARGET = "textmate";
export const IS_WIN = process.platform === "win32";
export const LS_VENV_NAME = "textxls";
export const LS_VENV_PATH = join(EXTENSION_PATH, LS_VENV_NAME);
export const LS_WHEELS_DIR = "wheels";
export const TEXTX_LS_CORE = "textx_ls_core";
export const TEXTX_LS_SERVER = "textx_ls_server";
export const VSCE_COMMAND_PATH = IS_WIN ?
    join(EXTENSION_PATH, "libs", "vsce") :
    join(EXTENSION_PATH, "libs", "node_modules", "vsce", "out", "vsce");

// Commands
// TextX-LS
export const CMD_GENERATE_EXTENSION: ICommand = getCommands("generateExtension");
export const CMD_GENERATE_SYNTAXES: ICommand = getCommands("generateSyntaxes");
export const CMD_GENERATOR_LIST: ICommand = getCommands("getGenerators");
export const CMD_GENERATOR_LIST_REFRESH: ICommand = getCommands("refreshGenerators");
export const CMD_PROJECT_INSTALL: ICommand = getCommands("installProject");
export const CMD_PROJECT_INSTALL_EDITABLE: ICommand = getCommands("installProjectEditable");
export const CMD_PROJECT_LIST: ICommand = getCommands("getProjects");
export const CMD_PROJECT_LIST_REFRESH: ICommand = getCommands("refreshProjects");
export const CMD_PROJECT_SCAFFOLD: ICommand = getCommands("scaffoldProject");
export const CMD_PROJECT_UNINSTALL: ICommand = getCommands("uninstallProject");
export const CMD_VALIDATE_DOCUMENTS: ICommand = getCommands("validateDocuments");

// VS Code
export const VS_CMD_INSTALL_EXTENSION = "workbench.extensions.installExtension";
export const VS_CMD_UNINSTALL_EXTENSION = "workbench.extensions.uninstallExtension";
export const VS_CMD_WINDOW_RELOAD = "workbench.action.reloadWindow";

// Ping server on win - temporary fix
export const CMD_PING: ICommand = getCommands("ping");
export const PING_INTERVAL = 1000; // In milliseconds
