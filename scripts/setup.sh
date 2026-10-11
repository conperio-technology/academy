#!/usr/bin/env bash
# First-time setup on Linux or macOS (Windows: scripts/setup.ps1). Checks the tools, installs
# the client's packages with `npm ci`, builds the server and the client, and runs the fast
# data checks. Safe to run again at any time. Changes nothing outside the repo.
#
#   scripts/setup.sh
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
problems=0

ok()   { echo "  ok    $*"; }
bad()  { echo "  MISSING $*"; problems=$((problems + 1)); }
note() { echo "  note  $*"; }

echo "==> checking prerequisites"

if command -v git >/dev/null 2>&1; then ok "git $(git --version | awk '{print $3}')"; else bad "git (https://git-scm.com)"; fi

if command -v dotnet >/dev/null 2>&1; then
  if dotnet --list-sdks 2>/dev/null | grep -q '^10\.'; then
    ok ".NET SDK $(dotnet --list-sdks | grep '^10\.' | tail -1 | awk '{print $1}')"
  else
    bad ".NET 10 SDK (found: $(dotnet --list-sdks | awk '{print $1}' | tr '\n' ' ')). https://dotnet.microsoft.com/download/dotnet/10.0"
  fi
else
  bad ".NET 10 SDK (dotnet not on PATH). https://dotnet.microsoft.com/download/dotnet/10.0"
fi

if command -v node >/dev/null 2>&1; then
  ver="$(node -p 'process.versions.node')"
  major="${ver%%.*}"; rest="${ver#*.}"; minor="${rest%%.*}"
  # The check scripts import .ts files directly, which needs Node 22.18 or later.
  if ((major > 22 || (major == 22 && minor >= 18))); then
    ok "node $ver"
    ((major < 24)) && note "the team uses Node 24; $ver works"
  else
    bad "Node 22.18 or later, 24 recommended (found $ver). https://nodejs.org"
  fi
else
  bad "Node.js 24 (node not on PATH). https://nodejs.org"
fi
command -v npm >/dev/null 2>&1 || bad "npm (comes with Node.js)"

if ((problems)); then
  echo
  echo "setup: install the missing tools above, then run this script again."
  exit 1
fi

step() {
  local label="$1"; shift
  echo
  echo "==> $label"
  if ! "$@"; then
    echo
    echo "setup: FAILED at: $label"
    exit 1
  fi
}

step "npm ci (client packages)" npm --prefix "$REPO/client" ci --no-audit --no-fund
step "dotnet build (server + runner)" dotnet build "$REPO/server/server.csproj" --nologo -v quiet
step "client build (type check + Vite)" npm --prefix "$REPO/client" run build
step "fast data checks" env VERIFY_STEPS=checks "$REPO/scripts/verify.sh"

echo
echo "==> optional: Playwright (only needed for the full scripts/verify.sh)"
if (cd "$REPO/client" && node -e 'import("./scripts/playwright.mjs").then(m => m.loadPlaywright())' >/dev/null 2>&1); then
  ok "Playwright found; scripts/verify.sh can run every step"
else
  note "Playwright not found. To run the full check, install it outside the repo:"
  note "  npm install --prefix ~/pw playwright && npx --prefix ~/pw playwright install chromium"
  note "  NODE_PATH=~/pw/node_modules scripts/verify.sh"
fi

echo
echo "setup: done. Start the app:"
echo "  cd server && dotnet run          # API on http://localhost:5095"
echo "  cd client && npm run dev         # UI on http://localhost:5173"
echo "Next: docs/onboarding.md"
