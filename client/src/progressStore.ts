// Where graded progress is kept: one IndexedDB object store of ProgressRow
// (progressCore.ts). Every read and change reads the store afresh (it is a few hundred rows
// at most), so two open tabs don't overwrite each other's progress. If IndexedDB
// can't be opened (a private window, blocked site data, an old browser) progress is kept in
// memory for this tab only, and `storageKind()` says so.
import type { ProgressRow } from "./progressCore";

const DB_NAME = "conperio-academy";
const STORE = "progress";

let rows: ProgressRow[] | null = null;
let db: IDBDatabase | null = null;
let kind: "indexeddb" | "memory" = "indexeddb";
let loading: Promise<void> | null = null;
// Changes run one after another, so two quick runs can't interleave their read and write.
let queue: Promise<unknown> = Promise.resolve();

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("IndexedDB is blocked by another tab."));
  });
}

async function load() {
  try {
    db = await openDb();
    const all = await request(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
    rows = (all as ProgressRow[]).sort((a, b) => a.id - b.id);
    kind = "indexeddb";
  } catch {
    db = null;
    rows = [];
    kind = "memory";
  }
}

async function ready(): Promise<ProgressRow[]> {
  if (!loading) loading = load();
  await loading;
  if (db && kind === "indexeddb") {
    try {
      const all = await request(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
      rows = (all as ProgressRow[]).sort((a, b) => a.id - b.id);
    } catch {
      kind = "memory";
    }
  }
  return rows!;
}

// Writes the rows that changed (or all of them) to IndexedDB. A failed write leaves the
// in-memory copy as the truth for this tab.
async function persist(replaceAll: boolean, changed: ProgressRow[], removedIds: number[]) {
  if (!db) return;
  try {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    if (replaceAll) store.clear();
    for (const id of removedIds) store.delete(id);
    for (const r of changed) store.put(r);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch {
    kind = "memory";
  }
}

export function storageKind() {
  return kind;
}

// A copy of every row, oldest first.
export async function readRows(): Promise<ProgressRow[]> {
  return (await ready()).map((r) => ({ ...r }));
}

// Runs `change` on the live rows (it may mutate them, push new ones or return a new list) and
// saves the result.
export function updateRows(change: (rows: ProgressRow[]) => ProgressRow[] | void): Promise<void> {
  const run = queue.then(async () => {
    const current = await ready();
    const before = new Map(current.map((r) => [r.id, JSON.stringify(r)]));
    const next = change(current) ?? current;
    rows = next;
    const changed = next.filter((r) => before.get(r.id) !== JSON.stringify(r));
    const keep = new Set(next.map((r) => r.id));
    const removed = [...before.keys()].filter((id) => !keep.has(id));
    await persist(false, changed, removed);
  });
  queue = run.catch(() => undefined);
  return run;
}

// Replaces everything (import).
export function replaceRows(next: ProgressRow[]): Promise<void> {
  const run = queue.then(async () => {
    await ready();
    rows = next.map((r) => ({ ...r }));
    await persist(true, rows, []);
  });
  queue = run.catch(() => undefined);
  return run;
}
