// Builds the static site (docs/adr/0010-static-hosting-mode.md) into client/dist-static/:
// the client in static mode, plus the lesson content exported from the server's C# classes
// as JSON. No server or database is needed to run the result; any static file host works.
//
//   npm run build:static                     (from client/; base "./", works at any path)
//   VITE_BASE=/academy/ npm run build:static (pin an absolute base instead)
//
// Run ../wasm-csharp/build.sh first so C# can be graded (the static site has no server to
// fall back to). Then preview it with `npm run preview:static`, or any static server.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const client = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(client, "dist-static");

function run(cmd, args) {
  console.log(`> ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, { cwd: client, stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

if (!existsSync(join(client, "public", "csharp-wasm", "_framework", "dotnet.js"))) {
  console.warn("Warning: public/csharp-wasm is missing (run ../wasm-csharp/build.sh). The static site will not be able to grade C#.");
}

run("npx", ["tsc", "-b"]);
run("npx", ["vite", "build", "--mode", "static"]);
run("dotnet", ["run", "--project", join(client, "..", "server", "server.csproj"), "--no-launch-profile", "--", "--export-content", join(out, "content")]);
// GitHub Pages runs Jekyll by default, which drops folders starting with "_" (csharp-wasm/_framework).
writeFileSync(join(out, ".nojekyll"), "");

function size(path) {
  const s = statSync(path);
  return s.isDirectory() ? readdirSync(path).reduce((sum, f) => sum + size(join(path, f)), 0) : s.size;
}
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
const parts = readdirSync(out).map((f) => [f, size(join(out, f))]).sort((a, b) => b[1] - a[1]);
console.log(`\nStatic site in ${out}: ${mb(size(out))}`);
for (const [f, bytes] of parts.filter(([, b]) => b > 100 * 1024)) console.log(`  ${f.padEnd(14)} ${mb(bytes)}`);
