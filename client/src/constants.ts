import { resolve } from "path";

const IS_WIN = process.platform === "win32";
const LS_VENV_NAME = "textxls";
const LS_WHEELS_DIR = "wheels";
const TEXTX_LS_CORE = "textx_ls_core";
const TEXTX_LS_SERVER = "textx_ls_server";

export {
  IS_WIN,
  LS_VENV_NAME,
  LS_WHEELS_DIR,
  TEXTX_LS_CORE,
  TEXTX_LS_SERVER,
};
