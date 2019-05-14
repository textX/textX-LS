import { join } from "path";
import { extensions } from "vscode";

const EXTENSION_JSON = extensions.getExtension("textX.textX").packageJSON;
const EXTENSION_NAME = EXTENSION_JSON.displayName;
const EXTENSION_PATH = EXTENSION_JSON.extensionLocation.path;
const RESOURCES_PATH = join(EXTENSION_PATH, "resources");

const IS_WIN = process.platform === "win32";
const LS_VENV_NAME = "textxls";
const LS_WHEELS_DIR = "wheels";
const TEXTX_LS_CORE = "textx_ls_core";
const TEXTX_LS_SERVER = "textx_ls_server";

const CMD_GET_GENERATORS = "textx/getGenerators";
const CMD_GET_LANGUAGES = "textx/getLanguages";

export {
  CMD_GET_GENERATORS,
  CMD_GET_LANGUAGES,
  EXTENSION_NAME,
  EXTENSION_PATH,
  IS_WIN,
  LS_VENV_NAME,
  LS_WHEELS_DIR,
  RESOURCES_PATH,
  TEXTX_LS_CORE,
  TEXTX_LS_SERVER,
};
