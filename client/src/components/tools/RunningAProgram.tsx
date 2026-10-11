import { useState } from "react";
import { openLesson } from "../../api";

// A step-through of a Unix parent starting ./hello with fork and exec, in three variants
// that differ only in what the parent does afterwards: wait for it (a shell), never wait
// (a zombie), or exit first (an orphan). The child's lifecycle state is lit up on a
// small state diagram as you step.

type Scenario = "wait" | "nowait" | "orphan";
type LifeState = "new" | "ready" | "running" | "waiting" | "terminated";

interface Proc {
  pid: number;
  ppid: number;
  image: string;
  state: string;
  mem: string;
}

interface Step {
  title: string;
  detail: string;
  procs: Proc[];
  child: LifeState | null;
  term?: string;
}

const PARENT: Record<Scenario, string> = { wait: "bash", nowait: "server", orphan: "launcher" };

function buildSteps(sc: Scenario): Step[] {
  const p = PARENT[sc];
  const parent = (state: string): Proc => ({ pid: 100, ppid: 1, image: p, state, mem: `${p}'s code, heap, stack` });
  const child = (image: string, state: string, mem: string, ppid = 100): Proc => ({ pid: 101, ppid, image, state, mem });
  const parentAfterFork =
    sc === "wait" ? parent("waiting in waitpid(101)") : sc === "nowait" ? parent("running, handling other work") : null;
  const others = (c: Proc) => (parentAfterFork ? [parentAfterFork, c] : [c]);
  const childPpid = sc === "orphan" ? 1 : 100;

  const steps: Step[] = [
    {
      title: `${p} decides to run ./hello`,
      detail:
        sc === "wait"
          ? "You typed ./hello. The shell parses the line; because the name contains a slash it skips the PATH search and uses ./hello directly."
          : sc === "nowait"
            ? "A long-running server starts a helper program for each job, and (the bug) never collects its children's exit status."
            : "A small launcher program starts ./hello and then exits immediately without waiting for it.",
      procs: [parent("running")],
      child: null,
    },
    {
      title: "fork(): the process is cloned",
      detail:
        "The kernel creates PID 101 as a copy of the parent: same code, same open files, a copy of its memory. The copy is copy-on-write: both share the same physical pages, marked read-only, and a page is duplicated only when one side writes to it. fork returns 101 in the parent and 0 in the child; that's how the same code knows which side it's on.",
      procs: [parent("running, fork returned 101"), child(p, "ready, fork will return 0", `shares ${p}'s pages (copy-on-write)`)],
      child: "ready",
    },
    sc === "orphan"
      ? {
          title: "The parent exits; the child is an orphan",
          detail:
            "The launcher returns from main and exits. Its child is still alive, so the kernel re-parents it to init (PID 1), or to a process that registered itself as a subreaper. The child's PPID is now 1. Nothing about the child breaks.",
          procs: [child(p, "running", `shares ${p}'s pages (copy-on-write)`, 1)],
          child: "running",
        }
      : {
          title: sc === "wait" ? "Parent waits; child runs" : "Parent carries on; child runs",
          detail:
            sc === "wait"
              ? "The shell calls waitpid(101) and blocks: it's off the run queue, using no CPU, until the child changes state. The child gets a core. If you'd typed ./hello > out.txt, this is where the child would reopen file descriptor 1 onto out.txt, before exec."
              : "The server goes back to its own work without calling wait. The child gets a core and continues from the fork with return value 0.",
          procs: others(child(p, "running", `shares ${p}'s pages (copy-on-write)`)),
          child: "running",
        },
    {
      title: "execve(\"./hello\", argv, envp): a new program, same process",
      detail:
        "exec doesn't create a process. The kernel checks that ./hello is executable, reads its ELF header (ELF is the Executable and Linkable Format, Linux's file format for programs), discards the child's copy of the parent's memory and maps the new program's segments: code (read and execute), data (read and write) and a fresh stack with argc, argv and the environment. PID 101 is unchanged, and open file descriptors 0, 1 and 2 (the terminal) carry over.",
      procs: others(child("hello", "running", "hello's code and data, new stack", childPpid)),
      child: "running",
    },
    {
      title: "The dynamic linker runs first",
      detail:
        "hello's ELF header names an interpreter, /lib64/ld-linux-x86-64.so.2, so the kernel starts that. It maps the shared libraries hello needs (libc.so.6), resolves symbols such as printf to addresses, applies relocations and runs library initializers. A statically linked program skips this step.",
      procs: others(child("hello", "running", "hello + libc.so.6 + ld-linux", childPpid)),
      child: "running",
    },
    {
      title: "_start calls main",
      detail:
        "The dynamic linker jumps to hello's entry point, _start, which sets up the C runtime and calls main(argc, argv). Only now does the code you wrote begin. A .NET app adds layers here: the apphost loads hostfxr and coreclr, which loads your assembly and JIT-compiles Main.",
      procs: others(child("hello", "running: main()", "hello + libc.so.6 + ld-linux", childPpid)),
      child: "running",
    },
    {
      title: "printf becomes a write system call",
      detail:
        "printf formats into a user-space buffer; when the buffer is flushed, libc calls write(1, \"Hello\\n\", 6). That's a system call into the kernel, which passes the bytes to the terminal. If the terminal couldn't accept them, the child would move to waiting until it could.",
      procs: others(child("hello", "running", "hello + libc.so.6 + ld-linux", childPpid)),
      child: "running",
      term: "Hello",
    },
    {
      title: "main returns 0: exit, then zombie",
      detail:
        "The C runtime calls exit(0), which flushes stdio and makes the exit_group system call. The kernel frees the memory and closes the files, but keeps a small process-table entry holding the exit status, because the parent may still ask for it. The process is now a zombie, and the kernel sends its parent SIGCHLD.",
      procs: others(child("hello", "zombie, exit status 0", "freed", childPpid)),
      child: "terminated",
      term: "Hello",
    },
  ];

  if (sc === "wait") {
    steps.push({
      title: "The shell reaps the child",
      detail:
        "bash's waitpid(101) returns with exit status 0 and the kernel removes the zombie entry: this is reaping. PID 101 is free for reuse. bash stores the status in $? and prints the next prompt.",
      procs: [parent("running, $? = 0")],
      child: null,
      term: "Hello\n$ echo $?\n0",
    });
  } else if (sc === "nowait") {
    steps.push({
      title: "Nobody reaps it: a zombie leak",
      detail:
        "The server never calls wait, so PID 101 stays in the process table as <defunct> in ps. A zombie uses no CPU or memory, but it holds a PID; leak enough of them and fork starts failing with EAGAIN. Fixes: call waitpid (often in a SIGCHLD handler), or set SIGCHLD to SIG_IGN so the kernel reaps children automatically. Killing a zombie does nothing, because it's already dead; killing its parent works, because init adopts and reaps it.",
      procs: [parent("running, never waits"), child("hello <defunct>", "zombie, forever", "freed")],
      child: "terminated",
      term: "Hello",
    });
  } else {
    steps.push({
      title: "init reaps the orphan",
      detail:
        "The child's parent is now init, and init's job includes calling wait on every child it adopts. The zombie is removed straight away. Orphans are harmless; this is also how the classic daemon double-fork works: the intermediate parent exits on purpose so the daemon is adopted by init.",
      procs: [],
      child: null,
      term: "Hello",
    });
  }
  return steps;
}

