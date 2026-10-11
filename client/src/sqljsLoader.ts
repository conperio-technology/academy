// Loads SQL-in-the-browser (sql.js, a WASM SQLite build) from a CDN the same way
// Pyodide is -- no bundling, no local install, only fetched the first time a learner
// actually opens a SQL playground, and cached for the rest of the session.
const SQLJS_VERSION = "1.14.2";
const SQLJS_CDN_BASE = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/`;

export type SqlValue = number | string | Uint8Array | null;

export interface SqlJsQueryResult {
  columns: string[];
  values: SqlValue[][];
}

// A prepared statement: SQL with ? placeholders, values bound separately (see the SQL
// Injection lesson for why that separation matters).
export interface SqlJsStatement {
  bind: (values: SqlValue[]) => boolean;
  step: () => boolean;
  getAsObject: () => Record<string, SqlValue>;
  free: () => boolean;
}

export interface SqlJsDatabase {
  run: (sql: string) => void;
  exec: (sql: string) => SqlJsQueryResult[];
  prepare: (sql: string) => SqlJsStatement;
}

interface SqlJsStatic {
  Database: new () => SqlJsDatabase;
}

declare global {
  interface Window {
    initSqlJs?: (config: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>;
  }
}

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load sql.js from ${src}`));
    document.head.appendChild(script);
  });
}

export function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = loadScript(`${SQLJS_CDN_BASE}sql-wasm.js`).then(() => {
      if (!window.initSqlJs) {
        throw new Error("sql-wasm.js loaded but window.initSqlJs is missing.");
      }
      return window.initSqlJs({ locateFile: (file) => `${SQLJS_CDN_BASE}${file}` });
    });
  }
  return sqlJsPromise;
}
