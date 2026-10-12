# Using AI on this project

This repo is set up for [Claude Code](https://claude.com/claude-code). Using it is optional.
These rules apply to any AI tool you use here.

## What Claude Code is told about this repo

Claude Code reads these files automatically, so it follows the same rules you do:

| File | What it gives Claude |
| --- | --- |
| `CLAUDE.md` (root) | Layout, how to run and check the app, recipes, conventions, merge gotchas, what not to do |
| `content/`, `client/`, `tools/linux-image/` `CLAUDE.md` | Details for that folder |
| `.claude/skills/add-lesson/`, `add-graded-exercise/`, `verify/` | Step lists, run as `/add-lesson`, `/add-graded-exercise`, `/verify` |
| `.claude/agents/content-reviewer.md` | A reviewer agent that checks new lesson content for accuracy, wiring and style, and reports without editing |
| `.claude/settings.json` | Shared permissions (below) |

If Claude keeps getting something wrong, fix the instructions (a `CLAUDE.md` or a skill) in a
PR, so the whole team benefits.

### Permissions (`.claude/settings.json`)

- **Allowed without asking:** reading and searching files, the three skills, `dotnet build`
  and `dotnet run`, `npm run build/dev/lint`, the client check scripts, `scripts/verify.sh`,
  read-only git (`status`, `diff`, `log`, `show`, `blame`, ...) and `ls`/`wc`/`head`/`tail`.
- **Always blocked:** `rm -rf`, `git push --force`/`-f`, `git reset --hard`, `git clean`,
  `pkill`, `killall`, `docker push`, `kubectl`.
- Everything else (editing files, commits, pushes, installs) asks you first. Read the prompt
  before you approve it.
- Personal additions go in `.claude/settings.local.json` (gitignored). Changes to the shared
  file go through a PR like any other change; don't widen it to allow destructive commands.

## Rules

1. **A human reviews every PR.** Someone other than the author approves before merge, whether
   the code came from a person or an AI. See [code-review.md](code-review.md).
2. **You own what you commit.** "Claude wrote it" is not a reason it's wrong or right. Read
   every line of the diff before you commit or open a PR.
3. **Verify AI-written content.** Models produce confident, plausible mistakes. For lessons:
   - run every code sample and paste the real output; never keep a predicted output an AI
     wrote without running it;
   - check facts, numbers and complexities against a trusted source;
   - make sure the tests really test the problem (edge cases, starter code fails);
   - run `scripts/verify.sh` (or `/verify`), and ask the `content-reviewer` agent for a first
     pass. Neither replaces your own reading.
4. **Never paste secrets.** No passwords, API keys, tokens, connection strings, customer data
   or production config into a prompt, a `CLAUDE.md`, a skill or a commit. If one leaks,
   tell the owner and rotate it; deleting the message is not enough.
5. **Stay inside the repo's rules.** No deploys, no pushes to master, no force pushes, no
   killing processes you didn't start. Claude is told this too; you are still responsible.
6. **Say so in the PR.** The PR template has an "AI assistance" section: note whether AI
   wrote part of the change and how you checked it.

## Attribution in commits

Claude Code ends the commits it writes with a trailer like:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

Keep it. If you used another AI tool for a substantial part of a commit, add a similar
`Co-Authored-By:` line or say so in the commit message. Your own name stays the commit
author either way.

## Getting started with Claude Code

1. Install it and sign in (see the Claude Code docs).
2. Open a terminal in the repo root and run `claude`.
3. Try: "Read CLAUDE.md and explain how a tool lesson is wired", then `/verify`.
4. For a new lesson, describe it and let Claude use `/add-lesson`, then review the diff and
   run the checks yourself.
