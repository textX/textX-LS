import { join } from "path";
import { extensions } from "vscode";
import { ICommand } from "./interfaces";
import { getCommands } from "./utils";

// Extension info
export const EXTENSION_JSON = extensions.getExtension("textX.textX").packageJSON;
export const EXTENSION_NAME = EXTENSION_JSON.displayName;
export const EXTENSION_PATH = EXTENSION_JSON.extensionLocation.path;
export const RESOURCES_PATH = join(EXTENSION_PATH, "resources");

// Other
export const EXTENSION_GENERATOR_TARGET = "vscode";
export const IS_WIN = process.platform === "win32";
export const LS_VENV_NAME = "textxls";
export const LS_WHEELS_DIR = "wheels";
export const TEXTX_LS_CORE = "textx_ls_core";
export const TEXTX_LS_SERVER = "textx_ls_server";

// Commands
// TextX-LS
export const CMD_GENERATE_EXTENSION: ICommand = getCommands("generateExtension");
export const CMD_GENERATOR_LIST: ICommand =  getCommands("getGenerators");
export const CMD_LANGUAGE_INSTALL: ICommand = getCommands("installLanguage");
export const CMD_LANGUAGE_INSTALL_EDITABLE: ICommand = getCommands("installLanguageEditable");
export const CMD_LANGUAGE_LIST: ICommand = getCommands("getLanguages");
export const CMD_LANGUAGE_SCAFFOLD: ICommand = getCommands("scaffoldLanguage");
export const CMD_LANGUAGE_UNINSTALL: ICommand = getCommands("uninstallLanguage");
// VS Code
export const VS_CMD_INSTALL_EXTENSION = "workbench.extensions.installExtension";
