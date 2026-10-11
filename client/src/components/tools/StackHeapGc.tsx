import { useState } from "react";
import { CodeListing } from "./concurrencyShared";

// Part 1: a hand-written trace of a small C# program: the stack frames and their locals,
// and the heap objects with their references, after each line. "Run GC here" marks what's
// reachable from the roots (the locals in live frames) and sweeps the rest.
// Part 2: a toy generational heap: gen 0 fills, a gen 0 collection frees the dead and
// promotes survivors, and only every fourth collection also looks at gen 1.

const PROGRAM = [
  "struct Point { public int X, Y; }",
  "class Node { public int Value; public Node? Next; }",
  "",
  "static void Main()",
  "{",
  "    int n = 3;",
  "    Point p = new Point { X = 1, Y = 2 };",
  "    Point q = p;",
  "    q.X = 5;",
  "    Node a = new Node { Value = 10 };",
  "    Node? b = a;",
  "    b.Value = 11;",
  "    a.Next = Build(20);",
  "    b = null;",
  "    a.Next = null;",
  "}",
  "",
  "static Node Build(int v)",
  "{",
  "    Node tmp = new Node { Value = v };",
  "    Node scratch = new Node { Value = 99 };",
  "    return tmp;",
  "}",
];

interface Local {
  name: string;
  value: string;
  ref?: number | null; // heap object id, or null for a null reference
}
interface Frame {
  method: string;
  locals: Local[];
}
interface Obj {
  id: number;
  value: number;
  next: number | null;
}
interface Snap {
  line: number;
  frames: Frame[];
  heap: Obj[];
  note: string;
}

const ref = (name: string, to: number | null): Local => ({ name, value: to === null ? "null" : `→ #${to}`, ref: to });
const val = (name: string, value: string): Local => ({ name, value });

