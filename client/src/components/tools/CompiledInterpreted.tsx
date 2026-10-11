import { useState } from "react";

// Part 1: three pipelines (C# with the JIT, C# Native AOT, CPython) as clickable stages,
// each showing the artifact that stage produces for the same tiny add function.
// Part 2: a call-count slider for tiered compilation. Part 3: where the time goes in
// one `a + b` under each model.

interface Stage {
  name: string;
  when: "build" | "run";
  artifact: string;
  note: string;
}

type PipelineKey = "jit" | "aot" | "python";

const CS_SOURCE = "static int Add(int a, int b) => a + b;";
const CS_TREE = `MethodDeclaration "Add"
  PredefinedType: int
  ParameterList: (int a, int b)
  ArrowExpressionClause
    AddExpression
      IdentifierName: a
      IdentifierName: b`;
const CS_IL = `.method private hidebysig static int32 Add(int32 a, int32 b) cil managed
{
  .maxstack 8
  IL_0000: ldarg.0    // push a
  IL_0001: ldarg.1    // push b
  IL_0002: add        // pop two, push the sum
  IL_0003: ret
}`;
const TIER1 = `; x64, Windows calling convention: a in ecx, b in edx
lea  eax, [rcx+rdx]
ret`;

const PIPELINES: Record<PipelineKey, { label: string; stages: Stage[] }> = {
  jit: {
    label: "C# (JIT, the default)",
    stages: [
      { name: "Source", when: "build", artifact: CS_SOURCE, note: "What you write." },
      {
        name: "Roslyn",
        when: "build",
        artifact: CS_TREE,
        note: "dotnet build runs Roslyn, the C# compiler. It parses the source into a syntax tree, binds every name to a type or symbol, reports compile errors, and lowers features like async, lambdas and pattern matching into simpler constructs.",
      },
      {
        name: "IL in a .dll",
        when: "build",
        artifact: CS_IL,
        note: "The output is an assembly: intermediate language (IL), a stack-based instruction set for no particular CPU, plus metadata describing every type and method. The same .dll runs on x64 and ARM64, Windows and Linux. You can read it with ILSpy or ildasm.",
      },
      {
        name: "CLR loads it",
        when: "run",
        artifact: "Add  ->  [ precode stub: \"call the JIT, then patch me\" ]",
        note: "At startup the runtime loads the assembly and builds type information from the metadata, but compiles nothing yet. Each method's entry starts out pointing at a small stub that invokes the JIT on the first call.",
      },
      {
        name: "Tier 0 JIT",
        when: "run",
        artifact: `; x64, tier 0 (roughly): fast to produce, not optimized
push rbp
mov  rbp, rsp
mov  [rbp+10h], ecx   ; spill a to the stack
mov  [rbp+18h], edx   ; spill b
mov  eax, [rbp+10h]
add  eax, [rbp+18h]
pop  rbp
ret`,
        note: "First call: RyuJIT, the .NET JIT, compiles Add with almost no optimization, because getting started fast matters more than this code's speed. The stub is patched so later calls go straight to the native code. With dynamic PGO (profile-guided optimization, on by default since .NET 8) hot tier 0 code also records which types and branches actually occur, so tier 1 can optimize for them.",
      },
      {
        name: "Tier 1 JIT",
        when: "run",
        artifact: TIER1,
        note: "After 30 calls the method is queued and recompiled on a background thread with full optimization, using the profile data; then calls switch to the new code. Callers compiled at tier 1 would usually inline Add (copy its body into the caller), so there'd be no call at all.",
      },
    ],
  },
  aot: {
    label: "C# Native AOT",
    stages: [
      { name: "Source", when: "build", artifact: CS_SOURCE, note: "The same C# source; you opt in with <PublishAot>true</PublishAot> and dotnet publish." },
      { name: "Roslyn", when: "build", artifact: CS_TREE, note: "Exactly the same compiler and the same errors as a normal build." },
      { name: "IL", when: "build", artifact: CS_IL, note: "The same IL, but it's an intermediate step now, not what ships." },
      {
        name: "ILCompiler",
        when: "build",
        artifact: "Reachable from Main: Program.Main, Program.Add, Console.WriteLine, ...\nTrimmed: everything else in the framework you never call",
        note: "The AOT compiler walks every method reachable from Main, trims (removes) the rest, and compiles all of it to native code ahead of time, using RyuJIT as the code generator with full optimization. Code it can't see statically, such as types created by reflection from a string or Reflection.Emit, is unsupported or must be declared up front.",
      },
      {
        name: "Native linker",
        when: "build",
        artifact: "hello  (one native executable, a few MB, for linux-x64 only)",
        note: "The platform linker combines the generated code with a small runtime (the GC, threading, exception handling) into one executable for one OS and CPU. Building for ARM64 or Windows means publishing again.",
      },
      {
        name: "Run",
        when: "run",
        artifact: TIER1,
        note: "The OS loads it like any native program. No JIT exists in the process: startup takes milliseconds and memory is lower, which suits containers, serverless functions and CLI tools. The trade-off is no tier 1 re-optimization from real profile data, so peak throughput can be a little lower than the JIT's.",
      },
    ],
  },
  python: {
    label: "Python (CPython)",
    stages: [
      { name: "Source", when: "run", artifact: "def add(a, b):\n    return a + b", note: "Python has no separate build step: everything below happens when you run or import the file." },
      {
        name: "Parse to AST",
        when: "run",
        artifact: "FunctionDef(name='add', args=[a, b],\n  body=[Return(BinOp(Name('a'), Add(), Name('b')))])",
        note: "The tokenizer and parser turn the text into an abstract syntax tree. A SyntaxError is raised here, before any of the file runs. You can see the tree with ast.dump(ast.parse(src)).",
      },
      {
        name: "Bytecode",
        when: "run",
        artifact: `>>> dis.dis(add)          # Python 3.12
  1   RESUME        0
  2   LOAD_FAST     0 (a)
      LOAD_FAST     1 (b)
      BINARY_OP     0 (+)
      RETURN_VALUE`,
        note: "The compiler turns the AST into a code object: bytecode for a stack machine, plus constants and names. Note what's missing: there are no types. BINARY_OP doesn't know whether it will add ints, floats, strings or your own class.",
      },
      {
        name: ".pyc cache",
        when: "run",
        artifact: "__pycache__/mathutil.cpython-312.pyc",
        note: "For imported modules, CPython writes the bytecode to __pycache__ so the next run can skip parsing and compiling if the source hasn't changed. The script you run directly isn't cached. A .pyc is still bytecode, not machine code.",
      },
      {
        name: "Eval loop",
        when: "run",
        artifact: `// the interpreter, very simplified
for (;;) {
  switch (*ip++) {
  case LOAD_FAST:  push(locals[oparg]); break;
  case BINARY_OP:  b = pop(); a = pop();
                   push(PyNumber_Add(a, b));  // look up the types at run time
                   break;
  case RETURN_VALUE: return pop();
  }
}`,
        note: "The CPython virtual machine is a loop in C that fetches each instruction and dispatches on it. Every value is a heap object with a type pointer and a reference count, so a + b means: pop two pointers, find the type's add function, call it, allocate the result (ints from -5 to 256 are cached), adjust reference counts.",
      },
      {
        name: "Specialize",
        when: "run",
        artifact: `>>> dis.dis(add, adaptive=True)   # after a few calls with ints (abridged)
      ...
      BINARY_OP_ADD_INT   0 (+)
      RETURN_VALUE`,
        note: "Since 3.11 the interpreter rewrites hot instructions in place into specialized forms once it sees the same types repeatedly, and falls back if the guess stops holding. It's still interpretation, just with less checking per step. 3.13 adds an experimental JIT, off unless CPython is built with it.",
      },
    ],
  },
};

