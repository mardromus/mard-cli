#!/usr/bin/env node

import { runCli } from "./lib/app.js";

runCli(process.argv.slice(2)).catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Mard failed: ${message}`);
  process.exitCode = 1;
});
