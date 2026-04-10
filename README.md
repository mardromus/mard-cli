# Mard CLI

Mard is a GitHub-first networking CLI. It asks users to connect their own GitHub profile first, then helps them reach out to another developer by GitHub handle with context-aware, respectful outreach drafts and practical contact options.

## Why this approach

GitHub does not provide profile DMs. Mard is honest about that. Instead of pretending there is a hidden messaging channel, it does the useful work:

- Connects your GitHub account.
- Fetches a target developer's public GitHub profile and recent activity.
- Surfaces reachable public channels such as website, email, X handle, and active issue-enabled repos.
- Drafts a personalized intro message based on both profiles.
- Optionally opens a GitHub issue for outreach when you explicitly choose a target repository.

## Install

### Local

```bash
npm install
npm link
```

### Run without linking

```bash
node ./src/cli.js
```

## Quick start

```bash
mard
mard connect
mard whoami
mard talk torvalds
mard talk octocat --repo Hello-World --open-issue
```

## Commands

### `mard`

Starts onboarding if you have not connected your GitHub profile yet. Otherwise shows the available commands.

### `mard connect`

Prompts for your GitHub username and personal access token, verifies the token against the GitHub API, and stores your profile locally.

You can also connect non-interactively:

```bash
mard connect --username your-handle --token github_pat_xxx
```

Mard reads the token in this order:

1. Existing saved config
2. `GITHUB_TOKEN`
3. Interactive prompt

### `mard whoami`

Shows the connected GitHub account and config location.

### `mard talk <github-username>`

Builds an outreach brief for the target user:

- Target profile summary
- Reachable public channels
- Recently active repositories
- A tailored intro message drafted from your connected profile

Options:

- `--repo <name>`: Choose a specific target repository.
- `--open-issue`: Create a GitHub issue in the target repository with the drafted message.
- `--title <text>`: Override the default issue title.
- `--message <text>`: Override the drafted message body.
- `--format json`: Print a machine-readable report.
- `--save <path>`: Save the generated output locally.

Example:

```bash
mard talk octocat --repo Hello-World --open-issue
mard talk octocat --format json --save outreach.json
```

## Token scopes

Recommended minimum scopes:

- `read:user`
- `user:email`

Add `public_repo` if you want `--open-issue` to work against public repositories.

## Security

- Config is stored in your home directory at `.mard/config.json`.
- Avoid sharing the saved config because it contains your token.
- Prefer fine-grained GitHub tokens when possible.

## Testing

```bash
npm test
```
