import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

export async function prompt(question, fallback) {
  const rl = readline.createInterface({ input, output });
  try {
    const suffix = fallback ? ` (${fallback})` : "";
    const answer = await rl.question(`${question}${suffix}: `);
    return answer.trim() || fallback || "";
  } finally {
    rl.close();
  }
}
