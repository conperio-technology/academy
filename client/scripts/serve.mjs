// A small static file server for a built site, used by ../scripts/verify.sh and handy for a
// quick look at a build. It serves the folder under a subpath (default /academy/, like
// GitHub Pages), so a page that fetches with a leading "/" fails here as it would there.
//
//   node scripts/serve.mjs [--dir dist] [--port 5802] [--base /academy/]
//
// Then open http://localhost:5802/academy/. Stop it with Ctrl+C.
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { arg } from "./playwright.mjs";

const root = resolve(arg("dir", "dist"));
const port = Number(arg("port", "5802"));
const base = `/${arg("base", "/academy/").replace(/^\/+|\/+$/g, "")}/`.replace(/^\/\/$/, "/");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path === base.slice(0, -1)) {
    res.writeHead(301, { Location: base }).end();
    return;
  }
  if (!path.startsWith(base)) {
    res.writeHead(404).end("Not found");
    return;
  }
  let file = normalize(join(root, path.slice(base.length)));
  if (file !== root && !file.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    if (statSync(file).isDirectory()) file = join(file, "index.html");
    const size = statSync(file).size;
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream", "Content-Length": size });
    if (req.method === "HEAD") res.end();
    else createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}${base}`));
