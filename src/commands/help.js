export async function helpCommand() {
  console.log(`Mard CLI

Commands:
  mard connect                     Connect your GitHub profile
  mard whoami                      Show the connected GitHub account
  mard talk <username>             Build outreach for a GitHub profile
  mard talk <username> --repo X --open-issue
                                   Open a GitHub issue with the drafted intro

Flags:
  --username <name>                Provide GitHub username to connect
  --token <token>                  Provide GitHub token to connect
  --client-id <id>                 GitHub OAuth app client ID for device flow
  --scope <scopes>                 Override requested GitHub scopes
  --message <text>                 Override the drafted message
  --title <text>                   Override the issue title
  --save <path>                    Save outreach output to a file
  --format json                    Print the outreach report as JSON
  --help                           Show help`);
}
