#!/usr/bin/env bash
# Full local check before a merge: builds the site (lesson content exported from content/,
# the in-browser C# runtime, the client), runs the client's data checks, then serves the
# built site under /academy/ on a spare port (client/scripts/serve.mjs) and runs every
# reference solution through the in-browser graders (C# on .NET WebAssembly, Python in
# Pyodide), the 390px / 1300px horizontal-overflow check and the end-to-end site check
# against it. Stops the server it started (by PID) on exit.
#
#   scripts/verify.sh                 # everything
#   SKIP_BUILD=1 scripts/verify.sh    # reuse the current client/dist
#   SKIP_WASM=1 scripts/verify.sh     # don't (re)build the in-browser C# runtime
#   VERIFY_PORT=5600 scripts/verify.sh
#   VERIFY_STEPS="solutions" scripts/verify.sh   # any of: build checks solutions overflow site
#
# Needs: dotnet 10 SDK, Node 22.18+, client/node_modules (npm ci), and Playwright with
# Chromium reachable via NODE_PATH (client/scripts/playwright.mjs also looks in
# /opt/node-tools/node_modules). If cdn.jsdelivr.net is blocked, put a local pyodide of the
# client's version on NODE_PATH too (see client/scripts/verify-solutions.mjs).
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${VERIFY_PORT:-5495}"
STEPS="${VERIFY_STEPS:-build checks solutions overflow site}"
BASE="http://localhost:$PORT/academy/"
failed=()

has_step() { [[ " $STEPS " == *" $1 "* ]]; }
run() {
  local label="$1"; shift
  echo
  echo "==> $label"
  if "$@"; then echo "--- ok: $label"; else echo "--- FAILED: $label"; failed+=("$label"); fi
}

if has_step build && [[ -z "${SKIP_BUILD:-}" ]]; then
  run "dotnet build (content exporter)" dotnet build "$REPO/content/content.csproj" --nologo -v quiet
  # The in-browser C# runtime first, so the client build copies it into dist/ (skips itself
  # when up to date). SKIP_WASM=1 uses whatever is in client/public/csharp-wasm.
  [[ -z "${SKIP_WASM:-}" ]] && run "in-browser C# runtime (wasm-csharp/build.sh)" "$REPO/wasm-csharp/build.sh"
  run "site build (content export + tsc + vite)" npm --prefix "$REPO/client" run build
fi

if has_step checks; then
  for script in check-glossary check-complexity-gym check-plc-st check-sql-practice; do
    run "$script" node "$REPO/client/scripts/$script.mjs"
  done
  # Parallel branches append to index.css; a bad conflict resolution leaves a brace open,
  # which silently swallows every rule after it.
  run "index.css brace depth" node -e '
    const css = require("fs").readFileSync(process.argv[1], "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/"[^"]*"|'"'"'[^'"'"']*'"'"'/g, "");
    let depth = 0, line = 1;
    for (const ch of css) {
      if (ch === "\n") line++;
      if (ch === "{") depth++;
      if (ch === "}" && --depth < 0) { console.error(`unmatched } near line ${line}`); process.exit(1); }
    }
    if (depth !== 0) { console.error(`${depth} unclosed {`); process.exit(1); }
    console.log("brace depth 0");
  ' "$REPO/client/src/index.css"
fi

if has_step solutions || has_step overflow || has_step site; then
  if curl -s -o /dev/null "http://localhost:$PORT/"; then
    echo "Port $PORT is already in use; set VERIFY_PORT to a free port." >&2
    exit 2
  fi
  if [[ ! -f "$REPO/client/dist/index.html" || ! -f "$REPO/client/dist/content/lessons.json" ]]; then
    echo "Build output missing; run without SKIP_BUILD first." >&2
    exit 2
  fi

  LOG="$(mktemp "${TMPDIR:-/tmp}/academy-verify.XXXXXX")"
  echo
  echo "==> serving client/dist at $BASE (log in $LOG)"
  node "$REPO/client/scripts/serve.mjs" --dir "$REPO/client/dist" --port "$PORT" --base /academy/ >"$LOG" 2>&1 &
  SERVER_PID=$!
  cleanup() {
    kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
    rm -f -- "$LOG"
  }
  trap cleanup EXIT

  for _ in $(seq 1 30); do
    curl -sf "$BASE" >/dev/null && break
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "The static server exited during startup:" >&2
      cat "$LOG" >&2
      exit 2
    fi
    sleep 0.5
  done

  has_step solutions && run "reference solutions (C# in .NET WebAssembly, Python in Pyodide)" \
    node "$REPO/client/scripts/verify-solutions.mjs" --base "$BASE"
  has_step overflow && run "horizontal overflow at 390px and 1300px" \
    node "$REPO/client/scripts/check-overflow.mjs" --base "$BASE" --widths 390,1300
  has_step site && run "end-to-end site check (progress, review, export/import, deep links)" \
    node "$REPO/client/scripts/check-site.mjs" --base "$BASE"
fi

echo
if ((${#failed[@]})); then
  echo "verify: ${#failed[@]} step(s) failed:"
  printf '  - %s\n' "${failed[@]}"
  exit 1
fi
echo "verify: all steps passed"
