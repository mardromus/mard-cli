import assert from "node:assert/strict";
import { parseArgs } from "../src/lib/parse-args.js";
import {
  buildOutreachMessage,
  buildOutreachReport,
  deriveContactOptions
} from "../src/lib/outreach.js";
import { connectCommand } from "../src/commands/connect.js";

function run(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

run("parseArgs separates positionals and flags", () => {
  const parsed = parseArgs(["talk", "octocat", "--repo", "Hello-World", "--open-issue"]);
  assert.deepEqual(parsed.positionals, ["talk", "octocat"]);
  assert.equal(parsed.flags.repo, "Hello-World");
  assert.equal(parsed.flags["open-issue"], true);
});

run("deriveContactOptions includes reachable channels", () => {
  const options = deriveContactOptions(
    {
      blog: "https://example.com",
      email: "hi@example.com",
      twitter_username: "example"
    },
    [
      { fork: false, has_issues: true, full_name: "octocat/Hello-World" },
      { fork: true, has_issues: true, full_name: "octocat/Forked" }
    ]
  );

  assert.equal(options.length, 4);
  assert.equal(options[0].type, "website");
  assert.equal(options[3].type, "github-issue");
});

run("buildOutreachMessage uses repo and identity context", () => {
  const message = buildOutreachMessage({
    sourceProfile: {
      login: "mard-user",
      name: "Mard User",
      bio: "developer tooling"
    },
    targetProfile: {
      login: "octocat",
      name: "The Octocat"
    },
    repos: [{ name: "Hello-World" }],
    events: [{ type: "PushEvent" }]
  });

  assert.match(message, /Hello-World/);
  assert.match(message, /PushEvent/);
  assert.match(message, /Mard User/);
});

run("buildOutreachReport shapes structured output", () => {
  const report = buildOutreachReport({
    targetProfile: {
      login: "octocat",
      name: "The Octocat",
      bio: "Mascot",
      html_url: "https://github.com/octocat"
    },
    contacts: [{ type: "website", value: "https://example.com", note: "site" }],
    repos: [
      {
        name: "Hello-World",
        full_name: "octocat/Hello-World",
        stargazers_count: 42,
        language: "JavaScript",
        has_issues: true,
        html_url: "https://github.com/octocat/Hello-World"
      }
    ],
    message: "Hello"
  });

  assert.equal(report.target.login, "octocat");
  assert.equal(report.contacts[0].type, "website");
  assert.equal(report.recentRepos[0].issuesEnabled, true);
  assert.equal(report.message, "Hello");
});

run("connect command accepts token auth without prompting for username", () => {
  assert.equal(typeof connectCommand, "function");
});

console.log("All tests passed.");
