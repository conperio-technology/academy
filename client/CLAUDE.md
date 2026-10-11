# client/ (React 19 + Vite + TypeScript)

`npm ci` once, `npm run dev` (port 5173, `/api` proxied to `localhost:5095`, see
`vite.config.ts`), `npm run build` (`tsc -b && vite build`; this is the type check).
`npm run build:csharp-wasm` (= `../wasm-csharp/build.sh`) puts the in-browser C# runtime in
`public/csharp-wasm/`; without it C# exercises grade on the server. There is
no client-side router: `App.tsx` keeps the selected lesson in state, mirrored in the URL hash
(`#/two-sum`, so links and reloads keep the lesson), and any component can open a lesson with
`openLesson(id)` from `api.ts`.

`npm run build:static` (`scripts/build-static.mjs`) builds the serverless static site into
`dist-static/` (see "Static mode" below); `npm run preview:static` serves it.

## Where things are

| Path | What |
| --- | --- |
| `src/types.ts` | API types. `ToolKind` and `VisualizerKind` unions mirror the C# enums (camelCase). |
| `src/api.ts` | fetch wrappers; same-origin `/api/...`, or `localBackend.ts` in static mode |
| `src/staticMode.ts`, `src/localBackend.ts`, `src/progressStore.ts`, `src/progressCore.ts` | static mode: the flag and `siteUrl()`; the API's stand-in (exported content + local progress, export/import); IndexedDB store; the port of `ProgressService.cs` |
| `src/components/ProgressBackup.tsx` | static mode: the dashboard's export/import progress panel |
| `src/components/ToolView.tsx` | renders a tool lesson: one `{tool.toolKind === "x" && <X />}` line per kind |
| `src/components/tools/` | one widget component per tool lesson |
| `src/components/LessonView.tsx` | graded exercise page: visualizer, `LanguageRunner` (editors + `ReferenceSolution`), `ComplexityCheck` |
| `src/components/CSharpRunner.tsx` / `PythonRunner.tsx` | editors + graders; Python runs in `pythonWorker.ts` (Pyodide from jsdelivr, version in `pyodideLoader.ts`), 5 s per test |
| `src/csharpWasmRunner.ts`, `csharpWasmWorker.ts`, `csharpCompletion.ts`, `csharpDiagnostics.ts` | C# graded in the browser by default (runtime from `public/csharp-wasm/`, built by `../wasm-csharp/build.sh`, gitignored), 5 s per test; falls back to `/api/execute/csharp` when the runtime can't load or "Run on server" is ticked; Roslyn autocomplete and live error squiggles for the C# editor |
| `src/components/ComplexityCheck.tsx` | `OPTIONS`: every complexity string the server's `ComplexityCatalog` may use |
| `src/langTrack/` | data for the Programming in C# & Python lessons, keyed by `ToolKind` in `index.ts`, rendered by `tools/LangLesson.tsx` |
| `src/opsTrack/` | Linux / Windows / cloud lesson data, keyed by `ToolKind` in `index.ts`, rendered by `tools/OpsLesson.tsx` |
| `src/plc/` | PLC Structured Text interpreter, simulator, lessons, exercises, Micro850 labs (content picked by tool id) |
| `src/linuxLessons.ts` | tasks and shell checks for the in-browser Linux VM lessons (`tools/LinuxLab.tsx`) |
| `src/glossaryData.ts`, `src/glossaryMatch.ts` | glossary terms; aliases and deny list for auto-linking terms in prose |
| `src/studyPathData.ts` | Well-rounded IT & CS study path: families of lesson ids |
| `src/prepPlanData.ts` | FAANG interview prep plan: coding families and task ids |
| `src/sectionInfo.ts` | dashboard blurb per section (a new section needs an entry) |
| `src/index.css` | all styles, one file; feature blocks are appended at the end |
| `scripts/` | Node check scripts (run from `client/`, Node 22.18+ strips TS types itself) |

A lesson whose content is a data file (lang, ops, PLC tracks) doesn't need its own
`ToolView` line: the track's map/lookup picks it up.

## Check scripts

```bash
node scripts/check-glossary.mjs        # duplicate terms, see-also targets, lesson ids exist, dashes
node scripts/check-complexity-gym.mjs  # Complexity Gym bank
node scripts/check-plc-st.mjs          # PLC interpreter + exercises
node scripts/verify-solutions.mjs --base http://localhost:5495   # needs a running API serving dist/; C# on the server and in the browser
node scripts/check-overflow.mjs --base http://localhost:5495     # 390px and 1300px, every lesson
```

The last two use Playwright, which is not a dependency. `scripts/playwright.mjs` finds it in
`node_modules`, any `NODE_PATH` entry, or `/opt/node-tools/node_modules`. If jsdelivr is
blocked, put a `pyodide` npm package of the same version on `NODE_PATH` and
`verify-solutions.mjs` serves it in place of the CDN. `../scripts/verify.sh` runs everything.

## Static mode

Built with `vite build --mode static` (`vite.config.ts` then defines `VITE_STATIC=1`; `STATIC_MODE` in
`src/staticMode.ts`), base `./` unless `VITE_BASE` is set, output `dist-static/`. Then
`build-static.mjs` runs `dotnet run --project ../server -- --export-content dist-static/content`
(the API's own responses as files). Checks:

```bash
node scripts/check-static.mjs --base http://localhost:5802/academy/        # served build, end to end
node scripts/check-overflow.mjs --base http://localhost:5802/academy --static
node ../tools/progress-parity/check.mjs                                    # progressCore.ts vs ProgressService.cs
```

Anything the page loads from `public/` must go through `siteUrl()` or
`import.meta.env.BASE_URL`, not a path starting with `/`.

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
