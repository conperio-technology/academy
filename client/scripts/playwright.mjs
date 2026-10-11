// Finds Playwright for the verify scripts without making it a dependency of the app.
// Looked up, in order: the client's own node_modules (if someone installed it there), each
// directory in NODE_PATH, then /opt/node-tools/node_modules. Install it anywhere and point
// NODE_PATH at that node_modules folder, e.g.
//   npm install --prefix ~/pw playwright && npx --prefix ~/pw playwright install chromium
//   NODE_PATH=~/pw/node_modules node scripts/verify-solutions.mjs ...
import { createRequire } from "node:module";
import { delimiter, dirname } from "node:path";

const require = createRequire(import.meta.url);

function searchPaths() {
  return [undefined, ...(process.env.NODE_PATH ?? "").split(delimiter).filter(Boolean), "/opt/node-tools/node_modules"];
}

function resolveFrom(request) {
  for (const p of searchPaths()) {
    try {
      return require.resolve(request, p ? { paths: [p] } : undefined);
    } catch {
      // try the next location
    }
  }
  return null;
}

export function loadPlaywright() {
  const path = resolveFrom("playwright");
  if (!path) {
    throw new Error(
      "Playwright not found. Install it outside the repo and set NODE_PATH to its node_modules " +
        "(see the comment at the top of client/scripts/playwright.mjs).",
    );
  }
  return require(path);
}

// The folder holding one of a package's files (e.g. a local copy of pyodide), looked up the
// same way, or null.
export function findPackageDir(name, file) {
  const path = resolveFrom(`${name}/${file}`);
  return path ? dirname(path) : null;
}

export function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : fallback;
}
