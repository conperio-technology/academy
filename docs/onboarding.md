# Onboarding

Welcome. By the end of day one you should have the app running, know where things live,
and have a first small PR open.

## Day one

1. **Install the tools** (see [CONTRIBUTING.md](../CONTRIBUTING.md) section 1): Git for
   Windows, the .NET 10 SDK and Node.js 24. Open a new terminal afterwards so `PATH` is fresh.
2. **Clone the repo** and get GitHub access from the owner if `git clone` is refused:

   ```bash
   git clone https://github.com/conperio-technology/academy.git
   cd academy
   ```

3. **Run setup.**

   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\setup.ps1     # Windows
   ```

   ```bash
   scripts/setup.sh                                              # Linux / macOS
   ```

   It checks the tools, installs packages, builds the in-browser C# grader and the site, and
   runs the fast checks. It
   ends with "setup: done". If it stops, it says which step failed.
4. **Run the app**: `cd client`, `npm run dev`. Open http://localhost:5173. (There is no
   server: the lessons are exported from C# to JSON files first, and your progress is kept in
   the browser.) Solve one exercise in C# and one in Python, and
   open one tool lesson, so you've seen both kinds.
5. **Read, in this order** (about an hour):
   - [README.md](../README.md): "Running it", "Working on this repo with Claude", skim "What's
     here", then "Architecture".
   - [CLAUDE.md](../CLAUDE.md): layout, recipes, conventions, merge gotchas.
   - [docs/adr/](adr/README.md): the big decisions and why they were made.
   - [CONTRIBUTING.md](../CONTRIBUTING.md), [code-review.md](code-review.md),
     [ai-usage.md](ai-usage.md).
6. **Optional:** install the pre-commit hook (CONTRIBUTING.md, "Optional pre-commit hook")
   and Playwright for the full `scripts/verify.sh`.
7. **Do the first PR exercise** below.

## First PR exercise: add a glossary term

Small, real, and it runs you through the whole loop: branch, edit, checks, PR, review.

1. Pick a computing term that isn't in the glossary yet. Search first with your editor, or
   `Select-String 'term: "Git hook"' client/src/glossaryData.ts` (PowerShell) /
   `grep -n 'term: "Git hook"' client/src/glossaryData.ts` (Git Bash, Linux, macOS).
   "Git hook" is free at the time of writing; if someone took it, pick another.
2. Branch: `git fetch origin`, then `git switch -c glossary-<your-term> origin/master`.
3. In `client/src/glossaryData.ts`, add an entry inside the right `group("<category>", [...])`
   block, next to related terms:

   ```ts
   {
     term: "Git hook",
     definition: "A script Git runs at a set point, such as before a commit is recorded. A pre-commit hook can run fast checks and stop the commit if they fail.",
     seeAlso: ["Linter"],
     lessonId: "git-basics",
   },
   ```

   `seeAlso` must name existing terms exactly and `lessonId` must be a real lesson id (search
   for `Id => "` under `content/`). No en or em dashes in the text.
4. Check it, from `client/`:

   ```bash
   node scripts/check-glossary.mjs
   npm run build
   ```

   Then open the app, open "Glossary of Industry Terms" (Glossary section), and find your term at full
   width and at 390px.
5. Commit (`git commit -am "Add Git hook glossary term"`), push
   (`git push -u origin glossary-<your-term>`), open a PR against `master`, and fill in the
   template. Ask the owner or a teammate to review.

Alternative: fix a typo or an unclear sentence you noticed while reading a lesson. Same loop;
run the check that covers the file you changed, and look at the page afterwards.

## After day one

- Pick a lesson or exercise to add from the owner's list, and follow
  the matching skill (CONTRIBUTING.md section 4).
- Review a teammate's PR using [code-review.md](code-review.md). Reviewing is the fastest way
  to learn the codebase.

## Getting help

Ask the owner (GitHub: @gerardl) or the team. When something in these docs was wrong or
missing, fix it in a PR.
