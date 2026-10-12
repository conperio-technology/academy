# 0013. Static only: remove the server mode

Status: Accepted (supersedes [0002](0002-sqlite-progress-store.md), [0003](0003-sandboxed-csharp-runner.md) and [0006](0006-trusted-header-identity.md); replaces the "next to the server" part of [0010](0010-static-hosting-mode.md) and the server fallback in [0012](0012-in-browser-csharp-by-default.md))
Date: 2026-10-12

## Context

Since [0010](0010-static-hosting-mode.md) the app has had two deployments from one codebase:
an ASP.NET Core server (progress in SQLite per user behind a trusted identity header, a
sandboxed C# runner process as the fallback grader, a Dockerfile) and a static site (content
exported as JSON, progress in the browser, C# graded only in the browser). Only the static
site was ever published ([0011](0011-static-site-on-github-pages.md)); the server was never
deployed ([0009](0009-no-deploy-no-ci-yet.md)). Keeping both meant two backends behind
`client/src/api.ts`, two implementations of the progress rules kept equal by a parity tool,
a runner nobody used by default, and docs that described a header-based login, a container
and a "Run on server" switch that the live site never had.

The owner decided to remove the server version and keep only the static site.

## Decision

- No server, API, database or identity. The app is the static site; `npm run build` in
  `client/` produces it in `client/dist/` and any static host serves it.
- Lesson content stays in C# (the classes, registries, reference solutions and complexity
  catalog). `server/` becomes `content/`, a small console app with no NuGet dependencies that
  exports the same JSON as before (`dotnet run --project content -- <dir>`).
  `client/scripts/export-content.mjs` runs it into `client/public/content/` before
  `npm run dev` and `npm run build`. The export was byte-identical to the old
  `--export-content` output when the server was removed.
- Progress lives only in the browser (IndexedDB, `progressStore.ts`) with the rules in
  `progressCore.ts`. Export and import on the dashboard are the way to keep or move it. Import
  still accepts the old server's progress JSON.
- C# is graded only in the browser ([0012](0012-in-browser-csharp-by-default.md)).
  `CodePolicy.cs` and the result types move unchanged from `runner/` into `wasm-csharp/`.
  Without the WebAssembly runtime the page says C# can't be graded; there is no fallback.
- Removed: the API endpoints, CORS and the `/api` dev proxy, the identity header and "guest"
  user, EF Core and SQLite, the runner process and its limits, `Dockerfile`, the
  progress-parity tool, the "Run on server" option, and the `.br` copies of the C# runtime
  (only the server sent them).
- The checks run against a served build: `scripts/verify.sh` builds the site, serves it under
  `/academy/` with `client/scripts/serve.mjs`, and runs every reference solution through the
  in-browser graders, the overflow check and the end-to-end site check.

## Consequences

- One deployment, one backend, one copy of the progress rules. Nothing to operate.
- Progress doesn't follow a learner between browsers or devices except by export and import,
  and clearing site data loses it. There is no shared or per-team progress view, and adding
  one needs a new decision (and a new ADR).
- Every learner's C# runs in their own tab. CodePolicy is a learning guardrail there, not a
  security boundary, and the security surface is the site and what it loads.
- Contributors still need the .NET 10 SDK: the content is exported from C# and the C# grader
  is built with it.
- The progress rules lost their parity check; `client/scripts/check-site.mjs` covers the
  main paths (assisted and independent passes, the review queue, export and import).
- Teaching content that used this app's own server as an example (Program.cs, the executor,
  the ingress login, the Dockerfile) was reworded to describe a typical ASP.NET Core app.
