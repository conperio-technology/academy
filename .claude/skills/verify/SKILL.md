---
name: verify
description: Run Conperio Academy's full local verification - dotnet build, client build, the client check scripts, every reference solution through the C# and Python graders, and a Playwright horizontal-overflow check of every lesson at 390px and 1300px - against a throwaway server on a spare port. Use before committing or merging content changes, after resolving merge conflicts, or when asked to verify, check or test the app.
---

# Verify

Everything is in one committed script, so run it rather than re-deriving the steps:

```bash
scripts/verify.sh
```

It:

1. builds `server/` (+ `runner/`) with `dotnet build`, the in-browser C# runtime with
   `wasm-csharp/build.sh` (skipped when up to date, or with `SKIP_WASM=1`), and `client/`
   with `npm run build`;
2. runs `client/scripts/check-glossary.mjs`, `check-complexity-gym.mjs`, `check-plc-st.mjs`,
   and checks `client/src/index.css` braces balance (merge damage);
3. starts the built API on `http://localhost:5495` (`VERIFY_PORT` to change) serving the
   built client (`ASPNETCORE_WEBROOT=client/dist`) with a database in a fresh temp folder, so
   the user's own `server/progress.db` and any server on 5095 are untouched;
4. `client/scripts/verify-solutions.mjs`: every exercise's C# reference solution through
   `POST /api/execute/csharp` (the real sandboxed runner, four at a time), again through the
   built client's `csharpWasmWorker` in headless Chromium (the default path; plus a CodePolicy
   rejection and an infinite-loop timeout check), and every Python solution through the built
   client's `pythonWorker`; also fails if a
   `ComplexityCatalog` answer isn't in the client's `OPTIONS`. Missing solutions or complexity
   entries are listed as warnings;
5. `client/scripts/check-overflow.mjs`: opens the dashboard and every lesson at 390px and
   1300px and fails on any horizontal page scroll, naming the elements that stick out;
6. stops the server by PID and deletes its temp folder, then prints a pass/fail summary and
   exits non-zero if any step failed.

Takes about 3 to 5 minutes. Useful variations:

```bash
SKIP_BUILD=1 scripts/verify.sh                         # reuse existing build output
VERIFY_STEPS="checks" scripts/verify.sh                # just the fast data checks
VERIFY_STEPS="solutions overflow" VERIFY_PORT=5600 scripts/verify.sh
```

To check one lesson while iterating, start the server the same way and call a script directly:

```bash
cd server && ASPNETCORE_URLS=http://localhost:5495 ASPNETCORE_WEBROOT=$(cd ../client && pwd)/dist \
  DbPath=<scratch dir>/verify.db dotnet bin/Debug/net10.0/server.dll &   # note the PID
node client/scripts/verify-solutions.mjs --base http://localhost:5495 --only <id>[,<id>]
node client/scripts/check-overflow.mjs --base http://localhost:5495 --only <id> --widths 390
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

Report the summary counts (C# server x/y, C# browser x/y, Python x/y, page views checked) when done.
