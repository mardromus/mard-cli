import { connectCommand } from "../commands/connect.js";
import { helpCommand } from "../commands/help.js";
import { loadConfig } from "./config.js";

export async function ensureConnected(interactiveOnly = false) {
  const config = await loadConfig();
  if (config?.github?.username && config?.github?.token) {
    if (interactiveOnly) {
      await helpCommand();
    }
    return config;
  }

  console.log("Connect your GitHub profile to start using Mard.");
  await connectCommand({
    flags: {},
    positionals: ["connect"]
  });
}
