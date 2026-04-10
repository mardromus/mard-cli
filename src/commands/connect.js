import { saveConfig } from "../lib/config.js";
import { fetchAuthenticatedUser } from "../lib/github.js";
import { prompt } from "../lib/prompt.js";

export async function connectCommand(parsed = { flags: {} }) {
  const envToken = process.env.GITHUB_TOKEN?.trim();
  const usernameFlag =
    typeof parsed.flags.username === "string" ? parsed.flags.username.trim() : "";
  const tokenFlag = typeof parsed.flags.token === "string" ? parsed.flags.token.trim() : "";
  const username = usernameFlag || (await prompt("GitHub username"));
  const token = tokenFlag || envToken || (await prompt("GitHub personal access token"));

  if (!username) {
    throw new Error("GitHub username is required.");
  }

  if (!token) {
    throw new Error("GitHub token is required.");
  }

  const profile = await fetchAuthenticatedUser(token);
  if (profile.login.toLowerCase() !== username.toLowerCase()) {
    throw new Error(
      `Authenticated GitHub user is "${profile.login}", but you entered "${username}".`
    );
  }

  const configPath = await saveConfig({
    github: {
      username: profile.login,
      token,
      connectedAt: new Date().toISOString(),
      profile: {
        login: profile.login,
        name: profile.name,
        html_url: profile.html_url,
        bio: profile.bio,
        public_repos: profile.public_repos
      }
    }
  });

  console.log(`Connected ${profile.login}.`);
  console.log(`Saved config to ${configPath}.`);
}