const SNAPS: Snap[] = [
  { line: 3, frames: [{ method: "Main", locals: [] }], heap: [], note: "Main is called, so the runtime pushes a frame for it on this thread's stack." },
  { line: 5, frames: [{ method: "Main", locals: [val("n", "3")] }], heap: [], note: "int is a value type: the 3 is stored directly in Main's frame." },
  {
    line: 6,
    frames: [{ method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }")] }],
    heap: [],
    note: "Point is a struct, so p holds the fields themselves, inline in the frame. Despite the new, nothing goes on the heap.",
  },
  {
    line: 7,
    frames: [{ method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 1, Y = 2 }")] }],
    heap: [],
    note: "Assigning a struct copies all of its fields. p and q are two separate values.",
  },
  {
    line: 8,
    frames: [{ method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }")] }],
    heap: [],
    note: "Changing q leaves p alone: p.X is still 1.",
  },
  {
    line: 9,
    frames: [{ method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }"), ref("a", 1)] }],
    heap: [{ id: 1, value: 10, next: null }],
    note: "Node is a class, so new allocates the object on the heap. a holds only a reference to it (8 bytes on a 64-bit machine).",
  },
  {
    line: 10,
    frames: [{ method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }"), ref("a", 1), ref("b", 1)] }],
    heap: [{ id: 1, value: 10, next: null }],
    note: "Assigning a reference copies the reference, not the object. a and b now point at the same #1.",
  },
  {
    line: 11,
    frames: [{ method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }"), ref("a", 1), ref("b", 1)] }],
    heap: [{ id: 1, value: 11, next: null }],
    note: "There's only one object, so a change made through b is visible through a: a.Value is 11 now.",
  },
  {
    line: 17,
    frames: [
      { method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }"), ref("a", 1), ref("b", 1)] },
      { method: "Build", locals: [val("v", "20")] },
    ],
    heap: [{ id: 1, value: 11, next: null }],
    note: "Calling Build pushes a new frame on top of Main's. Its parameter v gets a copy of 20.",
  },
  {
    line: 19,
    frames: [
      { method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }"), ref("a", 1), ref("b", 1)] },
      { method: "Build", locals: [val("v", "20"), ref("tmp", 2)] },
    ],
    heap: [{ id: 1, value: 11, next: null }, { id: 2, value: 20, next: null }],
    note: "A second heap object, #2, referenced by Build's local tmp.",
  },
  {
    line: 20,
    frames: [
      { method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }"), ref("a", 1), ref("b", 1)] },
      { method: "Build", locals: [val("v", "20"), ref("tmp", 2), ref("scratch", 3)] },
    ],
    heap: [{ id: 1, value: 11, next: null }, { id: 2, value: 20, next: null }, { id: 3, value: 99, next: null }],
    note: "And a third, #3, referenced only by scratch.",
  },
  {
    line: 12,
    frames: [{ method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }"), ref("a", 1), ref("b", 1)] }],
    heap: [{ id: 1, value: 11, next: 2 }, { id: 2, value: 20, next: null }, { id: 3, value: 99, next: null }],
    note: "Build returns: its frame is popped in one pointer move, and tmp and scratch are gone. #2 lives on because a.Next now refers to it. #3 is still taking up heap space, but nothing refers to it any more: it's garbage. Try Run GC here.",
  },
  {
    line: 13,
    frames: [{ method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }"), ref("a", 1), ref("b", null)] }],
    heap: [{ id: 1, value: 11, next: 2 }, { id: 2, value: 20, next: null }, { id: 3, value: 99, next: null }],
    note: "b no longer refers to #1, but a still does, so #1 is still reachable.",
  },
  {
    line: 14,
    frames: [{ method: "Main", locals: [val("n", "3"), val("p", "{ X = 1, Y = 2 }"), val("q", "{ X = 5, Y = 2 }"), ref("a", 1), ref("b", null)] }],
    heap: [{ id: 1, value: 11, next: null }, { id: 2, value: 20, next: null }, { id: 3, value: 99, next: null }],
    note: "Now #2 is unreachable too. Nothing is freed at this moment: .NET frees memory when a collection runs (usually when gen 0 fills up), not when the last reference goes away.",
  },
  {
    line: 15,
    frames: [],
    heap: [{ id: 1, value: 11, next: null }, { id: 2, value: 20, next: null }, { id: 3, value: 99, next: null }],
    note: "Main returns and its frame is popped. No roots are left, so every object is garbage, waiting for the next collection.",
  },
];

function reachable(s: Snap): Set<number> {
  const seen = new Set<number>();
  const stack = s.frames.flatMap((f) => f.locals.map((l) => l.ref).filter((r): r is number => r !== undefined && r !== null));
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const o = s.heap.find((h) => h.id === id);
    if (o?.next != null) stack.push(o.next);
  }
  return seen;
}

// ---- generational toy ----

const GEN0_SIZE = 8;

interface GObj {
  id: number;
  gen: 0 | 1 | 2;
  live: boolean;
  label: string;
}
interface Gen {
  objs: GObj[];
  next: number;
  collections: [number, number, number];
  examined: number;
  log: string[];
}
const GSTART: Gen = { objs: [], next: 1, collections: [0, 0, 0], examined: 0, log: [] };

function collect(g: Gen, upTo: 0 | 1 | 2): Gen {
  const looked = g.objs.filter((o) => o.gen <= upTo);
  const dead = looked.filter((o) => !o.live).length;
  const objs = g.objs
    .filter((o) => o.gen > upTo || o.live)
    .map((o) => (o.gen <= upTo && o.gen < 2 ? { ...o, gen: (o.gen + 1) as 1 | 2 } : o));
  const collections = [...g.collections] as [number, number, number];
  // Like GC.CollectionCount: a gen 1 collection also counts as a gen 0 one, and so on.
  for (let k = 0; k <= upTo; k++) collections[k]++;
  const promoted = looked.length - dead;
  return {
    ...g,
    objs,
    collections,
    examined: g.examined + looked.length,
    log: [`Gen ${upTo} collection: looked at ${looked.length} objects, freed ${dead}, ${promoted} survived`, ...g.log].slice(0, 5),
  };
}

function allocate(g: Gen, count: number, live: boolean, label: string): Gen {
  let x = g;
  for (let i = 0; i < count; i++) {
    if (x.objs.filter((o) => o.gen === 0).length >= GEN0_SIZE) {
      // Every fourth gen 0 collection also collects gen 1.
      x = collect(x, (x.collections[0] + 1) % 4 === 0 ? 1 : 0);
    }
    x = { ...x, objs: [...x.objs, { id: x.next, gen: 0, live, label }], next: x.next + 1 };
  }
  // Short-lived objects die as soon as the request that made them finishes.
  return { ...x, objs: x.objs.map((o) => (o.label === "temp" ? { ...o, live: false } : o)) };
}

export function StackHeapGc() {
  const [i, setI] = useState(0);
  const [gc, setGc] = useState<"none" | "marked" | "swept">("none");
  const [g, setG] = useState<Gen>(GSTART);

  const snap = SNAPS[i];
  const live = reachable(snap);
  const heap = gc === "swept" ? snap.heap.filter((o) => live.has(o.id)) : snap.heap;
  const go = (k: number) => {
    setI(k);
    setGc("none");
  };

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Step through the program</h3>
        <div className="cm-mem-layout">
          <CodeListing lines={PROGRAM} active={snap.line} />
          <div className="cm-mem-cols">
            <div className="cm-mem-col">
              <span className="readout-label">Stack (this thread)</span>
              {snap.frames.length === 0 && <span className="mq-small">empty</span>}
              {[...snap.frames].reverse().map((f, k) => (
                <div key={f.method} className={`cm-frame ${k === 0 ? "cm-frame-top" : ""}`}>
                  <strong>{f.method}()</strong>
                  {f.locals.length === 0 && <span className="mq-small">no locals yet</span>}
                  {f.locals.map((l) => (
                    <span key={l.name} className={`cm-local ${l.ref != null && gc !== "none" ? "cm-root" : ""}`}>
                      <code>{l.name}</code> <span className="mono">{l.value}</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
            <div className="cm-mem-col">
              <span className="readout-label">Heap (shared)</span>
              {heap.length === 0 && <span className="mq-small">{gc === "swept" && snap.heap.length ? "everything was garbage" : "empty"}</span>}
              {heap.map((o) => (
                <div key={o.id} className={`cm-obj ${gc !== "none" ? (live.has(o.id) ? "cm-obj-live" : "cm-obj-dead") : ""}`}>
                  <strong>#{o.id} Node</strong>
                  <span className="mono">Value = {o.value}</span>
                  <span className="mono">Next = {o.next === null ? "null" : `→ #${o.next}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="arch-detail">
          <strong>
            Step {i + 1} of {SNAPS.length}
          </strong>
          <p>{snap.note}</p>
        </div>
        <div className="cm-actions">
          <button disabled={i === 0} onClick={() => go(i - 1)}>
            ◀ Back
          </button>
          <button disabled={i === SNAPS.length - 1} onClick={() => go(i + 1)}>
            Next ▶
          </button>
          <button disabled={snap.heap.length === 0 || gc === "swept"} onClick={() => setGc(gc === "none" ? "marked" : "swept")}>
            {gc === "none" ? "Run GC here: mark" : "Sweep"}
          </button>
        </div>
        {gc === "marked" && (
          <p className="gate-note">
            Mark: start from the roots (the highlighted locals holding references) and follow every reference. Green objects were reached; red ones
            weren't, so no code can ever use them again. Click Sweep to free them.
          </p>
        )}
        {gc === "swept" && (
          <p className="gate-note">
            Swept. The .NET GC then compacts the survivors together, so the next allocation is still just "bump a pointer". Note it found #1 and #2
            by following a.Next, and it would handle a cycle of objects pointing at each other just as well: only reachability from a root counts.
          </p>
        )}
      </div>

      <div className="crypto-section">
        <h3>Generational GC: most objects die young</h3>
        <div className="cm-actions">
          <button onClick={() => setG(allocate(g, 3, true, "temp"))}>Handle a request (3 temporary objects)</button>
          <button onClick={() => setG(allocate(g, 1, true, "cache"))}>Add a cache entry (long-lived)</button>
          <button onClick={() => setG({ ...g, objs: g.objs.map((o) => (o.label === "cache" ? { ...o, live: false } : o)) })}>Clear the cache</button>
          <button onClick={() => setG(collect(g, 2))}>Full GC (gen 2)</button>
          <button onClick={() => setG(GSTART)}>Reset</button>
        </div>
        <div className="cm-gens">
          {([0, 1, 2] as const).map((gen) => (
            <div key={gen} className="cm-gen">
              <span className="readout-label">
                Gen {gen} {gen === 0 ? `(collected when ${GEN0_SIZE} fill it)` : gen === 1 ? "(every 4th collection)" : "(rarely: full GC)"}
              </span>
              <div className="cm-gen-objs">
                {g.objs
                  .filter((o) => o.gen === gen)
                  .map((o) => (
                    <span key={o.id} className={`cm-gobj ${o.live ? "" : "cm-gobj-dead"} ${o.label === "cache" ? "cm-gobj-cache" : ""}`} title={o.live ? "reachable" : "garbage"}>
                      {o.label === "cache" ? "C" : "t"}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Collections (gen 0 / 1 / 2)</span>
            <span className="readout-value">
              {g.collections[0]} / {g.collections[1]} / {g.collections[2]}
            </span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Objects examined</span>
            <span className="readout-value">{g.examined}</span>
          </div>
        </div>
        <ul className="k8s-events">
          {g.log.map((l, k) => (
            <li key={k}>{l}</li>
          ))}
        </ul>
        <p className="gate-note">
          Handle a few requests: each gen 0 collection only looks at the small young generation, finds nearly everything dead, and is cheap. The few
          survivors (C, the cache entries) get promoted and stop being re-examined every time. Faded boxes are garbage that hasn't been collected
          yet. Clear the cache and notice the entries in gen 2 stay until a full GC: a long-lived object that dies late is the expensive kind.
          Real .NET also tracks references from old objects to young ones (a card table), so a gen 0 collection doesn't have to scan gen 2 to find
          them.
        </p>
      </div>
    </div>
  );
}
