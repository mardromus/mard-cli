import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const CONFIG_DIR = path.join(os.homedir(), ".mard");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

export function getConfigPath() {
  return CONFIG_PATH;
}

export async function loadConfig() {
  try {
    const raw = await readFile(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }

    throw new Error(`Unable to read config at ${CONFIG_PATH}.`);
  }
}

export async function saveConfig(config) {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return CONFIG_PATH;
}
