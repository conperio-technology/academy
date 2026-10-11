#!/usr/bin/env bash
# Publishes the in-browser C# compiler/runner (Roslyn on .NET WebAssembly) into
# client/public/csharp-wasm/, where the C# exercises load it from. Vite serves that folder
# in dev and copies it into dist/ on `npm run build`, so run this first:
#
#   ./wasm-csharp/build.sh          # or: npm run build:csharp-wasm (from client/)
#   FORCE=1 ./wasm-csharp/build.sh  # rebuild even if the output looks up to date
#
# The output is gitignored (~18 MB plus ~5 MB of .br files). Without it the app still works:
# C# exercises notice the runtime is missing and grade on the server instead.
# Needs only the .NET 10 SDK (no wasm-tools workload).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../client/public/csharp-wasm"
tmp="$here/obj/publish-out"
stamp="$out/_framework/dotnet.js"

# Skip the ~1 minute publish when nothing it compiles changed since the last one.
inputs=("$here/Program.cs" "$here/CSharpWasm.csproj" "$here/../runner/CodePolicy.cs" "$here/../runner/RunnerProtocol.cs" "$0")
if [[ -z "${FORCE:-}" && -f "$stamp" ]]; then
  stale=0
  for f in "${inputs[@]}"; do [[ "$f" -nt "$stamp" ]] && stale=1; done
  if ((stale == 0)); then
    echo "csharp-wasm is up to date ($out); FORCE=1 to rebuild"
    exit 0
  fi
fi

rm -rf "$tmp"
dotnet publish "$here/CSharpWasm.csproj" -c Release -o "$tmp" --nologo

rm -rf "$out"
mkdir -p "$out/_framework"
# The plain files (what Vite's dev server sends) plus the precompressed .br variants, which
# the API sends instead when the browser accepts brotli (server/CSharpWasmFiles.cs). The
# .gz copies are skipped: every browser that runs this accepts brotli.
find "$tmp/wwwroot/_framework" -maxdepth 1 -type f ! -name '*.gz' -exec cp {} "$out/_framework/" \;
# The runtime's licence and third-party notices travel with it (see THIRD_PARTY_NOTICES.md).
pack="$(dotnet nuget locals global-packages --list | sed 's/^global-packages: //')"
pack="$pack/microsoft.netcore.app.runtime.mono.browser-wasm/$(dotnet msbuild "$here/CSharpWasm.csproj" -getProperty:BundledNETCoreAppPackageVersion)"
if [[ -f "$pack/THIRD-PARTY-NOTICES.TXT" ]]; then
  cp "$pack/LICENSE.TXT" "$out/dotnet-LICENSE.TXT"
  cp "$pack/THIRD-PARTY-NOTICES.TXT" "$out/dotnet-THIRD-PARTY-NOTICES.TXT"
else
  echo "Warning: .NET runtime pack notices not found in $pack" >&2
fi
# dotnet.js last: it's the up-to-date stamp above.
touch "$stamp"
plain=$(find "$out/_framework" -type f ! -name '*.br' -printf '%s\n' | awk '{s+=$1} END {printf "%.1f", s/1e6}')
br=$(find "$out/_framework" -type f -name '*.br' -printf '%s\n' | awk '{s+=$1} END {printf "%.1f", s/1e6}')
echo "Published to $out (${plain} MB, ${br} MB as brotli)"
