import { getCommands } from "./utils";

export const IS_WIN = process.platform === "win32";
export const LS_VENV_NAME = "textxls";
export const LS_WHEELS_DIR = "wheels";
export const TEXTX_LS_CORE = "textx_ls_core";
export const TEXTX_LS_SERVER = "textx_ls_server";

// Commands
export const CMD_LANG_INSTALL = getCommands("languageInstall");
export const CMD_LANG_LIST = getCommands("languageList");
export const CMD_LANG_SCAFFOLD = getCommands("languageScaffold");
export const CMD_LANG_UNINSTALL = getCommands("languageUninstall");
