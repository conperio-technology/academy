// Static mode (docs/adr/0010-static-hosting-mode.md): built with `npm run build:static`
// (`vite build --mode static`; vite.config.ts sets VITE_STATIC), the app runs with no server. Lesson
// content comes from JSON files exported next to the page, progress lives in this browser
// (progressStore.ts), and C# is graded only in the browser. Vite replaces the flag at build
// time, so the other mode's code is dropped from each bundle.
export const STATIC_MODE = import.meta.env.VITE_STATIC === "1";

// A file shipped with the site (public/ or the exported content), resolved against the page,
// so it works when the site is hosted under a subpath such as /academy/.
export function siteUrl(path: string): string {
  return new URL(`${import.meta.env.BASE_URL}${path}`, document.baseURI).href;
}
