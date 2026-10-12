# client/ (React 19 + Vite + TypeScript)

The whole app: a static site with no server (docs/adr/0013). `npm ci` once, then:

- `npm run dev`: exports the lesson content (`scripts/export-content.mjs`, the `predev` step:
  runs the C# exporter in `../content` into `public/content/`, gitignored), then Vite on port
  5173. After editing lesson C#, `npm run content` and reload.
- `npm run build` (`scripts/build.mjs`): the same export, `tsc -b` (this is the type check),
  `vite build`, `.nojekyll`; output `dist/`, base `./` unless `VITE_BASE` is set, so one build
  works at any path. `npm run preview` or `node scripts/serve.mjs` (serves `dist/` at
  `http://localhost:5802/academy/`) to look at it.
- `npm run build:csharp-wasm` (= `../wasm-csharp/build.sh`) puts the in-browser C# runtime in
  `public/csharp-wasm/`; without it C# exercises say they can't be graded.

There is no client-side router: `App.tsx` keeps the selected lesson in state, mirrored in the
URL hash (`#/two-sum`, so links and reloads keep the lesson on any static host), and any
component can open a lesson with `openLesson(id)` from `api.ts`.

## Where things are

| Path | What |
| --- | --- |
| `src/types.ts` | content and progress types. `ToolKind` and `VisualizerKind` unions mirror the C# enums (camelCase). |
| `src/api.ts` | the data layer components import; re-exports `localBackend.ts`, plus `openLesson` |
| `src/localBackend.ts`, `src/progressStore.ts`, `src/progressCore.ts` | content from the exported JSON + this browser's progress, export/import; the IndexedDB store; the progress rules (attempts, assisted/independent/timed passes, review ladder) |
| `src/siteUrl.ts` | `siteUrl()`: a shipped file's URL under the site's base path |
| `src/components/ProgressBackup.tsx` | the dashboard's export/import progress panel |
| `src/components/ToolView.tsx` | renders a tool lesson: one `{tool.toolKind === "x" && <X />}` line per kind |
| `src/components/tools/` | one widget component per tool lesson |
| `src/components/LessonView.tsx` | graded exercise page: visualizer, `LanguageRunner` (editors + `ReferenceSolution`), `ComplexityCheck` |
| `src/components/CSharpRunner.tsx` / `PythonRunner.tsx` | editors + graders; Python runs in `pythonWorker.ts` (Pyodide from jsdelivr, version in `pyodideLoader.ts`), 5 s per test |
| `src/csharpWasmRunner.ts`, `csharpWasmWorker.ts`, `csharpCompletion.ts`, `csharpDiagnostics.ts` | C# graded in the browser (runtime from `public/csharp-wasm/`, built by `../wasm-csharp/build.sh`, gitignored), 5 s per test; Roslyn autocomplete and live error squiggles for the C# editor |
| `src/monacoLoader.ts` | pins the Monaco version loaded from jsdelivr; keep `monaco-editor` in `package.json` on the same version (`overrides` lifts its bundled `dompurify` for npm audit) |
| `src/components/ComplexityCheck.tsx` | `OPTIONS`: every complexity string `../content/ComplexityCatalog.cs` may use |
| `src/langTrack/` | data for the Programming in C# & Python lessons, keyed by `ToolKind` in `index.ts`, rendered by `tools/LangLesson.tsx` |
| `src/opsTrack/` | Linux / Windows / cloud lesson data, keyed by `ToolKind` in `index.ts`, rendered by `tools/OpsLesson.tsx` |
| `src/plc/` | PLC Structured Text interpreter, simulator, lessons, exercises, Micro850 labs (content picked by tool id) |
| `src/linuxLessons.ts` | tasks and shell checks for the in-browser Linux VM lessons (`tools/LinuxLab.tsx`) |
| `src/glossaryData.ts`, `src/glossaryMatch.ts` | glossary terms; aliases and deny list for auto-linking terms in prose |
| `src/studyPathData.ts` | Well-rounded IT & CS study path: families of lesson ids |
| `src/prepPlanData.ts` | FAANG interview prep plan: coding families and task ids |
| `src/sectionInfo.ts` | dashboard blurb per section (a new section needs an entry) |
| `src/index.css` | all styles, one file; feature blocks are appended at the end |
| `scripts/` | build scripts (`export-content.mjs`, `build.mjs`, `serve.mjs`) and Node check scripts (run from `client/`, Node 22.18+ strips TS types itself) |

A lesson whose content is a data file (lang, ops, PLC tracks) doesn't need its own
`ToolView` line: the track's map/lookup picks it up.

## Check scripts

```bash
node scripts/check-glossary.mjs        # duplicate terms, see-also targets, lesson ids exist, dashes
node scripts/check-complexity-gym.mjs  # Complexity Gym bank
node scripts/check-plc-st.mjs          # PLC interpreter + exercises
# against a served build (npm run build, then node scripts/serve.mjs --port 5802):
node scripts/verify-solutions.mjs --base http://localhost:5802/academy/   # every reference solution, C# and Python, in the browser
node scripts/check-overflow.mjs --base http://localhost:5802/academy/     # 390px and 1300px, every lesson
node scripts/check-site.mjs --base http://localhost:5802/academy/         # end to end: progress, review, export/import, deep links
```

The last three use Playwright, which is not a dependency. `scripts/playwright.mjs` finds it in
`node_modules`, any `NODE_PATH` entry, or `/opt/node-tools/node_modules`. If jsdelivr is
blocked, put a `pyodide` npm package of the same version on `NODE_PATH` and
`verify-solutions.mjs` serves it in place of the CDN. `../scripts/verify.sh` runs everything.

Anything the page loads from `public/` must go through `siteUrl()` or
`import.meta.env.BASE_URL`, not a path starting with `/` (`check-site.mjs` serves the build
under `/academy/` and fails on any request outside it).

## Glossary

Add a term object inside the right `group("<category>", [...])` block in `glossaryData.ts`
(`term`, `definition`, optional `seeAlso` with exact term names, optional `lessonId` of an
existing lesson). If prose usually names it
differently, add a lower-case alias in `ALIASES` in `glossaryMatch.ts` whose value is the exact
`term`; if a short term would match ordinary words, add it to `DENY`. Then run
`node scripts/check-glossary.mjs` and `npm run build`. After a merge, check the `},\n  {`
between entries survived.

## Layout rules

- Must not overflow horizontally at 390px. Wide tables/diagrams/code go in a box with
  `overflow-x: auto`; long tokens get `overflow-wrap: anywhere`; grids use `minmax(0, 1fr)`.
- Below 768px the sidebar is a drawer; `.main-content` loses its 280px margin.
- Use the existing CSS variables (`--bg-panel`, `--border`, `--code-bg`, `--accent`,
  `--text-h`, `--mono`, ...) rather than new colours.
- When resolving an `index.css` conflict keep both blocks and make sure braces balance.
