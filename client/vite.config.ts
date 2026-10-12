import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

// Serves the repo's THIRD_PARTY_NOTICES.md as THIRD_PARTY_NOTICES.txt (plain text displays on
// every host) in dev and writes it into every build. The sidebar and
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
// The site is plain files (docs/adr/0013): `npm run build` (scripts/build.mjs) writes it to
// dist/. Its base defaults to "./", so the same build works at any path (https://host/ or
// https://host/academy/); VITE_BASE=/academy/ pins one. The lesson content is JSON in
// public/content/, exported from the C# lesson classes by scripts/export-content.mjs before
// `npm run dev` and `npm run build`.
export default defineConfig({
  plugins: [react(), thirdPartyNotices()],
  base: process.env.VITE_BASE ?? "./",
  server: {
    // Listen on all network interfaces, so the dev server is reachable from other devices
    // on the LAN (http://your-computer-name:5173), and accept any hostname for it.
    host: true,
    allowedHosts: true,
  },
})
