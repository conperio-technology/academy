# 0010. A static hosting mode next to the server

Status: Accepted
Date: 2026-10-11

## Context

The server does three things the browser can't: it keeps progress in SQLite
([0002](0002-sqlite-progress-store.md)), it builds lesson content from C# classes, and it is
the fallback C# grader ([0003](0003-sandboxed-csharp-runner.md)). Everything else (Python in
Pyodide [0004](0004-python-in-pyodide-worker.md), C# in WebAssembly
[0005](0005-in-browser-csharp-prototype.md), now the default per [0012](0012-in-browser-csharp-by-default.md), the Linux VM [0007](0007-linux-vm-in-browser.md))
already runs in the browser. The owner asked for a way to run the app as plain files on
static hosting (GitHub Pages, any web server) with no server process and no database,
while internal hosting with the server keeps working.

Options: replace the server (loses shared, per-user progress for internal hosting), keep two
copies of the content (they drift), or add a build mode that reuses the server's content.

## Decision

Add a static build mode, chosen at build time; the server mode is unchanged.

- `npm run build:static` (`client/scripts/build-static.mjs`) builds the client with
  `vite build --mode static` (which defines `VITE_STATIC=1`) into `client/dist-static/`,
  then runs the server with `--export-content <dist-static>/content`, which writes the exact
  JSON `GET /api/lessons`, `/api/lessons/{id}` and `/api/tools/{id}` return for a user with
  no progress (`server/Content/ContentExport.cs`). The C# classes stay the only source of
  lesson content.
- `client/src/api.ts` keeps one set of functions with two backends: the HTTP API, or
  `localBackend.ts`, which reads the exported files and fills in the per-user fields
  (completed, attempts, evidence, review queue) from progress kept in the browser.
- Progress in static mode lives in IndexedDB (`progressStore.ts`), in memory when IndexedDB
  is unavailable. The rules are a line-by-line TypeScript port of `ProgressService.cs`
  (`progressCore.ts`); `tools/progress-parity/check.mjs` replays the same event sequences
  through both and fails on any difference.
- The dashboard offers export and import of progress as a JSON file, since a browser's
  storage can be cleared. It also accepts the server's `GET /api/progress` output.
- C# is graded only in the browser. Without WebAssembly C# the page says so; there is no
  server fallback and no "Run on server" toggle.
- The open lesson is kept in the URL hash (`#/two-sum`) in both modes, so deep links and
  reloads work on a static host that can only serve `index.html`. No 404.html is needed.
- The static build's Vite `base` is `./` by default, so one build works at any path
  (`/` or `/academy/`); `VITE_BASE=/academy/` pins an absolute base. Every asset the app
  fetches (content JSON, `csharp-wasm/`, `linux/`, the logo) is resolved against it.

## Consequences

- One codebase, two deployments: the server (shared progress per user behind the ingress,
  [0006](0006-trusted-header-identity.md)) and a static site (progress per browser, no
  identity, nothing to operate).
- In static mode progress doesn't follow a learner between browsers or devices except by
  export and import, and clearing site data loses it.
- Two implementations of the progress rules. A change to `ProgressService.cs` needs the same
  change in `progressCore.ts` and a run of `tools/progress-parity/check.mjs`.
- The static site is about 33 MB (23 MB of it the C# runtime with its `.br` copies, 4 MB the
  Linux VM). Pyodide, sql.js and Monaco still come from jsdelivr in both modes.
- Static hosts serve the plain runtime files; the precompressed `.br` copies are only used
  by the server (`CSharpWasmFiles.cs`) and are dead weight on a static host.
- Deploying the static site was left open here. It is now published on GitHub Pages by hand,
  with the owner's go each time: [0011](0011-static-site-on-github-pages.md).
