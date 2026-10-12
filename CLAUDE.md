# Conperio Academy

A learning app, built and served as a static site (computing fundamentals, C# and Python, DSA, system design, Linux,
networking, security, PLCs, interview prep). Lessons come in two kinds:

- **Tool lessons** (`ITool`): explanation + key takeaway + an interactive React widget. No pass/fail.
- **Graded exercises** (`IConcept`): explanation, step-through visualizer, starter code, test
  cases, reference solutions, complexity check. Both languages are graded in the browser: C# with
  Roslyn on .NET WebAssembly, Python with Pyodide.

There is no server (docs/adr/0013). Lesson content is written as C# classes in `content/` and
exported to JSON at build time; progress lives in the learner's browser (IndexedDB).

README.md describes every lesson; docs/adr/ records the design decisions and why. Read the
relevant part before changing a feature.

Team docs: CONTRIBUTING.md (PR flow, checks, definition of done), docs/onboarding.md,
docs/code-review.md, docs/ai-usage.md, and docs/adr/ (decision records; a change that reverses
one needs a new ADR). PRs follow `.github/pull_request_template.md`. There is no CI: don't add
GitHub Actions workflows or change branch protection unless the owner asks.

## Layout

| Path | What |
| --- | --- |
| `content/` | The lesson content as C# classes (.NET 10 console app) and the exporter that writes it as the JSON the site loads. See `content/CLAUDE.md`. |
| `wasm-csharp/` | The in-browser C# grader (Roslyn + Mono WebAssembly) and its safety rules, `CodePolicy.cs`; `build.sh` publishes it into `client/public/csharp-wasm/` (gitignored). See its README. |
| `client/` | React 19 + Vite + TypeScript site. Content from `public/content/` (exported, gitignored), progress in IndexedDB, Python graded in a Pyodide Web Worker. See `client/CLAUDE.md`. |
| `client/dist/` | the built site (`npm run build`, gitignored): plain files for any static host. |
| `tools/linux-image/` | Builds the kernel/initrd for the in-browser Linux VM (v86). See its CLAUDE.md. |
| `THIRD_PARTY_NOTICES.md` | licences and source links for bundled third-party parts (GPL kernel and BusyBox included); every build serves it as `THIRD_PARTY_NOTICES.txt`. Update it when a bundled version changes. |
| `LICENSE` | MIT licence for the project; bundled third-party parts are in `THIRD_PARTY_NOTICES.md`. |
| `scripts/` | `setup.sh` / `setup.ps1` (first-time setup), `verify.sh` (full local verification, see below), `pre-commit` (optional hook). |

## Running it

```bash
./wasm-csharp/build.sh           # once, ~1 min: in-browser C# grading (else C# exercises can't be graded)
cd client && npm ci && npm run dev   # http://localhost:5173
```

`npm run dev` runs `scripts/export-content.mjs` first (`predev`): `dotnet run --project
../content` writes the lessons into `client/public/content/`, which Vite serves as static
files. After changing lesson C# while the dev server runs, `npm run content` and reload.