const W = 80;
const H = 32;
const NODES: { key: LifeState; x: number; y: number }[] = [
  { key: "new", x: 0, y: 30 },
  { key: "ready", x: 140, y: 30 },
  { key: "running", x: 280, y: 30 },
  { key: "waiting", x: 140, y: 115 },
  { key: "terminated", x: 280, y: 115 },
];

// [x1, y1, x2, y2, label, labelX, labelY, anchor]
const EDGES: [number, number, number, number, string, number, number, "start" | "middle"][] = [
  [80, 46, 138, 46, "admit", 109, 40, "middle"],
  [220, 40, 278, 40, "dispatch", 250, 34, "middle"],
  [280, 54, 222, 54, "preempt", 250, 70, "middle"],
  [320, 62, 320, 113, "exit", 326, 92, "start"],
  [295, 62, 207, 113, "block", 262, 96, "start"],
  [165, 115, 165, 64, "wake", 171, 92, "start"],
];

function StateDiagram({ on }: { on: LifeState | null }) {
  return (
    <svg viewBox="0 0 362 152" className="rp-diagram" role="img" aria-label={`Process lifecycle; the child is ${on ?? "not running"}`}>
      <defs>
        <marker id="rp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" className="rp-arrow" />
        </marker>
      </defs>
      {EDGES.map(([x1, y1, x2, y2, label, lx, ly, anchor]) => (
        <g key={label}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} className="rp-edge" markerEnd="url(#rp-arrow)" />
          <text x={lx} y={ly} textAnchor={anchor} className="rp-edge-text">
            {label}
          </text>
        </g>
      ))}
      {NODES.map((n) => (
        <g key={n.key}>
          <rect x={n.x} y={n.y} width={W} height={H} rx={6} className={n.key === on ? "rp-node rp-node-on" : "rp-node"} />
          <text x={n.x + W / 2} y={n.y + H / 2 + 5} textAnchor="middle" className="cm-node-text rp-node-text">
            {n.key === "terminated" ? "zombie" : n.key}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function RunningAProgram() {
  const [sc, setSc] = useState<Scenario>("wait");
  const [i, setI] = useState(0);
  const steps = buildSteps(sc);
  const s = steps[Math.min(i, steps.length - 1)];

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Start ./hello, one system call at a time</h3>
        <div className="sql-presets">
          {(
            [
              ["wait", "Shell waits (normal)"],
              ["nowait", "Parent never waits"],
              ["orphan", "Parent exits first"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} className={sc === k ? "active" : ""} onClick={() => { setSc(k); setI(0); }}>
              {label}
            </button>
          ))}
        </div>
        <pre className="algo-code rp-code">{`pid_t pid = fork();
if (pid == 0) {                  // child
    execve("./hello", argv, envp);
    _exit(127);                  // only reached if exec failed
}
${sc === "wait" ? "waitpid(pid, &status, 0);       // parent" : sc === "nowait" ? "serve_more_requests();          // parent, never waits" : "return 0;                       // parent exits"}`}</pre>

        <div className="drill-progress">
          Step {i + 1} of {steps.length}
        </div>
        <div className="drill-feedback">
          <p>
            <strong>{s.title}</strong>
          </p>
          <p>{s.detail}</p>
        </div>
        <div className="cm-actions">
          <button disabled={i === 0} onClick={() => setI(i - 1)}>
            Back
          </button>
          <button disabled={i >= steps.length - 1} onClick={() => setI(i + 1)}>
            Next step
          </button>
          <button disabled={i === 0} onClick={() => setI(0)}>
            Restart
          </button>
        </div>

        <div className="cm-proc-pair">
          {s.procs.length === 0 && <p className="gate-note">No processes from this example remain.</p>}
          {s.procs.map((pr) => (
            <div key={pr.pid} className="cm-proc">
              <strong>
                {pr.image} (PID {pr.pid}, parent {pr.ppid})
              </strong>
              <div className="cm-shared">
                <span className={`cm-chip ${pr.state.startsWith("zombie") ? "rp-zombie" : ""}`}>{pr.state}</span>
                <span className="cm-chip">memory: {pr.mem}</span>
                {!pr.state.startsWith("zombie") && <span className="cm-chip">fds 0, 1, 2: the terminal</span>}
              </div>
            </div>
          ))}
        </div>
        {s.term && <pre className="algo-code rp-term">{s.term}</pre>}
      </div>

      <div className="crypto-section">
        <h3>The child's lifecycle</h3>
        <StateDiagram on={s.child} />
        <p className="gate-note">
          A process moves between ready and running many times as the scheduler gives it time slices, and into waiting whenever it blocks on I/O,
          a lock or a sleep. In Linux's ps output these show as R (running or ready), S or D (sleeping, i.e. waiting) and Z (zombie). What a
          process owns, and how its threads share it, is in{" "}
          <button className="link-button" onClick={() => openLesson("threads-processes")}>
            Threads vs Processes and the Scheduler
          </button>
          ; how exec's freshly mapped pages get loaded lazily on first touch (page faults) is in{" "}
          <button className="link-button" onClick={() => openLesson("memory-hierarchy")}>
            Virtual Memory, Paging and Cache Locality
          </button>
          .
        </p>
      </div>
    </div>
  );
}
