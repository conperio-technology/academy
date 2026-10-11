# server/ (ASP.NET Core API, .NET 10)

Minimal API in `Program.cs`; the namespace is still `DsaAcademy.*` from the project's
original name. Build with `dotnet build` (also builds `../runner`, a project reference).

## Endpoints (all in Program.cs)

| Route | Purpose |
| --- | --- |
| `GET /api/me` | current user id (`"guest"` unless the proxy header `UserHeader` is set) |
| `GET /api/lessons` | sidebar: every concept and tool as a `NavItem`, sorted by `SectionOrder` then `Order` |
| `GET /api/lessons/{id}` | one graded exercise (`ConceptDetail`), including complexity and reference solutions |
| `GET /api/tools/{id}` | one tool lesson (`ToolDetail`) |
| `GET /api/review` | spaced-repetition queue |
| `POST /api/execute/csharp` | `{ lessonId, code }` → runs the concept's tests in the runner, records the attempt. The fallback: C# is normally graded in the browser (`wasm-csharp/`) |
| `POST /api/progress/record` | `{ lessonId, language, code, passed }` for Python and C# graded in the browser |
| `POST /api/progress/reveal` | `{ lessonId, language }`: the reference solution was opened (passes in the next 7 days count as assisted) |
| `GET /api/progress/evidence` | per lesson: attempted, last reveal, assisted / independent / timed pass (readiness view) |
| `GET /api/progress`, `DELETE /api/progress[/{conceptId}]` | read, or reset, the current user's progress |

Both execute and record take an optional `mode`: `guided` (default), `bare` or `timed`; see
`ProgressService.RecordAttempt` for how a pass is classified.

The C# executor allows one run per user at a time (429 otherwise) and `MaxConcurrentRuns` (4)
overall (503 after `SlotWaitTimeout`). Settings: `Runner` section / `Runner__*` env vars, see
`RunnerOptions` at the bottom of `Execution/CSharpExecutor.cs`.

`dotnet run --no-launch-profile -- --export-content <dir>` writes the lesson endpoints'
responses (no user progress) as JSON files and exits, for the static site
(`Content/ContentExport.cs`, docs/adr/0010). `GET /api/lessons` and the export share
`ContentExport.NavItems`. Progress rules have a TypeScript twin in
`client/src/progressCore.ts`: change both, then run `node tools/progress-parity/check.mjs`.

## Configuration

- `DbPath`: SQLite file, default `server/progress.db` (gitignored). Point it at a scratch
  path for any throwaway run.
- `UserHeader`: identity header injected by the ingress, default `x-ms-client-principal-name`.
  There is no authentication in this app on purpose (see docs/adr/0006-trusted-header-identity.md).
- Port: the `http` launch profile uses 5095. For any other port use
  `ASPNETCORE_URLS=http://localhost:<port> dotnet run --no-launch-profile`.
- `ASPNETCORE_WEBROOT=<abs path>/client/dist` makes the API serve a built client too.
  `Execution/CSharpWasmFiles.cs` serves the in-browser C# runtime under
  `/csharp-wasm/_framework/` from its `.br` copies, cached as immutable (`dotnet.js` no-cache).
- The schema is created with `EnsureCreated`, not migrations. A new column on `ProgressEntry`
  needs an entry in `Data/SchemaUpgrade.cs` so existing databases get it.

## Content (`Content/`)

- `ITool.cs`: `ITool` + the `ToolKind` enum (serialized camelCase to the client).
- `IConcept.cs`, `ConceptModels.cs`: `IConcept`, `TestCase`, `VisualizerKind`, the DTOs.
- `ToolRegistry.cs` / `ConceptRegistry.cs`: the lists of instances; a lesson not listed here
  doesn't exist. Ids must be unique (the registries build a dictionary and throw on duplicates).
- `SectionOrder.cs`: section display order, 0 "Start Here" to 17 "Industrial & Embedded Systems".
  `IConcept.Section` defaults to "Data Structures & Algorithms"; `Order` defaults to 100.
- `ComplexityCatalog.cs`: time/space answers per concept id, plus `AlsoTime`/`AlsoSpace`
  alternatives. Every string must exist in the client's `ComplexityCheck.tsx` `OPTIONS`.
- `Solutions/<id>.csx` and `<id>.py`: reference solutions, embedded resources loaded by
  `SolutionCatalog.cs` (`.csx` so MSBuild doesn't compile them into the API). Each must pass
  its own concept's tests; `client/scripts/verify-solutions.mjs` checks all of them.
- `Lit.cs`: builds test inputs that are valid C#, Python and JSON at once
  (`Lit.IntArray`, `Lit.Str`, `Lit.Int`, `Lit.Args(...)`). Expected values are JSON strings,
  compared as parsed JSON.
- `Concepts/BasicsHelpers.cs` (and similar helper classes) hold shared `Section`/`Track`
  constants and visualization helpers for a track.

Recipes: `.claude/skills/add-lesson/SKILL.md` (tool) and
`.claude/skills/add-graded-exercise/SKILL.md` (concept).

## Writing content

- `Explanation` paragraphs are separated by `\n\n`; the client links glossary terms in them.
- No en/em dashes or spaced hyphens in lesson text.
- Keep C# starter/solution code inside the runner's allowlist (`../runner/CLAUDE.md`).
- `dotnet build` shows ~13 existing warnings (nullable, NU1608); don't add new ones.