const THRESHOLD = 30;

// Plain-English definitions for the runtime jargon the stages below use.
const TERMS: [string, string][] = [
  ["Machine code (native code)", "The binary instructions a specific CPU family (x64, ARM64) executes directly."],
  ["IL (intermediate language)", "The CPU-neutral instructions Roslyn compiles C# into. It runs on any machine with the .NET runtime."],
  ["CLR", "The Common Language Runtime: the .NET engine that loads assemblies, runs the JIT and the garbage collector."],
  ["JIT (just-in-time compiler)", "Turns IL into machine code while the program runs, one method at a time, the first time each is called."],
  ["RyuJIT", "The name of .NET's JIT compiler. Native AOT reuses it as its code generator."],
  ["Stub (precode stub)", "A tiny placeholder piece of code. A method's address first points at one; the first call runs the JIT, then the stub is patched to jump straight to the compiled code."],
  ["Tier 0 / tier 1", "Two compiles of the same method: tier 0 is quick and barely optimized so the app starts fast; tier 1 is a full optimizing recompile for methods that turn out to be hot."],
  ["Hot", "Run often, so it's where the time goes and worth optimizing."],
  ["Dynamic PGO", "Profile-guided optimization at run time: tier 0 code records what actually happens (which types show up, which branches are taken) and tier 1 is optimized for that."],
  ["Inlining", "Copying a small method's body into its caller so no call happens at all."],
  ["Spill", "Copy a value from a CPU register out to memory (here, the stack) because the code doesn't keep it in a register."],
  ["On-stack replacement (OSR)", "Swapping optimized code in while a long loop is still running, instead of waiting for the next call."],
  ["ReadyToRun", "Precompiled machine code shipped inside the .dll to speed up startup; the JIT can still recompile hot methods at tier 1."],
  ["Native AOT", "Ahead-of-time compilation of the whole app to one native executable, with no JIT at run time."],
  ["Trimming", "Removing code the app can never reach, to make the output smaller."],
  ["Reflection", "Code that inspects or creates types by name while the program runs, which an ahead-of-time compiler can't always see coming."],
  ["AST (abstract syntax tree)", "A tree representing the structure of the source code, built by the parser."],
  ["Bytecode", "Compact instructions for a virtual machine (here CPython's) rather than for a real CPU."],
];

