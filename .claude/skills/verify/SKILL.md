---
name: verify
description: Run Conperio Academy's full local verification - the content exporter build, the in-browser C# grader and site build, the client check scripts, every reference solution through the in-browser C# and Python graders, a Playwright horizontal-overflow check of every lesson at 390px and 1300px, and an end-to-end site check - against the built site served on a spare port. Use before committing or merging content changes, after resolving merge conflicts, or when asked to verify, check or test the app.
---

# Verify

Everything is in one committed script, so run it rather than re-deriving the steps:

```bash
scripts/verify.sh
```

It:

1. builds `content/` with `dotnet build`, the in-browser C# runtime with
   `wasm-csharp/build.sh` (skipped when up to date, or with `SKIP_WASM=1`), and the site with
   `npm run build` in `client/` (exports the content into `public/content/`, type checks,
   builds `dist/`);
2. runs `client/scripts/check-glossary.mjs`, `check-complexity-gym.mjs`, `check-plc-st.mjs`,
   and checks `client/src/index.css` braces balance (merge damage);
3. serves `client/dist` at `http://localhost:5495/academy/` (`VERIFY_PORT` to change) with
   `client/scripts/serve.mjs`, so a dev server on 5173 is untouched;
4. `client/scripts/verify-solutions.mjs`: every exercise's C# reference solution through the
   built site's `csharpWasmWorker` in headless Chromium (plus a CodePolicy rejection and an
   infinite-loop timeout check), and every Python solution through its `pythonWorker`; also
   fails if a `ComplexityCatalog` answer isn't in the client's `OPTIONS`. Missing solutions or
   complexity entries are listed as warnings;
5. `client/scripts/check-overflow.mjs`: opens the dashboard and every lesson at 390px and
   1300px and fails on any horizontal page scroll, naming the elements that stick out;
6. `client/scripts/check-site.mjs`: end to end in a fresh browser profile (C# graded and
   recorded, progress after a reload, assisted vs independent passes, review queue,
   export/reset/import, deep links, the message without the C# runtime, no request outside
   `/academy/`);
7. stops the static server by PID, then prints a pass/fail summary and exits non-zero if any
   step failed.

Takes about 3 to 5 minutes. Useful variations:

```bash
SKIP_BUILD=1 scripts/verify.sh                         # reuse existing build output
VERIFY_STEPS="checks" scripts/verify.sh                # just the fast data checks
VERIFY_STEPS="solutions overflow" VERIFY_PORT=5600 scripts/verify.sh
```

To check one lesson while iterating, serve the build the same way and call a script directly:

```bash
node client/scripts/serve.mjs --dir client/dist --port 5495 &   # note the PID
node client/scripts/verify-solutions.mjs --base http://localhost:5495/academy/ --only <id>[,<id>]
node client/scripts/check-overflow.mjs --base http://localhost:5495/academy/ --only <id> --widths 390
kill <PID>
```

## Requirements and troubleshooting

- Playwright + Chromium are not repo dependencies. `client/scripts/playwright.mjs` looks in
  `client/node_modules`, each `NODE_PATH` entry, then `/opt/node-tools/node_modules`. Elsewhere:
  `npm install --prefix ~/pw playwright && npx --prefix ~/pw playwright install chromium`, then
  `NODE_PATH=~/pw/node_modules scripts/verify.sh`.
- Python needs Pyodide from cdn.jsdelivr.net. If that host is blocked (403/tunnel errors,
  every Python lesson failing with "Failed to fetch dynamically imported module"), install the
  same version (`PYODIDE_VERSION` in `client/src/pyodideLoader.ts`) outside the repo:
  `npm install --prefix <dir> pyodide@<version>` and add `<dir>/node_modules` to `NODE_PATH`.
  The script then answers the CDN requests from it.
- "Port 5495 is already in use": another run (or someone else's server) is there. Use
  `VERIFY_PORT`. Never `pkill -f` or kill a process you didn't start.
- A failed solution line shows the input, the actual result and the expected JSON; a compile
  or `CodePolicy` error is shown verbatim.
- An overflow failure names the outermost element(s) past the right edge; fix with an
  `overflow-x: auto` wrapper, `overflow-wrap: anywhere`, or `minmax(0, 1fr)` grid columns.

Report the summary counts (C# x/y, Python x/y, page views checked, site checks) when done.