To run a second copy (another branch, a worktree, or while the user's own copy is on 5173),
pick another port: `npm run content && npx vite --port 5180 --strictPort`, or build and serve
the result: `npm run build && node scripts/serve.mjs --port 5802` (serves `dist/` at
`http://localhost:5802/academy/`). Stop what you started by PID.

## Build and check

| Command (from) | What it checks |
| --- | --- |
| `dotnet build content/content.csproj` (root) | the lesson classes and the exporter compile |
| `wasm-csharp/build.sh` (root) | publishes the in-browser C# runtime into `client/public/csharp-wasm/` (skips when up to date); run before `npm run build` so `dist/` has it |
| `npm run build` (`client/`) | exports the content, `tsc -b` type check, Vite production build into `dist/` |
| `node scripts/check-glossary.mjs` (`client/`) | glossary: duplicate terms, see-also targets, lesson ids exist, no dashes |
| `node scripts/check-complexity-gym.mjs` (`client/`) | Complexity Gym snippet bank |
| `node scripts/check-plc-st.mjs` (`client/`) | PLC Structured Text interpreter, exercises, simulator programs |
| `node scripts/verify-solutions.mjs --base <url>` (`client/`) | every reference solution passes its own tests in the browser graders (C# on WebAssembly, Python via Pyodide), CodePolicy rejects a banned call, a runaway loop is stopped; complexity answers selectable |
| `node scripts/check-overflow.mjs --base <url>` (`client/`) | no lesson scrolls sideways at 390px or 1300px |
| `node scripts/check-site.mjs --base <url>` (`client/`) | a served build end to end: requests stay under the base path, C# graded and recorded, progress, review, export/import, deep links |
| `scripts/verify.sh` (root) | every row above: builds, then serves `client/dist` under `/academy/` on a spare port (`client/scripts/serve.mjs`) and runs the last three against it |

C# whitespace follows `.editorconfig` and the tree passes
`dotnet format whitespace content/content.csproj --verify-no-changes` (and
`wasm-csharp/CSharpWasm.csproj`); keep it passing, and don't run `dotnet format
style`/`analyzers` across the tree. `scripts/pre-commit` is an optional local hook that runs
the fast checks on staged files. `npm run lint` (oxlint) currently reports warnings only.
There is no unit test project; the check scripts above are the test suite. Playwright (used
by the last three) is not a dependency: the scripts find it via `NODE_PATH` or
`/opt/node-tools/node_modules`, see `client/scripts/playwright.mjs`. The `/verify` skill
wraps `scripts/verify.sh`.

## The site

The client's data layer is `client/src/api.ts`, which re-exports `localBackend.ts`: content
from the exported JSON, progress in IndexedDB via `progressStore.ts`, rules in
`progressCore.ts`, and export/import of progress on the dashboard. A new per-learner field
on a lesson is written empty by `content/ContentExport.cs` and filled in by
`localBackend.ts`. Fetch shipped files through `siteUrl()` (`client/src/siteUrl.ts`) or
`import.meta.env.BASE_URL`, never a leading `/`, so the site works under a subpath.

The site is live on GitHub Pages (https://conperio-technology.github.io/academy/),
published by hand from the `gh-pages` branch (docs/adr/0011). Only publish or update it when
the owner asks for it; never push to `gh-pages` on your own. The steps are
in README.md, "Publishing to GitHub Pages".

## Recipes

Step-by-step versions live in the skills: `.claude/skills/add-lesson/SKILL.md` and
`.claude/skills/add-graded-exercise/SKILL.md`. In short:

**Tool lesson:** `content/Tools/<Name>Tool.cs` (implements `ITool`) + a `ToolKind`
value in `content/ITool.cs` + `new <Name>Tool()` in `content/ToolRegistry.cs` +
the camelCase kind in the `ToolKind` union in `client/src/types.ts` + a render line
`{tool.toolKind === "<kind>" && <Widget />}` in `client/src/components/ToolView.tsx`
(component in `client/src/components/tools/`).

**Graded exercise:** `content/Concepts/<Name>.cs` (implements `IConcept`) +
`new <Name>()` in `content/ConceptRegistry.cs` + an entry in
`content/ComplexityCatalog.cs` whose strings all appear in `OPTIONS` in
`client/src/components/ComplexityCheck.tsx` + reference solutions
`content/Solutions/<id>.csx` and `<id>.py` that pass the concept's own tests.

**Placement:** the sidebar sorts sections by `content/SectionOrder.cs` (18 sections,
0 "Start Here" to 17 "Industrial & Embedded Systems"; an unlisted section sorts last), then by
each item's `Order` (default 100), ties keeping registry order. Tracks group in order of
their first item, so each track uses its own band of numbers (e.g. Programming: basics 0-99,
intermediate 1000s, advanced 2000s, cheat sheets 5000s; a lesson at 1000 is followed by its
exercises at 1001, 1002, then the next lesson at 1100).
Look at the neighbouring files in the same section and continue their numbering.

**Wire new lessons into plans:** `client/src/studyPathData.ts` (Well-rounded IT & CS path,
families of lesson ids) and `client/src/prepPlanData.ts` (FAANG interview plan). Unknown ids
are skipped silently, so check spelling against the `Id` property.

**Glossary:** terms in `client/src/glossaryData.ts`; prose aliases and the deny list in
`client/src/glossaryMatch.ts` (an alias must name an existing term exactly, or it is ignored).
Run `node scripts/check-glossary.mjs`.

## Conventions

- Lesson ids are lowercase-hyphenated and unique across tools and concepts; the `Id` is what
  the client, plans, glossary and progress rows refer to.
- Lesson prose (C# string content, client data files) uses no en or em dashes and no spaced
  ` - ` / ` -- ` dashes; the check scripts enforce this for the data they cover.
- Every code sample and predict-the-output answer is actually run to get the output shown.
- Lessons must not scroll horizontally at a 390px viewport: wrap wide tables, diagrams and code
  in an `overflow-x: auto` box and use `overflow-wrap: anywhere` for long tokens.
- Graded C# may only use what `wasm-csharp/CodePolicy.cs` allows (no Tasks, threads,
  reflection, files, Console). Teach those topics in tool lessons instead.
- Keep changes scoped; this repo is often worked on by several branches in parallel.

## Merge gotchas (parallel branches)

- `client/src/index.css`: branches append blocks at the end, so merges conflict there. Keep
  both sides, then confirm brace depth returns to 0 (`scripts/verify.sh` checks this).
- `client/src/glossaryData.ts`: resolving a conflict between two appended terms can drop the
  `},\n  {` between entries, merging two objects into one. Run `npm run build` and
  `node scripts/check-glossary.mjs` after every merge that touched it.
- `ITool.cs`, `ToolRegistry.cs`, `ConceptRegistry.cs`, `ComplexityCatalog.cs`, `types.ts`,
  `ToolView.tsx`: append-style lists; keep both sides' entries.

## Don't

- Don't deploy: no publishing to GitHub Pages or any other host without the owner's go. Work
  on a branch; `master` changes arrive by PR.
- Don't add a server, API or database back without a new ADR (docs/adr/0013).
- Don't use `pkill -f` / `killall`: other dev servers may be running. Stop processes you started by PID.
- Never commit secrets, `.env` files, `client/dist/`, `client/public/content/`,
  `client/public/csharp-wasm/`, or temporary Vite configs.
- Don't add Playwright or Pyodide to `client/package.json`; the scripts find them outside the repo.
