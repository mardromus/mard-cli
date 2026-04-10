export function parseArgs(argv) {
  const flags = {};
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("-")) {
      positionals.push(token);
      continue;
    }

    if (token === "--help" || token === "-h") {
      flags.help = true;
      continue;
    }

    if (!token.startsWith("--")) {
      flags[token.slice(1)] = true;
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith("-")) {
      flags[key] = next;
      index += 1;
      continue;
    }

    flags[key] = true;
  }

  return { flags, positionals };
}