export function CompiledInterpreted() {
  const [pipe, setPipe] = useState<PipelineKey>("jit");
  const [stage, setStage] = useState(0);
  const [calls, setCalls] = useState(0);
  const p = PIPELINES[pipe];
  const st = p.stages[Math.min(stage, p.stages.length - 1)];

  const tier = calls === 0 ? "not compiled yet" : calls < THRESHOLD ? "tier 0" : calls === THRESHOLD ? "tier 0, tier 1 compiling in the background" : "tier 1";

  return (
    <div className="tool-widget">
      <details className="ci-terms">
        <summary>Terms used in this lesson</summary>
        <dl>
          {TERMS.map(([t, d]) => (
            <div key={t}>
              <dt>{t}</dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>
      </details>

      <div className="crypto-section">
        <h3>One function, three pipelines</h3>
        <div className="sql-presets">
          {(Object.keys(PIPELINES) as PipelineKey[]).map((k) => (
            <button key={k} className={pipe === k ? "active" : ""} onClick={() => { setPipe(k); setStage(0); }}>
              {PIPELINES[k].label}
            </button>
          ))}
        </div>
        <ol className="ci-stages">
          {p.stages.map((s, i) => (
            <li key={s.name}>
              <button className={`ci-stage ci-${s.when} ${i === stage ? "active" : ""}`} onClick={() => setStage(i)}>
                <span>{s.name}</span>
                <span className="cm-sub">{s.when === "build" ? "build time" : "run time"}</span>
              </button>
            </li>
          ))}
        </ol>
        <pre className="algo-code">{st.artifact}</pre>
        <p className="gate-note">{st.note}</p>
        <div className="cm-actions">
          <button disabled={stage === 0} onClick={() => setStage(stage - 1)}>
            Previous stage
          </button>
          <button disabled={stage === p.stages.length - 1} onClick={() => setStage(stage + 1)}>
            Next stage
          </button>
        </div>
      </div>

      <div className="crypto-section">
        <h3>Tiered compilation: call Add and watch it get faster</h3>
        <label className="cm-slider">
          Calls so far: <strong>{calls}</strong>
          <input type="range" min={0} max={60} value={calls} onChange={(e) => setCalls(Number(e.target.value))} />
        </label>
        <div className="ci-tiers" aria-hidden="true">
          {Array.from({ length: 60 }, (_, k) => (
            <span key={k} className={`ci-tick ${k < calls ? (k < THRESHOLD ? "ci-t0" : "ci-t1") : ""}`} />
          ))}
        </div>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">Code running now</span>
            <span className="readout-value">{tier}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Times the JIT ran for Add</span>
            <span className="readout-value">{calls === 0 ? 0 : calls < THRESHOLD ? 1 : 2}</span>
          </div>
        </div>
        <p className="gate-note">
          The first call pays for a tier 0 compile; calls 1 to 30 run tier 0 code while the runtime counts them; then tier 1 replaces it. (Call
          counting starts once startup activity settles, about 100 ms in, so methods only used during startup stay at tier 0.) A method with a
          long-running loop can't wait for 30 calls, so since .NET 7 on-stack replacement swaps optimized code in mid-loop. This is why
          benchmarks need a warm-up phase, and why BenchmarkDotNet runs your code many times before it starts measuring.
        </p>
      </div>

      <div className="crypto-section">
        <h3>The models side by side</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th></th>
                <th>Turned into machine code</th>
                <th>Startup</th>
                <th>Steady state</th>
                <th>Ships as</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>C, C++, Rust, Go</td><td>at build time</td><td>fastest</td><td>fast</td><td>one binary per OS and CPU</td></tr>
              <tr><td>C# with the JIT</td><td>per method, at run time, in tiers</td><td>slower (JIT work)</td><td>fast, tuned to real usage</td><td>portable IL plus a runtime</td></tr>
              <tr><td>C# Native AOT</td><td>at build time</td><td>fast</td><td>fast, no profile-guided tier</td><td>one binary per OS and CPU</td></tr>
              <tr><td>CPython</td><td>never: bytecode is interpreted</td><td>fast</td><td>slow on tight loops</td><td>source (plus .pyc caches)</td></tr>
              <tr><td>JavaScript (V8)</td><td>hot functions, by tiered JITs</td><td>fast (starts interpreting)</td><td>fast once hot</td><td>source</td></tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          So "is C# compiled or interpreted?" has the honest answer "compiled twice: to IL by Roslyn, then to native code by the JIT or by Native
          AOT". And Python is "compiled to bytecode, then interpreted". Numeric Python is fast in practice because NumPy and similar libraries
          run the heavy loops in compiled C, not in the eval loop.
        </p>
      </div>
    </div>
  );
}
