import { useState } from "react";
import { openLesson } from "../../api";

// A small model of a GNU-style static link. Inputs are processed in command-line order:
// object files are always included; an archive (.a) contributes only the members that
// define a symbol that is undefined at the moment the archive is scanned; a shared
// library (.so) satisfies references but is bound at load time, not copied in.

interface ObjFile {
  name: string;
  source: string;
  defines: string[];
  needs: string[];
}

const MAIN: ObjFile = {
  name: "main.o",
  source: `#include <stdio.h>
int parse_args(int, char**);   // declared, not defined here
int compute(int);
int main(int argc, char** argv) {
    int n = parse_args(argc, argv);
    printf("%d\\n", compute(n));
}`,
  defines: ["main"],
  needs: ["parse_args", "compute", "printf"],
};
const ARGS: ObjFile = {
  name: "args.o",
  source: `#include <string.h>
int parse_args(int argc, char** argv) {
    return argc > 1 ? (int)strlen(argv[1]) : 0;
}`,
  defines: ["parse_args"],
  needs: ["strlen"],
};
const COMPUTE: ObjFile = {
  name: "compute.o",
  source: `int square(int x) { return x * x; }
int compute(int n) { return square(n) + 1; }`,
  defines: ["compute", "square"],
  needs: [],
};
const helpers = (isStatic: boolean): ObjFile => ({
  name: "helpers.o",
  source: `${isStatic ? "static " : ""}int square(int x) { return x * x; }  // copy-pasted
int clamp(int x, int lo, int hi) { ... }`,
  defines: isStatic ? ["clamp"] : ["square", "clamp"],
  needs: [],
});
const LIBC_EXPORTS = ["printf", "strlen"];

type ArgsMode = "obj" | "libAfter" | "libBefore" | "missing";
type LibcMode = "shared" | "static" | "none";

type Input =
  | { kind: "obj"; file: ObjFile }
  | { kind: "archive"; name: string; members: ObjFile[] }
  | { kind: "shared"; name: string; exports: string[] };

interface Resolution {
  sym: string;
  from: string;
  how: "copied in" | "pulled from archive" | "bound at load time";
  users: string[];
}

function link(inputs: Input[]) {
  const defined = new Map<string, Resolution>();
  const undefinedSyms: string[] = [];
  const users = new Map<string, string[]>();
  const errors: string[] = [];
  const firstUse = new Map<string, string>();

  const addObj = (f: ObjFile, how: Resolution["how"], from: string) => {
    for (const d of f.defines) {
      const prev = defined.get(d);
      if (prev && prev.how !== "bound at load time") {
        errors.push(`/usr/bin/ld: ${f.name}: multiple definition of \`${d}'; ${prev.from}: first defined here`);
        continue;
      }
      defined.set(d, { sym: d, from, how, users: [] });
      const k = undefinedSyms.indexOf(d);
      if (k >= 0) undefinedSyms.splice(k, 1);
    }
    for (const n of f.needs) {
      users.set(n, [...(users.get(n) ?? []), f.name]);
      if (!firstUse.has(n)) firstUse.set(n, `${f.name}: in function \`${f.defines[0]}'`);
      if (!defined.has(n) && !undefinedSyms.includes(n)) undefinedSyms.push(n);
    }
  };

  for (const inp of inputs) {
    if (inp.kind === "obj") addObj(inp.file, "copied in", inp.file.name);
    else if (inp.kind === "archive") {
      let pulled = true;
      const used = new Set<string>();
      while (pulled) {
        pulled = false;
        for (const m of inp.members) {
          if (used.has(m.name) || !m.defines.some((d) => undefinedSyms.includes(d))) continue;
          used.add(m.name);
          addObj(m, "pulled from archive", `${inp.name}(${m.name})`);
          pulled = true;
        }
      }
    } else {
      for (const e of inp.exports) {
        if (undefinedSyms.includes(e)) {
          defined.set(e, { sym: e, from: inp.name, how: "bound at load time", users: [] });
          undefinedSyms.splice(undefinedSyms.indexOf(e), 1);
        }
      }
    }
  }
  for (const u of undefinedSyms) {
    errors.push(`/usr/bin/ld: ${firstUse.get(u)}: undefined reference to \`${u}'`);
  }
  const table = [...defined.values()].map((r) => ({ ...r, users: users.get(r.sym) ?? [] }));
  return { table, errors, undefinedSyms };
}

