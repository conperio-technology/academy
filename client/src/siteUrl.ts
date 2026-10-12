// A file shipped with the site (public/ or the exported content), resolved against the page,
// so it works when the site is hosted under a subpath such as /academy/.
export function siteUrl(path: string): string {
  return new URL(`${import.meta.env.BASE_URL}${path}`, document.baseURI).href;
}
