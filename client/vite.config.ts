import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

// Serves the repo's THIRD_PARTY_NOTICES.md as THIRD_PARTY_NOTICES.txt (plain text displays on
// every host) in dev and writes it into every build (dist/ and dist-static/). The sidebar and
// the Linux lab link to it.
function thirdPartyNotices(): Plugin {
  const notices = () => readFileSync(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url))
  return {
    name: 'third-party-notices',
    configureServer(server) {
      server.middlewares.use('/THIRD_PARTY_NOTICES.txt', (_req, res) => {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(notices())
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'THIRD_PARTY_NOTICES.txt', source: notices() })
    },
  }
}

// https://vite.dev/config/
// `--mode static` (npm run build:static, see src/staticMode.ts) builds the
// serverless static site into dist-static/. Its base defaults to "./", so the same build
// works at any path (https://host/ or https://host/academy/); VITE_BASE=/academy/ pins one.
export default defineConfig(({ mode }) => {
  const isStatic = mode === "static" || process.env.VITE_STATIC === "1";
  return {
    plugins: [react(), thirdPartyNotices()],
    base: isStatic ? (process.env.VITE_BASE ?? "./") : "/",
    build: isStatic ? { outDir: "dist-static" } : {},
    // STATIC_MODE in src/staticMode.ts; replaced at build time, so each mode drops the other's code.
    define: isStatic ? { "import.meta.env.VITE_STATIC": JSON.stringify("1") } : {},
    server: {
      // Listen on all network interfaces (0.0.0.0), not just localhost, so the dev
      // server is reachable from other devices on the LAN via this machine's IP or
      // hostname (e.g. http://your-computer-name:5173), not only from this machine.
      host: true,
      // Vite's DNS-rebinding protection only trusts localhost/127.0.0.1/LAN IPs by
      // default, not arbitrary hostnames -- true disables that check entirely rather
      // than naming one specific hostname (the machine's name, plus whatever it gets
      // renamed to or accessed as later). Fine here: single-user, local network,
      // nothing sensitive being protected by that check in the first place.
      allowedHosts: true,
      // The browser only ever talks to this one origin: /api is forwarded to the API on
      // the same machine. A page calling a second port directly is cross-origin, and
      // Chrome's Private Network Access blocks it when the page's hostname resolves
      // differently from the API's (seen opening http://<computer-name>:5173 on a
      // company network), whatever the API's CORS headers say.
      proxy: {
        "/api": "http://localhost:5095",
      },
    },
  };
})
