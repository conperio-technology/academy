import { useState } from "react";
import { openLesson } from "../../api";

// A hand-written trace of three tiny Python programs: nested calls, a recursive factorial,
// and values vs references. Each step lists the current line, the stack frames (newest on
// top) with their variables, any heap objects, and what was printed.

interface Frame {
  name: string;
  vars: [string, string][];
}
interface Step {
  line: number;
  frames: Frame[]; // bottom (main) first
  heap?: [string, string][];
  note: string;
  out?: string;
}
interface Program {
  label: string;
  code: string[];
  steps: Step[];
}

const main = (vars: [string, string][] = []): Frame => ({ name: "main", vars });

const PROGRAMS: Record<"nested" | "recursion" | "refs", Program> = {
  nested: {
    label: "Nested calls",
    code: [
      "def multiply(a, b):",
      "    return a * b",
      "",
      "def area(w, h):",
      "    result = multiply(w, h)",
      "    return result",
      "",
      "size = area(3, 4)",
      "print(size)",
    ],
    steps: [
      { line: 8, frames: [main()], note: "The program starts at the top level, which we'll call main. Defining the two functions just remembers them; nothing runs until line 8 calls area(3, 4)." },
      { line: 4, frames: [main(), { name: "area", vars: [["w", "3"], ["h", "4"]] }], note: "Calling area pushes a new frame with its parameters, w = 3 and h = 4. main is paused halfway through line 8, waiting for the answer." },
      { line: 5, frames: [main(), { name: "area", vars: [["w", "3"], ["h", "4"]] }, { name: "multiply", vars: [["a", "3"], ["b", "4"]] }], note: "area calls multiply(w, h): another frame on top. Only the top frame runs; the two below are paused." },
      { line: 2, frames: [main(), { name: "area", vars: [["w", "3"], ["h", "4"]] }, { name: "multiply", vars: [["a", "3"], ["b", "4"]] }], note: "multiply computes 3 * 4 = 12 and returns it to whoever called it." },
      { line: 5, frames: [main(), { name: "area", vars: [["w", "3"], ["h", "4"], ["result", "12"]] }], note: "multiply's frame is popped and its a and b are gone for good. area carries on where it paused and stores 12 in result." },
      { line: 6, frames: [main(), { name: "area", vars: [["w", "3"], ["h", "4"], ["result", "12"]] }], note: "area returns result (12)." },
      { line: 8, frames: [main([["size", "12"]])], note: "area's frame is popped. Back in main, the call's value 12 is stored in size." },
      { line: 9, frames: [main([["size", "12"]])], note: "print shows 12. (print is a function too: it got a frame of its own for a moment.)", out: "12" },
    ],
  },
  recursion: {
    label: "Recursion: factorial(3)",
    code: [
      "def factorial(n):",
      "    if n == 1:",
      "        return 1          # base case",
      "    return n * factorial(n - 1)",
      "",
      "print(factorial(3))",
    ],
    steps: [
      { line: 6, frames: [main()], note: "main calls factorial(3). factorial calls itself, but every call still gets its own frame." },
      { line: 2, frames: [main(), { name: "factorial", vars: [["n", "3"]] }], note: "n is 3, not 1, so this isn't the base case." },
      { line: 4, frames: [main(), { name: "factorial", vars: [["n", "3"]] }, { name: "factorial", vars: [["n", "2"]] }], note: "To work out 3 * factorial(2) it must call factorial(2) first. A second frame for the same function, with its own n = 2. The first call is paused, still holding n = 3." },
      { line: 4, frames: [main(), { name: "factorial", vars: [["n", "3"]] }, { name: "factorial", vars: [["n", "2"]] }, { name: "factorial", vars: [["n", "1"]] }], note: "factorial(2) needs factorial(1): a third frame. Each call is on a smaller input, moving toward the base case." },
      { line: 3, frames: [main(), { name: "factorial", vars: [["n", "3"]] }, { name: "factorial", vars: [["n", "2"]] }, { name: "factorial", vars: [["n", "1"]] }], note: "n == 1: the base case. It answers 1 directly, without another call. Without this line the frames would keep piling up until the stack overflows." },
      { line: 4, frames: [main(), { name: "factorial", vars: [["n", "3"]] }, { name: "factorial", vars: [["n", "2"]] }], note: "The n = 1 frame is popped. factorial(2) resumes and computes 2 * 1 = 2." },
      { line: 4, frames: [main(), { name: "factorial", vars: [["n", "3"]] }], note: "factorial(2)'s frame is popped. factorial(3) resumes and computes 3 * 2 = 6." },
      { line: 6, frames: [main()], note: "The last factorial frame is popped and main prints 6. The stack grew to three factorial frames and unwound in reverse order.", out: "6" },
    ],
  },
  refs: {
    label: "Values vs references",
    code: ["a = 5", "b = a", "b = b + 1", "xs = [1, 2]", "ys = xs", "ys.append(3)", "print(a, xs)"],
    steps: [
      { line: 1, frames: [main([["a", "5"]])], note: "a holds the number 5." },
      { line: 2, frames: [main([["a", "5"], ["b", "5"]])], note: "b = a gives b the same value. A number can't be changed in place, so a and b behave like two separate 5s." },
      { line: 3, frames: [main([["a", "5"], ["b", "6"]])], note: "b = b + 1 makes a new number, 6, and points b at it. a still holds 5." },
      { line: 4, frames: [main([["a", "5"], ["b", "6"], ["xs", "-> list #1"]])], heap: [["list #1", "[1, 2]"]], note: "A list is an object. It's created on the heap, and xs holds a reference to it (in effect, its address), not the list itself." },
      { line: 5, frames: [main([["a", "5"], ["b", "6"], ["xs", "-> list #1"], ["ys", "-> list #1"]])], heap: [["list #1", "[1, 2]"]], note: "ys = xs copies the reference, not the list. Both names now point at the same single list." },
      { line: 6, frames: [main([["a", "5"], ["b", "6"], ["xs", "-> list #1"], ["ys", "-> list #1"]])], heap: [["list #1", "[1, 2, 3]"]], note: "Appending through ys changes the one shared list..." },
      { line: 7, frames: [main([["a", "5"], ["b", "6"], ["xs", "-> list #1"], ["ys", "-> list #1"]])], heap: [["list #1", "[1, 2, 3]"]], note: "...so xs sees the 3 as well. To get an independent copy, make one explicitly: ys = list(xs) in Python, new List<int>(xs) in C#. C# classes, arrays and lists behave the same way; C# ints, doubles and structs are copied like a and b.", out: "5 [1, 2, 3]" },
    ],
  },
};

