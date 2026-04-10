import { saveConfig } from "../lib/config.js";
import {
  fetchAuthenticatedUser,
  pollDeviceAuthorization,
  startDeviceAuthorization
} from "../lib/github.js";
import { prompt } from "../lib/prompt.js";

function normalizeScope(scope) {
  return scope
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(" ");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function authenticateWithDeviceFlow({ clientId, scope }) {
  const session = await startDeviceAuthorization({ clientId, scope });

  console.log("Open this URL in your browser:");
  console.log(session.verification_uri || "https://github.com/login/device");
  console.log(`Enter this code: ${session.user_code}`);

  let intervalMs = Number(session.interval || 5) * 1000;
  const expiresAt = Date.now() + Number(session.expires_in || 900) * 1000;

  while (Date.now() < expiresAt) {
    await delay(intervalMs);
    const tokenResponse = await pollDeviceAuthorization({
      clientId,
      deviceCode: session.device_code
    });

    if (tokenResponse.access_token) {
      return tokenResponse.access_token;
    }

    if (tokenResponse.error === "authorization_pending") {
      continue;
    }

    if (tokenResponse.error === "slow_down") {
      intervalMs += 5000;
      continue;
    }

    if (tokenResponse.error === "expired_token") {
      throw new Error("GitHub device code expired before authorization completed.");
    }

    if (tokenResponse.error === "access_denied") {
      throw new Error("GitHub device authorization was denied.");
    }

    throw new Error(tokenResponse.error_description || tokenResponse.error || "GitHub auth failed.");
  }

  throw new Error("Timed out waiting for GitHub device authorization.");
}

export async function connectCommand(parsed = { flags: {} }) {
  const envToken = process.env.GITHUB_TOKEN?.trim();
  const envClientId = process.env.MARD_GITHUB_CLIENT_ID?.trim();
  const usernameFlag =
    typeof parsed.flags.username === "string" ? parsed.flags.username.trim() : "";
  const tokenFlag = typeof parsed.flags.token === "string" ? parsed.flags.token.trim() : "";
  const clientIdFlag =
    typeof parsed.flags["client-id"] === "string" ? parsed.flags["client-id"].trim() : "";
  const scopeFlag = typeof parsed.flags.scope === "string" ? parsed.flags.scope.trim() : "";
  const scope = normalizeScope(
    scopeFlag || process.env.MARD_GITHUB_SCOPE || "read:user user:email public_repo"
  );
  const clientId = clientIdFlag || envClientId;

  let token = tokenFlag || envToken;
  let authMode = token ? "token" : "device";

  if (!token) {
    if (clientId) {
      token = await authenticateWithDeviceFlow({ clientId, scope });
    } else {
      token = await prompt("GitHub personal access token");
      authMode = "token";
    }
  }

  if (!token) {
    throw new Error(
      "GitHub authentication is required. Set MARD_GITHUB_CLIENT_ID for device flow or provide --token."
    );
  }

  const profile = await fetchAuthenticatedUser(token);
  if (usernameFlag && profile.login.toLowerCase() !== usernameFlag.toLowerCase()) {
    throw new Error(
      `Authenticated GitHub user is "${profile.login}", but you entered "${usernameFlag}".`
    );
  }

  const configPath = await saveConfig({
    github: {
      username: profile.login,
      token,
      connectedAt: new Date().toISOString(),
      authMode,
      scope,
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