export function LinkersLibraries() {
  const [argsMode, setArgsMode] = useState<ArgsMode>("obj");
  const [withCompute, setWithCompute] = useState(true);
  const [withHelpers, setWithHelpers] = useState(false);
  const [helpersStatic, setHelpersStatic] = useState(false);
  const [libc, setLibc] = useState<LibcMode>("shared");
  const [showSource, setShowSource] = useState<string | null>(null);

  const libargs: Input = { kind: "archive", name: "libargs.a", members: [ARGS] };
  const inputs: Input[] = [];
  if (argsMode === "libBefore") inputs.push(libargs);
  inputs.push({ kind: "obj", file: MAIN });
  if (argsMode === "obj") inputs.push({ kind: "obj", file: ARGS });
  if (withCompute) inputs.push({ kind: "obj", file: COMPUTE });
  if (withHelpers) inputs.push({ kind: "obj", file: helpers(helpersStatic) });
  if (argsMode === "libAfter") inputs.push(libargs);
  if (libc === "shared") inputs.push({ kind: "shared", name: "libc.so.6", exports: LIBC_EXPORTS });
  if (libc === "static")
    inputs.push({
      kind: "archive",
      name: "libc.a",
      members: LIBC_EXPORTS.map((e) => ({ name: `${e}.o`, source: "", defines: [e], needs: [] })),
    });

  const result = link(inputs);
  const ok = result.errors.length === 0;
  const cmd =
    "gcc " +
    inputs
      .filter((i) => !(i.kind === "shared" || (i.kind === "archive" && i.name === "libc.a")))
      .map((i) => (i.kind === "obj" ? i.file.name : i.name))
      .join(" ") +
    (libc === "static" ? " -static" : libc === "none" ? " -nostdlib" : "") +
    " -o app";

  const files = [MAIN, ARGS, COMPUTE, helpers(helpersStatic)];

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>The object files</h3>
        <p className="gate-note">Each was compiled on its own. Click one to see its source. Defines and needs come from its symbol table (what nm prints).</p>
        <div className="ll-objs">
          {files.map((f) => (
            <button key={f.name} className={`ll-obj ${showSource === f.name ? "active" : ""}`} onClick={() => setShowSource(showSource === f.name ? null : f.name)}>
              <strong>{f.name}</strong>
              <span className="cm-sub">defines: {f.defines.join(", ")}</span>
              <span className="cm-sub">needs: {f.needs.length ? f.needs.join(", ") : "nothing"}</span>
            </button>
          ))}
        </div>
        {showSource && <pre className="algo-code">{files.find((f) => f.name === showSource)!.source}</pre>}
      </div>

      <div className="crypto-section">
        <h3>Build the link command</h3>
        <div className="ll-option">
          <span>Where parse_args comes from</span>
          <div className="sql-presets">
            {(
              [
                ["obj", "args.o"],
                ["libAfter", "libargs.a, after main.o"],
                ["libBefore", "libargs.a, before main.o"],
                ["missing", "forgot it"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} className={argsMode === k ? "active" : ""} onClick={() => setArgsMode(k)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="ll-option">
          <span>Other objects</span>
          <div className="sql-presets">
            <button className={withCompute ? "active" : ""} onClick={() => setWithCompute(!withCompute)}>
              compute.o
            </button>
            <button className={withHelpers ? "active" : ""} onClick={() => setWithHelpers(!withHelpers)}>
              helpers.o
            </button>
            {withHelpers && (
              <button className={helpersStatic ? "active" : ""} onClick={() => setHelpersStatic(!helpersStatic)}>
                make helpers.o's square static
              </button>
            )}
          </div>
        </div>
        <div className="ll-option">
          <span>The C library</span>
          <div className="sql-presets">
            {(
              [
                ["shared", "shared libc.so.6"],
                ["static", "static libc.a"],
                ["none", "none (-nostdlib)"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} className={libc === k ? "active" : ""} onClick={() => setLibc(k)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <pre className="algo-code">$ {cmd}</pre>

        {ok ? (
          <p className="constraint-ok">Linked: every reference matched exactly one definition.</p>
        ) : (
          <pre className="algo-code ll-errors">
            {result.errors.join("\n")}
            {"\ncollect2: error: ld returned 1 exit status"}
          </pre>
        )}

        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Defined in</th>
                <th>How</th>
                <th>Used by</th>
              </tr>
            </thead>
            <tbody>
              {result.table.map((r) => (
                <tr key={r.sym}>
                  <td className="mono">{r.sym}</td>
                  <td>{r.from}</td>
                  <td>{r.how}</td>
                  <td>{r.users.length ? r.users.join(", ") : "nobody"}</td>
                </tr>
              ))}
              {result.undefinedSyms.map((u) => (
                <tr key={u} className="ll-missing">
                  <td className="mono">{u}</td>
                  <td colSpan={3}>no definition found</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="gate-note">
          {argsMode === "libBefore" &&
            "GNU ld scans inputs once, left to right. When it reached libargs.a nothing was undefined yet, so it pulled no members, and by the time main.o asked for parse_args the archive was behind it. Put libraries after the objects that use them. "}
          {argsMode === "libAfter" && "Only args.o is pulled out of libargs.a, and only because main.o had an unresolved parse_args when the linker got there. "}
          {withHelpers && !helpersStatic && "Two files define a global square, and the linker refuses to guess which one you meant. Making one static gives it internal linkage, so it's private to its file. "}
          {libc === "none" && "printf and strlen live in the C library; without it, nothing defines them. "}
          {ok && libc === "shared" && "printf and strlen aren't in the file: the executable records NEEDED libc.so.6 and calls them through the PLT (procedure linkage table, a table of small jump stubs the dynamic linker fills in). ld-linux binds them when the program starts or on first call. ldd app lists what will be loaded. A typical binary like this is about 16 KB."}
          {ok && libc === "static" && "Only the members of libc.a that resolve something (here printf.o and strlen.o, plus what they need in real life) are copied in. The result has no runtime dependencies but is far larger: a static glibc hello world is several hundred KB."}
        </p>
      </div>

      <div className="crypto-section">
        <h3>Static vs shared libraries</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th></th>
                <th>Static (.a, .lib)</th>
                <th>Shared (.so, .dll, .dylib)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Bound</td><td>at link time, code copied in</td><td>at load time or first call</td></tr>
              <tr><td>Deploy</td><td>one self-contained file</td><td>library must be present and compatible</td></tr>
              <tr><td>Memory</td><td>each program has its own copy</td><td>one copy shared by every process</td></tr>
              <tr><td>Security fix</td><td>relink and redeploy every program</td><td>update the library once</td></tr>
              <tr><td>Typical failure</td><td>undefined reference at build</td><td>"cannot open shared object file" at startup</td></tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          Go (without cgo) and Rust (for its own crates; on glibc targets libc stays dynamic unless you use musl) link most code statically by default, which is why their binaries copy easily into minimal containers. The step where the dynamic
          linker actually runs is part of{" "}
          <button className="link-button" onClick={() => openLesson("running-a-program")}>
            What Happens When You Run a Program
          </button>
          .
        </p>
      </div>
    </div>
  );
}
