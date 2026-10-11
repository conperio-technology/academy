#!/usr/bin/env bash
# Full local check before a merge: builds both sides, runs the client's data checks, then
# starts a throwaway copy of the API (its own port, its own temp database, serving the
# freshly built client) and runs every reference solution through the graders (C# on the
# server and in the browser, Python in the browser) and the 390px / 1300px
# horizontal-overflow check against it. Stops the server it started (by PID)
# and removes its temp folder on exit.
#
#   scripts/verify.sh                 # everything
#   SKIP_BUILD=1 scripts/verify.sh    # reuse the current server/bin and client/dist
#   SKIP_WASM=1 scripts/verify.sh     # don't (re)build the in-browser C# runtime
#   VERIFY_PORT=5600 scripts/verify.sh
#   VERIFY_STEPS="solutions" scripts/verify.sh   # any of: build checks solutions overflow
#
# Needs: dotnet 10 SDK, Node 22.18+, client/node_modules (npm ci), and Playwright with
# Chromium reachable via NODE_PATH (client/scripts/playwright.mjs also looks in
# /opt/node-tools/node_modules). If cdn.jsdelivr.net is blocked, put a local pyodide of the
# client's version on NODE_PATH too (see client/scripts/verify-solutions.mjs).
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${VERIFY_PORT:-5495}"
STEPS="${VERIFY_STEPS:-build checks solutions overflow}"
BASE="http://localhost:$PORT"
failed=()

has_step() { [[ " $STEPS " == *" $1 "* ]]; }
run() {
  local label="$1"; shift
  echo
  echo "==> $label"
  if "$@"; then echo "--- ok: $label"; else echo "--- FAILED: $label"; failed+=("$label"); fi
}

if has_step build && [[ -z "${SKIP_BUILD:-}" ]]; then
  run "dotnet build (server + runner)" dotnet build "$REPO/server/server.csproj" --nologo -v quiet
  # The in-browser C# runtime first, so the client build copies it into dist/ (skips
  # itself when up to date). SKIP_WASM=1 skips it: whatever is in client/public/csharp-wasm
  # is used, and with nothing there the client grades C# on the server.
  [[ -z "${SKIP_WASM:-}" ]] && run "in-browser C# runtime (wasm-csharp/build.sh)" "$REPO/wasm-csharp/build.sh"
  run "client build (tsc + vite)" npm --prefix "$REPO/client" run build
fi

if has_step checks; then
  for script in check-glossary check-complexity-gym check-plc-st; do
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

if has_step solutions || has_step overflow; then
  if curl -s -o /dev/null "$BASE/"; then
    echo "Port $PORT is already in use; set VERIFY_PORT to a free port." >&2
    exit 2
  fi
  if [[ ! -f "$REPO/client/dist/index.html" || ! -f "$REPO/server/bin/Debug/net10.0/server.dll" ]]; then
    echo "Build output missing; run without SKIP_BUILD first." >&2
    exit 2
  fi

  TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/academy-verify.XXXXXX")"
  echo
  echo "==> starting API on $BASE (db and log in $TMP_DIR)"
  # The built dll directly (not `dotnet run`), so $! is the server itself and killing it
  # leaves nothing behind. --no-launch-profile semantics: only these env vars apply.
  (
    cd "$REPO/server" &&
      ASPNETCORE_URLS="$BASE" \
      ASPNETCORE_WEBROOT="$REPO/client/dist" \
      DbPath="$TMP_DIR/verify.db" \
      exec dotnet bin/Debug/net10.0/server.dll
  ) >"$TMP_DIR/server.log" 2>&1 &
  SERVER_PID=$!
  cleanup() {
    kill "$SERVER_PID" 2>/dev/null
    wait "$SERVER_PID" 2>/dev/null
    rm -rf -- "$TMP_DIR"
  }
  trap cleanup EXIT

  for _ in $(seq 1 60); do
    curl -sf "$BASE/api/me" >/dev/null && break
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "API exited during startup:" >&2
      cat "$TMP_DIR/server.log" >&2
      exit 2
    fi
    sleep 1
  done

  has_step solutions && run "reference solutions (C# via API and in the browser, Python via Pyodide)" \
    node "$REPO/client/scripts/verify-solutions.mjs" --base "$BASE"
  has_step overflow && run "horizontal overflow at 390px and 1300px" \
    node "$REPO/client/scripts/check-overflow.mjs" --base "$BASE" --widths 390,1300
fi

echo
if ((${#failed[@]})); then
  echo "verify: ${#failed[@]} step(s) failed:"
  printf '  - %s\n' "${failed[@]}"
  exit 1
fi
echo "verify: all steps passed"
