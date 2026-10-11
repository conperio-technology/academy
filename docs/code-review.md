# Code review

Every PR gets a human review from someone other than the author before it merges, whether a
person or Claude Code wrote it. There is no CI, so the reviewer is also the last check that
the author really ran the checks.

## Before you start

- Read the PR description and its checklist. A ticked box is a claim; spot check it.
- Check out the branch and run what the change touches: at least `VERIFY_STEPS=checks
  scripts/verify.sh`, and the full `scripts/verify.sh` for new lessons, solutions or layout.
- Open the changed lessons in the app, at desktop width and at 390px (browser dev tools,
  device toolbar).

## Content (lessons, exercises, glossary)

Accuracy matters most: learners trust what the app tells them.

- **Facts.** Every claim, number, command and complexity is correct. If you can't confirm
  something, ask in the review rather than approve it.
- **Outputs are real.** Each code sample and predicted output must be what the code actually
  prints. Run a few yourself (`python3`, a scratch `dotnet` project outside the repo, a
  shell). An output that looks made up probably is.
- **Exercises.** The tests cover edge cases (empty input, one element, duplicates, negatives,
  large values). The starter code fails them; the reference solutions pass them. The
  complexity answer matches the reference solution. Graded C# stays inside
  `runner/CodePolicy.cs`.
- **Wiring.** Lesson ids are unique and lowercase-hyphenated. The section and `Order` fit the
  neighbouring lessons. The lesson is in `studyPathData.ts` / `prepPlanData.ts` where it
  belongs, with the id spelled exactly. Glossary `seeAlso` and `lessonId` values exist.
- **Style.** Plain, direct sentences. No en/em dashes or spaced ` - ` dashes. Nothing scrolls
  sideways at 390px.
- **Scope.** The README.md lesson list mentions the new lesson.

The `content-reviewer` Claude Code agent (`.claude/agents/content-reviewer.md`) checks the same
list and is a good first pass. It does not replace your review.

## Code (server, runner, client, scripts)

- **Correctness.** Does it do what the PR says? Edge cases, error paths, null handling.
- **Security.** Anything touching `runner/CodePolicy.cs`, the runner limits in
  `server/Execution/`, the identity header (`UserHeader`), CORS, or the `Dockerfile` is a security
  change and must say so in the PR. Learner code must never get files, network, processes or
  reflection.
- **Scope.** The diff only contains what the PR is about. No drive-by reformatting, no
  unrelated renames. Append-style lists (`ToolRegistry.cs`, `types.ts`, `ToolView.tsx`,
  `index.css`, ...) keep everyone else's entries.
- **Consistency.** Follows the patterns already in the folder and the per-folder `CLAUDE.md`.
  New CSS uses the existing variables and is one prefixed block appended at the end.
- **Dependencies.** New npm or NuGet packages need a reason in the PR. Playwright and Pyodide
  are never added to `client/package.json`.
- **Docs.** README.md, a `CLAUDE.md` or an ADR updated when the change alters how
  something works or why.
- **Hygiene.** No secrets, `.env`, `progress.db*`, `client/dist/`, temporary Vite configs,
  or debugging leftovers.

## Leaving the review

- Say what you checked ("ran verify.sh, all passed; read every output in the C# samples").
- Mark each comment as blocking or a suggestion.
- Approve only when the blocking items are fixed. Request changes rather than approve with
  "fix later".
