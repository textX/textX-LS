import { join } from "path";
import { extensions } from "vscode";
import { ICommand } from "./interfaces";

export const EXTENSION_JSON = extensions.getExtension("textX.textX").packageJSON;
export const EXTENSION_NAME = EXTENSION_JSON.displayName;
export const EXTENSION_PATH = EXTENSION_JSON.extensionLocation.path;
export const RESOURCES_PATH = join(EXTENSION_PATH, "resources");

export const IS_WIN = process.platform === "win32";
export const LS_VENV_NAME = "textxls";
export const LS_WHEELS_DIR = "wheels";
export const TEXTX_LS_CORE = "textx_ls_core";
export const TEXTX_LS_SERVER = "textx_ls_server";

export function getCommands(command: string): ICommand {
  return {
    external: `textx/${command}`,
    internal: `textx.${command}`,
  };
}
export const CMD_GET_GENERATORS: ICommand =  getCommands("getGenerators");
export const CMD_GET_LANGUAGES: ICommand = getCommands("getLanguages");
export const CMD_INSTALL_LANGUAGE: ICommand = getCommands("installLanguage");
export const CMD_INSTALL_LANGUAGE_EDITABLE: ICommand = getCommands("installLanguageEditable");
export const CMD_UNINSTALL_LANGUAGE: ICommand = getCommands("uninstallLanguage");
export const CMD_SCAFFOLD_LANGUAGE: ICommand = getCommands("scaffoldLanguage");
