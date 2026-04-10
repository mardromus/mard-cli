export function deriveContactOptions(profile, repos) {
  const options = [];

  if (profile.blog) {
    options.push({
      type: "website",
      value: profile.blog,
      note: "Personal site or portfolio"
    });
  }

  if (profile.email) {
    options.push({
      type: "email",
      value: profile.email,
      note: "Public email on GitHub"
    });
  }

  if (profile.twitter_username) {
    options.push({
      type: "x",
      value: `https://x.com/${profile.twitter_username}`,
      note: "Public social handle"
    });
  }

  const issueReadyRepos = repos
    .filter((repo) => !repo.fork && repo.has_issues)
    .slice(0, 3)
    .map((repo) => ({
      type: "github-issue",
      value: repo.full_name,
      note: "Issues enabled"
    }));

  return [...options, ...issueReadyRepos];
}

export function buildOutreachMessage({ sourceProfile, targetProfile, repos, events }) {
  const repoNames = repos.slice(0, 3).map((repo) => repo.name);
  const recentEvent = events[0]?.type ? `I noticed your recent ${events[0].type}.` : "";
  const sharedContext = sourceProfile.bio
    ? `I’m reaching out from ${sourceProfile.name || sourceProfile.login}'s side of GitHub, where I focus on ${sourceProfile.bio}.`
    : `I’m reaching out from ${sourceProfile.name || sourceProfile.login}'s side of GitHub.`;
  const focusLine = repoNames.length
    ? `Your recent work on ${repoNames.join(", ")} stood out to me.`
    : `Your GitHub profile stood out to me.`;

  return [
    `Hi ${targetProfile.name || targetProfile.login},`,
    "",
    sharedContext,
    focusLine,
    recentEvent,
    "I’d like to start a conversation about what you’re building and where we might collaborate or help each other.",
    "If you’re open to it, I’d be glad to continue wherever is easiest for you.",
    "",
    `Best,`,
    `${sourceProfile.name || sourceProfile.login}`
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildIssueTitle(targetProfile) {
  return `Intro from Mard for ${targetProfile.login}`;
}

export function buildOutreachReport({ targetProfile, contacts, repos, message }) {
  return {
    target: {
      login: targetProfile.login,
      name: targetProfile.name,
      bio: targetProfile.bio,
      url: targetProfile.html_url
    },
    contacts,
    recentRepos: repos.map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      stars: repo.stargazers_count,
      language: repo.language,
      issuesEnabled: repo.has_issues,
      url: repo.html_url
    })),
    message
  };
}
