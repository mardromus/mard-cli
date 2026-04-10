import { writeFile } from "node:fs/promises";
import { loadConfig } from "../lib/config.js";
import { printSection } from "../lib/format.js";
import {
  fetchRepository,
  fetchUserEvents,
  fetchUserProfile,
  fetchUserRepos,
  openIssue
} from "../lib/github.js";
import {
  buildIssueTitle,
  buildOutreachMessage,
  buildOutreachReport,
  deriveContactOptions
} from "../lib/outreach.js";

export async function talkCommand(parsed) {
  const config = await loadConfig();
  const sourceProfile = config.github.profile;
  const [, username] = parsed.positionals;

  if (!username) {
    throw new Error("Target GitHub username is required. Example: mard talk octocat");
  }

  const token = config.github.token;
  const [targetProfile, repos, events] = await Promise.all([
    fetchUserProfile(username, token),
    fetchUserRepos(username, token),
    fetchUserEvents(username, token)
  ]);

  const contacts = deriveContactOptions(targetProfile, repos);
  const message =
    typeof parsed.flags.message === "string"
      ? parsed.flags.message
      : buildOutreachMessage({
          sourceProfile,
          targetProfile,
          repos,
          events
        });
  const report = buildOutreachReport({
    targetProfile,
    contacts,
    repos,
    message
  });

  if (parsed.flags.format === "json") {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printSection("Target", [
      `${targetProfile.name || targetProfile.login} (${targetProfile.login})`,
      targetProfile.bio || "No bio provided",
      targetProfile.html_url
    ]);

    printSection(
      "Contact options",
      contacts.length
        ? contacts.map((item) => `${item.type}: ${item.value} (${item.note})`)
        : ["No public contact paths detected."]
    );

    printSection(
      "Recent repos",
      repos.length
        ? repos.map(
            (repo) =>
              `${repo.name} | ${repo.stargazers_count} stars | ${repo.language || "n/a"} | ${repo.html_url}`
          )
        : ["No repositories found."]
    );

    printSection("Draft message", message.split("\n"));
  }

  if (typeof parsed.flags.save === "string") {
    const output =
      parsed.flags.format === "json"
        ? `${JSON.stringify(report, null, 2)}\n`
        : `${message}\n`;
    await writeFile(parsed.flags.save, output, "utf8");
    printSection("Saved", [parsed.flags.save]);
  }

  if (!parsed.flags["open-issue"]) {
    return;
  }

  const repoName = typeof parsed.flags.repo === "string" ? parsed.flags.repo : repos[0]?.name;
  if (!repoName) {
    throw new Error("No target repository available for issue creation.");
  }

  const repository = await fetchRepository(targetProfile.login, repoName, token);
  if (repository.archived) {
    throw new Error(`Repository "${repository.full_name}" is archived.`);
  }

  if (!repository.has_issues) {
    throw new Error(`Repository "${repository.full_name}" does not have issues enabled.`);
  }

  const issue = await openIssue({
    owner: targetProfile.login,
    repo: repoName,
    token,
    title:
      typeof parsed.flags.title === "string"
        ? parsed.flags.title
        : buildIssueTitle(targetProfile),
    body: message
  });

  printSection("Issue created", [issue.html_url]);
}
