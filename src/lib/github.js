const API_ROOT = "https://api.github.com";

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
