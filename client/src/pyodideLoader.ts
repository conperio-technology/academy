// Loads Python-in-the-browser (Pyodide, a WASM CPython build) from a CDN the same way
// Monaco is already loaded -- no bundling, no local install. It's ~10MB and slow on
// first load, so this is only fetched the first time a learner actually runs Python,
// and the loaded runtime is cached for the life of the worker. Only pythonWorker.ts
// calls this: Python never runs on the page's own thread (see PythonRunner.tsx).
const PYODIDE_VERSION = "0.29.5";
const PYODIDE_CDN_BASE = `https://cdn.jsdelivr.net/npm/pyodide@${PYODIDE_VERSION}/`;

export interface PyProxy {
  set: (key: string, value: unknown) => void;
  destroy: () => void;
}

export interface PyodideInterface {
  globals: { get: (name: string) => () => PyProxy };
  runPythonAsync: (code: string, options?: { globals?: PyProxy }) => Promise<unknown>;
}

interface PyodideModule {
  loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
}

let pyodidePromise: Promise<PyodideInterface> | null = null;

export function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    pyodidePromise = (import(/* @vite-ignore */ `${PYODIDE_CDN_BASE}pyodide.mjs`) as Promise<PyodideModule>)
      .then((mod) => mod.loadPyodide({ indexURL: PYODIDE_CDN_BASE }));
  }
  return pyodidePromise;
}