type Key = keyof typeof PROGRAMS;

export function FunctionsCallStack() {
  const [key, setKey] = useState<Key>("nested");
  const [i, setI] = useState(0);
  const prog = PROGRAMS[key];
  const step = prog.steps[i];
  const output = prog.steps.slice(0, i + 1).map((s) => s.out).filter(Boolean);

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        {(Object.keys(PROGRAMS) as Key[]).map((k) => (
          <button key={k} className={k === key ? "active" : ""} onClick={() => { setKey(k); setI(0); }}>
            {PROGRAMS[k].label}
          </button>
        ))}
      </div>

      <div className="fcs-grid">
        <pre className="algo-code fcs-code" aria-label="Program">
          {prog.code.map((l, n) => (
            <span key={n} className={n + 1 === step.line ? "fcs-line fcs-current" : "fcs-line"}>
              <span className="fcs-num">{n + 1}</span>
              {l || " "}
            </span>
          ))}
        </pre>

        <div className="fcs-memory">
          <span className="stack-label">Call stack (top is running)</span>
          <div className="fcs-stack">
            {[...step.frames].reverse().map((f, n) => (
              <div key={step.frames.length - n} className={n === 0 ? "fcs-frame fcs-top" : "fcs-frame"}>
                <span className="fcs-frame-name">{f.name}</span>
                {f.vars.length === 0 ? (
                  <span className="fcs-var fcs-empty">no variables yet</span>
                ) : (
                  f.vars.map(([k, v]) => (
                    <span key={k} className="fcs-var">
                      {k} = <b>{v}</b>
                    </span>
                  ))
                )}
              </div>
            ))}
          </div>
          {step.heap && (
            <>
              <span className="stack-label">Heap</span>
              <div className="fcs-stack">
                {step.heap.map(([k, v]) => (
                  <div key={k} className="fcs-frame fcs-heap">
                    <span className="fcs-frame-name">{k}</span>
                    <span className="fcs-var"><b>{v}</b></span>
                  </div>
                ))}
              </div>
            </>
          )}
          <span className="stack-label">Output</span>
          <pre className="fcs-out">{output.join("\n") || " "}</pre>
        </div>
      </div>

      <p className="gate-note" aria-live="polite">
        Step {i + 1} of {prog.steps.length}: {step.note}
      </p>
      <div className="cm-actions">
        <button disabled={i === 0} onClick={() => setI(i - 1)}>Previous step</button>
        <button disabled={i === prog.steps.length - 1} onClick={() => setI(i + 1)}>Next step</button>
        <button onClick={() => setI(0)}>Restart</button>
      </div>
      <p className="gate-note">
        Next:{" "}
        <button className="link-button" onClick={() => openLesson("recursion-factorial")}>
          write factorial yourself
        </button>{" "}
        or see how C# lays out{" "}
        <button className="link-button" onClick={() => openLesson("stack-heap-gc")}>
          the stack, the heap and garbage collection
        </button>
        .
      </p>
    </div>
  );
}
