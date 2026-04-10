import { getConfigPath, loadConfig } from "../lib/config.js";

export async function whoAmICommand() {
  const config = await loadConfig();
  if (!config?.github?.username) {
    console.log("No GitHub profile connected. Run `mard connect`.");
    return;
  }

  console.log(`Connected GitHub: ${config.github.username}`);
  console.log(`Profile URL: ${config.github.profile?.html_url || "unknown"}`);
  console.log(`Auth mode: ${config.github.authMode || "token"}`);
  console.log(`Config path: ${getConfigPath()}`);
}
