# First-time setup on Windows (Linux/macOS: scripts/setup.sh). Checks the tools, installs the
# client's packages with `npm ci`, builds the in-browser C# grader (with Git Bash) and the site
# (which exports the lesson content from content/), and runs the fast data checks. Safe to run again at any time. Changes nothing outside the repo.
# Works in Windows PowerShell 5.1 and PowerShell 7. From the repo root:
#
#   powershell -ExecutionPolicy Bypass -File scripts\setup.ps1

# Native tools report failure through $LASTEXITCODE, checked after each step. 'Continue' keeps
# Windows PowerShell 5.1 from turning their stderr warnings into terminating errors.
$ErrorActionPreference = 'Continue'
$Repo = Split-Path -Parent $PSScriptRoot
$Client = Join-Path $Repo 'client'
$script:Problems = 0

function Ok($msg)   { Write-Host "  ok    $msg" }
function Bad($msg)  { Write-Host "  MISSING $msg" -ForegroundColor Red; $script:Problems++ }
function Note($msg) { Write-Host "  note  $msg" }
function Has($cmd)  { [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }

Write-Host '==> checking prerequisites'

if (Has 'git') { Ok ((git --version) -replace 'git version ', 'git ') } else { Bad 'git (https://git-scm.com/download/win)' }

if (Has 'dotnet') {
    $sdks = @(dotnet --list-sdks | ForEach-Object { ($_ -split ' ')[0] })
    $sdk10 = @($sdks | Where-Object { $_ -like '10.*' })
    if ($sdk10.Count -gt 0) { Ok ".NET SDK $($sdk10[-1])" }
    else { Bad ".NET 10 SDK (found: $($sdks -join ', ')). https://dotnet.microsoft.com/download/dotnet/10.0" }
} else {
    Bad '.NET 10 SDK (dotnet not on PATH). https://dotnet.microsoft.com/download/dotnet/10.0'
}

if (Has 'node') {
    $ver = (node -p 'process.versions.node').Trim()
    $parts = $ver.Split('.')
    $major = [int]$parts[0]; $minor = [int]$parts[1]
    # The check scripts import .ts files directly, which needs Node 22.18 or later.
    if ($major -gt 22 -or ($major -eq 22 -and $minor -ge 18)) {
        Ok "node $ver"
        if ($major -lt 24) { Note "the team uses Node 24; $ver works" }
    } else {
        Bad "Node 22.18 or later, 24 recommended (found $ver). https://nodejs.org"
    }
} else {
    Bad 'Node.js 24 (node not on PATH). https://nodejs.org'
}
if (-not (Has 'npm')) { Bad 'npm (comes with Node.js)' }

if ($script:Problems -gt 0) {
    Write-Host ''
    Write-Host 'setup: install the missing tools above, open a new terminal, then run this script again.'
    exit 1
}

function Step($label, [scriptblock]$action) {
    Write-Host ''
    Write-Host "==> $label"
    & $action
    if ($LASTEXITCODE -ne 0) {
        Write-Host ''
        Write-Host "setup: FAILED at: $label" -ForegroundColor Red
        exit 1
    }
}

Step 'npm ci (client packages)' { npm --prefix $Client ci --no-audit --no-fund }
# wasm-csharp/build.sh is a bash script; Git for Windows brings bash. Without it C# exercises
# can't be graded locally (everything else works).
if (Has 'bash') {
    Step 'in-browser C# grader (wasm-csharp/build.sh, about a minute the first time)' { bash (Join-Path $Repo 'wasm-csharp/build.sh') }
} else {
    Note 'bash not found, so the in-browser C# grader was not built. From Git Bash: ./wasm-csharp/build.sh'
}
Step 'site build (content export + type check + Vite)' { npm --prefix $Client run build }

Push-Location $Client
try {
    foreach ($check in 'check-glossary', 'check-complexity-gym', 'check-plc-st') {
        Step $check { node "scripts/$check.mjs" }
    }

    Write-Host ''
    Write-Host '==> optional: Playwright (only needed for the full scripts/verify.sh)'
    node -e "import('./scripts/playwright.mjs').then(m => m.loadPlaywright())" 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Ok 'Playwright found; scripts/verify.sh can run every step (from Git Bash)'
    } else {
        Note 'Playwright not found. To run the full check, install it outside the repo:'
        Note '  npm install --prefix $HOME\pw playwright; npx --prefix $HOME\pw playwright install chromium'
        Note '  then set NODE_PATH to $HOME\pw\node_modules (see CONTRIBUTING.md)'
    }
} finally {
    Pop-Location
}

Write-Host ''
Write-Host 'setup: done. Start the app:'
Write-Host '  cd client; npm run dev         # http://localhost:5173'
Write-Host 'Next: docs/onboarding.md'
