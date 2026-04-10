const API_ROOT = "https://api.github.com";
const WEB_ROOT = "https://github.com";

async function githubFetch(pathname, token, init = {}) {
  const response = await fetch(`${API_ROOT}${pathname}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "mard-cli",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const details = await safeJson(response);
    const suffix = details?.message ? ` ${details.message}` : "";
    throw new Error(`GitHub API ${response.status}.${suffix}`.trim());
  }

  return safeJson(response);
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toFormBody(payload) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && value !== "") {
      body.set(key, String(value));
    }
  }
  return body;
}

export async function fetchAuthenticatedUser(token) {
  return githubFetch("/user", token);
}

export async function fetchUserProfile(username, token) {
  return githubFetch(`/users/${encodeURIComponent(username)}`, token);
}

export async function fetchUserRepos(username, token) {
  return githubFetch(
    `/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=5&type=owner`,
    token
  );
}

export async function fetchUserEvents(username, token) {
  return githubFetch(`/users/${encodeURIComponent(username)}/events/public?per_page=10`, token);
}

export async function openIssue({ owner, repo, token, title, body }) {
  return githubFetch(`/repos/${owner}/${repo}/issues`, token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      body
    })
  });
}

export async function fetchRepository(owner, repo, token) {
  return githubFetch(`/repos/${owner}/${repo}`, token);
}

export async function startDeviceAuthorization({ clientId, scope }) {
  const response = await fetch(`${WEB_ROOT}/login/device/code`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "mard-cli"
    },
    body: toFormBody({
      client_id: clientId,
      scope
    })
  });

  const details = await safeJson(response);
  if (!response.ok) {
    const suffix = details?.error_description || details?.error || "Device authorization failed.";
    throw new Error(suffix);
  }

  return details;
}

export async function pollDeviceAuthorization({ clientId, deviceCode }) {
  const response = await fetch(`${WEB_ROOT}/login/oauth/access_token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "mard-cli"
    },
    body: toFormBody({
      client_id: clientId,
      device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code"
    })
  });

  const details = await safeJson(response);
  if (!response.ok) {
    const suffix = details?.error_description || details?.error || "Token polling failed.";
    throw new Error(suffix);
  }

  return details;
}
