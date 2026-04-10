import { connectCommand } from "../commands/connect.js";
import { helpCommand } from "../commands/help.js";
import { talkCommand } from "../commands/talk.js";
import { whoAmICommand } from "../commands/whoami.js";
import { ensureConnected } from "./bootstrap.js";
import { parseArgs } from "./parse-args.js";

export async function runCli(argv) {
  const parsed = parseArgs(argv);
  const [command = "help"] = parsed.positionals;

  if (parsed.flags.help || command === "help" || command === "--help" || command === "-h") {
    await helpCommand();
    return;
  }

  if (command === "connect") {
    await connectCommand(parsed);
    return;
  }

  if (command === "whoami") {
    await whoAmICommand();
    return;
  }

  if (command === "talk") {
    await ensureConnected();
    await talkCommand(parsed);
    return;
  }

  if (command === "init" || command === "start" || command === "onboard") {
    await ensureConnected(true);
    return;
  }

  if (argv.length === 0) {
    await ensureConnected(true);
    return;
  }

  throw new Error(`Unknown command "${command}". Run "mard help".`);
}
