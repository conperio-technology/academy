# content/ (lesson content and its exporter, .NET 10)

Every lesson is a C# class here, and this small console app writes them all out as the JSON
files the site loads. The namespace is still `DsaAcademy.*` from the project's original
name. No NuGet packages; build with `dotnet build content/content.csproj`.

```bash
dotnet run --project content -- <dir>    # from the repo root
```

writes `<dir>/lessons.json` (the sidebar listing, sorted by `SectionOrder` then `Order`),
`<dir>/lessons/<id>.json` (one `ConceptDetail` per graded exercise, including complexity and
reference solutions) and `<dir>/tools/<id>.json` (one `ToolDetail` per tool lesson)
(`ContentExport.cs`). You rarely run it by hand: `client/scripts/export-content.mjs` runs it
into `client/public/content/` before `npm run dev` and `npm run build`, and `npm run content`
(from `client/`) runs it on its own.

The per-learner fields (`completed`, `attempts`, `evidence`) are written empty; the client
fills them in from the progress kept in the browser (`client/src/localBackend.ts`,
`progressCore.ts`). JSON is web-style camelCase with enums as camelCase strings, matching
`client/src/types.ts`.

## Content

- `ITool.cs`: `ITool` + the `ToolKind` enum (serialized camelCase to the client).
- `IConcept.cs`, `ConceptModels.cs`: `IConcept`, `TestCase`, `VisualizerKind`, the DTOs.
- `ToolRegistry.cs` / `ConceptRegistry.cs`: the lists of instances; a lesson not listed here
  doesn't exist. Ids must be unique (the registries build a dictionary and throw on duplicates).
- `SectionOrder.cs`: section display order, 0 "Start Here" to 18 "Industrial & Embedded Systems".
  `IConcept.Section` defaults to "Data Structures & Algorithms"; `Order` defaults to 100.
- `ComplexityCatalog.cs`: time/space answers per concept id, plus `AlsoTime`/`AlsoSpace`
  alternatives. Every string must exist in the client's `ComplexityCheck.tsx` `OPTIONS`.
- `Solutions/<id>.csx` and `<id>.py`: reference solutions, embedded resources loaded by
  `SolutionCatalog.cs` (`.csx` so MSBuild doesn't compile them into the exporter). Each must pass
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
- Keep C# starter/solution code inside the grader's allowlist (`../wasm-csharp/CodePolicy.cs`,
  summarised in `../wasm-csharp/README.md`).
- A clean `dotnet build` shows 7 existing CS8601 nullable warnings (the Graph* concepts);
  don't add new ones.
