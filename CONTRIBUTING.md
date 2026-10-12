# Contributing to Conperio Academy

New here? Start with [docs/onboarding.md](docs/onboarding.md). This page is the reference.

Related: [docs/code-review.md](docs/code-review.md) (what reviewers look for),
[docs/ai-usage.md](docs/ai-usage.md) (working with Claude Code),
[docs/adr/](docs/adr/README.md) (decisions already made, and why).

## 1. Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Git | any recent | On Windows, [Git for Windows](https://git-scm.com/download/win). It includes Git Bash, which runs the `.sh` scripts and the pre-commit hook. |
| .NET SDK | 10 | `dotnet --list-sdks` should show a `10.x` line. The lesson content is C# exported to JSON at build time, and the in-browser C# grader is built with it. |
| Node.js | 24 (22.18 or later works) | npm comes with it. The check scripts import `.ts` files directly, which needs 22.18+. |
| Editor | VS Code, Visual Studio or Rider | All three read `.editorconfig`. |
| Claude Code | optional | See [docs/ai-usage.md](docs/ai-usage.md). |

WSL is not needed. Everything below has a Windows (PowerShell) and a Linux/macOS form.

## 2. Setup

```powershell
# Windows, PowerShell, from the repo root
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

```bash
# Linux / macOS
scripts/setup.sh
```

Both check the tools, run `npm ci` in `client/`, build the in-browser C# grader and the
site, and run the fast data checks. Run them again any time (after a big merge, say).

Run the app:

```bash
cd client && npm run dev     # http://localhost:5173
```

`npm run dev` exports the lesson content from `content/` first; after editing a lesson's C#,
run `npm run content` and reload. There is no server: the site is static files, and progress
lives in your browser. Windows PowerShell 5.1 has no `&&`; use `;` there.

Line endings: `.gitattributes` keeps every file LF, on Windows too. Don't change it, and don't
commit CRLF files (the bash scripts break).

## 3. Branches and pull requests

1. Start from the latest master: `git fetch origin` then `git switch -c <short-topic> origin/master`.
2. Keep each PR to one topic (one lesson, one fix). Several people work in parallel, and small
   PRs merge cleanly.
3. Commit with clear messages ("Add Git hook glossary term", not "update").
4. Before pushing, run the checks (section 5) and go through the definition of done (section 7).
5. Push (`git push -u origin <branch>`) and open a PR against `master`. A draft PR is fine
   while you work. The PR template has the checklist; fill it in honestly.
6. A reviewer other than the author approves before merge. The code owner (see
   `.github/CODEOWNERS`) is requested automatically. Don't merge your own PR unreviewed.
7. If master moved on, merge `origin/master` into your branch, re-run the checks, and push.
   The usual conflict spots and how to resolve them are under "Merge gotchas" in
   [CLAUDE.md](CLAUDE.md).

Never push to master directly, never force-push a shared branch, and never deploy (the
GitHub Pages site is published by hand with the owner's go, see README.md). There is no CI: the checks run on your machine, and the
PR checklist records that you ran them.

## 4. Adding content

Read the matching part of [README.md](README.md) and any related [ADR](docs/adr/README.md) first. The full step
lists are the Claude Code skills, which are plain Markdown you can follow by hand too:

| You want to add | Follow |
| --- | --- |
| A lesson with an interactive widget, no grading (`ITool`) | [.claude/skills/add-lesson/SKILL.md](.claude/skills/add-lesson/SKILL.md) |
| A graded coding exercise (`IConcept`) | [.claude/skills/add-graded-exercise/SKILL.md](.claude/skills/add-graded-exercise/SKILL.md) |
| A glossary term | "Glossary" in [client/CLAUDE.md](client/CLAUDE.md) |

The short version of each recipe, placement rules and house style are in
[CLAUDE.md](CLAUDE.md) ("Recipes" and "Conventions"). The ones people miss most:

- No en or em dashes, and no spaced ` - ` dashes, in lesson prose.
- Every code sample and predicted output is run to get the output shown.
- Nothing scrolls sideways at a 390px wide viewport.
- Graded C# may only use what `wasm-csharp/CodePolicy.cs` allows.
- Wire new lessons into `client/src/studyPathData.ts` and `client/src/prepPlanData.ts`
  where they fit; unknown ids are skipped silently, so check the spelling.

## 5. Checks

There is no unit test project; these scripts are the test suite.

| Command (run from) | Checks | Time |
| --- | --- | --- |
| `dotnet build content/content.csproj` (root) | lesson content compiles | under a minute |
| `npm run build` (`client/`) | content export, TypeScript type check and production build | under a minute |
| `npm run lint` (`client/`) | oxlint; warnings are known, errors are not allowed | ~1 s |
| `node scripts/check-glossary.mjs` (`client/`) | glossary terms, links, lesson ids, dashes | ~1 s |
| `node scripts/check-complexity-gym.mjs` (`client/`) | Complexity Gym snippets | ~1 s |
| `node scripts/check-plc-st.mjs` (`client/`) | PLC Structured Text interpreter and exercises | ~1 s |
| `scripts/verify.sh` (root, bash) | all of the above plus every reference solution through the in-browser C# and Python graders, the 390px / 1300px overflow check, and an end-to-end check of progress, review, export/import and deep links | 3 to 5 min |

`scripts/verify.sh` serves the built site on port 5495 under `/academy/` (its own small static
server, stopped at the end), so it doesn't touch a dev server you have running. Its last
three steps need Playwright with Chromium, which is deliberately not a dependency of the app. Install it once, outside the repo:

```bash
npm install --prefix ~/pw playwright && npx --prefix ~/pw playwright install chromium
NODE_PATH=~/pw/node_modules scripts/verify.sh
```

On Windows, install from PowerShell, then run the script with Git Bash's `bash.exe`:

```powershell
npm install --prefix $HOME\pw playwright; npx --prefix $HOME\pw playwright install chromium
$env:NODE_PATH = "$HOME\pw\node_modules"
& "$env:ProgramFiles\Git\bin\bash.exe" scripts/verify.sh
```

`verify.sh` is used daily on Linux but has not been tried on Windows yet. If it fails there
for a reason that isn't your change, run the steps by hand (build, the three `check-*`
scripts, then serve the build and run the three Playwright scripts as shown in
[.claude/skills/verify/SKILL.md](.claude/skills/verify/SKILL.md)) and tell the team what broke.

Useful variations: `VERIFY_STEPS=checks scripts/verify.sh` (fast checks only, seconds) and
`SKIP_BUILD=1 scripts/verify.sh` (reuse the last build).

### Optional pre-commit hook

`scripts/pre-commit` runs the fast checks on the files you are committing: no `.env` files,
`client/dist` or generated `client/public` folders in the commit, no en/em dashes in added content lines, C#
whitespace, oxlint and the type check for staged TypeScript, and the client data checks.
Install it once from the repo root:

```bash
cp scripts/pre-commit "$(git rev-parse --git-path hooks)/pre-commit"            # Git Bash, Linux, macOS
```

```powershell
Copy-Item scripts/pre-commit "$(git rev-parse --git-path hooks)/pre-commit"     # PowerShell
```

Git for Windows runs it with its own bash. Skip it once with `git commit --no-verify`; delete
the copied file to remove it. Re-copy it when `scripts/pre-commit` changes.

## 6. Formatting

- `.editorconfig` sets UTF-8, LF, final newline, no trailing spaces, 4-space indents for C#
  and Python and 2 spaces for everything else. Your editor applies it as you type.
- C#: `dotnet format whitespace` follows `.editorconfig`. The whole tree passes today, so keep
  it that way:

  ```bash
  dotnet format whitespace content/content.csproj --verify-no-changes   # check (also wasm-csharp/CSharpWasm.csproj)
  dotnet format whitespace content/content.csproj                       # fix
  dotnet format whitespace --folder --include <file.cs> [<file.cs>]   # just your files, fast
  ```

  Stick to `whitespace`. `dotnet format style` and `analyzers` are not adopted yet and would
  touch hundreds of files.
- TypeScript: `npm run lint` (oxlint, config in `client/.oxlintrc.json`). There is no
  Prettier on purpose: adding one would reformat every file and conflict with every open
  branch. Match the surrounding code (2 spaces, double quotes, semicolons).
- Don't reformat files you aren't otherwise changing.

## 7. Definition of done

A change is ready to merge when:

- [ ] `scripts/verify.sh` passes, or (if you can't run it) every check in section 5 that
      applies to your change passes and the PR says which ones you ran.
- [ ] Lesson prose has no en/em dashes or spaced ` - ` dashes.
- [ ] Every code sample and predicted output was actually run; what's shown is real output.
- [ ] Anything you added or changed was looked at in the browser at 390px wide (browser dev
      tools, device toolbar) and doesn't scroll sideways (the overflow check covers this too).
- [ ] New lessons are placed in the right section and `Order`, wired into
      `studyPathData.ts` / `prepPlanData.ts` where they fit, and new terms are in the glossary.
- [ ] Docs that describe what you changed (README.md lesson list, a `CLAUDE.md`, a new ADR
      for a big design decision) are updated.
- [ ] No secrets, `.env` files, `client/dist/`, `client/public/content/` or temporary Vite
      configs are committed.
- [ ] A human reviewer other than the author approved it.
