// Compares two query results the way the SQL practice problems grade them: same number of
// columns, same rows (as a multiset unless order matters), column names ignored, numbers to 2
// decimal places so 150 and 150.0 match. Shared by components/tools/SqlPractice.tsx and
// scripts/check-sql-practice.mjs.

export type Cell = number | string | null | Uint8Array | bigint;

export interface RowsResult {
  columns: string[];
  values: Cell[][];
}

function cellKey(v: Cell): string {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number" || typeof v === "bigint") return `n:${Number(v).toFixed(2)}`;
  if (v instanceof Uint8Array) return `b:${Array.from(v).join(",")}`;
  return `s:${v}`;
}

function rowKey(row: Cell[]): string {
  return JSON.stringify(row.map(cellKey));
}

// null when the results match, otherwise a short reason for the learner.
export function compareResults(got: RowsResult, want: RowsResult, ordered: boolean): string | null {
  if (got.columns.length !== want.columns.length) {
    return `Expected ${want.columns.length} column${want.columns.length === 1 ? "" : "s"}, got ${got.columns.length}.`;
  }
  if (got.values.length !== want.values.length) {
    return `Expected ${want.values.length} row${want.values.length === 1 ? "" : "s"}, got ${got.values.length}.`;
  }
  const g = got.values.map(rowKey);
  const w = want.values.map(rowKey);
  if (ordered) {
    const i = g.findIndex((k, j) => k !== w[j]);
    if (i === -1) return null;
    const sorted = (a: string[]) => [...a].sort().join("\n");
    return sorted(g) === sorted(w) ? "The right rows, but not in the order the question asks for." : `Row ${i + 1} doesn't match.`;
  }
  const counts = new Map<string, number>();
  for (const k of w) counts.set(k, (counts.get(k) ?? 0) + 1);
  for (const k of g) {
    const n = counts.get(k) ?? 0;
    if (n === 0) return "At least one row isn't in the expected result.";
    counts.set(k, n - 1);
  }
  return null;
}
