// Writes the lesson content (every lesson is a C# class in ../content/) as the JSON files the
// site loads, into public/content/ (gitignored). Vite serves that folder in `npm run dev` and
// copies it into dist/ on `npm run build`; both run this first (predev, scripts/build.mjs).
//
//   node scripts/export-content.mjs           (from client/; or `npm run content`)
//
// Needs the .NET 10 SDK. Takes a few seconds when the exporter is already built. After
// editing a lesson's C# while `npm run dev` is running, run it again and reload the page.
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const client = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(client, "public", "content");
const project = join(client, "..", "content", "content.csproj");

// A fresh folder, so a deleted or renamed lesson doesn't leave its old file behind.
rmSync(out, { recursive: true, force: true });
const r = spawnSync("dotnet", ["run", "--project", project, "--", out], {
  cwd: client,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (r.error) {
  console.error(`Couldn't run dotnet (${r.error.message}). The lesson content is built from C#, so the .NET 10 SDK is needed.`);
  process.exit(1);
}
if (r.status !== 0) process.exit(r.status ?? 1);
