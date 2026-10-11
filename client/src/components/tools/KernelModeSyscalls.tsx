import { useState } from "react";
import { openLesson } from "../../api";

// Part 1: step through one File.ReadAllBytes call on Linux, watching the CPU mode, the
// thread's state and the counts of system calls, mode switches and context switches.
// Part 2: a "where does this run?" quiz. Part 3: syscalls vs interrupts vs exceptions.

type Mode = "user" | "kernel";

interface Step {
  mode: Mode;
  thread: "running" | "blocked" | "ready";
  title: string;
  detail: string;
  // What this step adds to the running totals: system calls, mode switches of your
  // thread (each system call is two: in and out), context switches.
  add: [number, number, number];
}

const STEPS: Step[] = [
  {
    mode: "user",
    thread: "running",
    title: "Your code calls File.ReadAllBytes(\"notes.txt\")",
    detail: "Ordinary user-mode code: .NET's FileStream code runs in your process, then calls the C library's open function. Nothing privileged has happened yet.",
    add: [0, 0, 0],
  },
  {
    mode: "kernel",
    thread: "running",
    title: "openat system call",
    detail: "The libc wrapper puts the syscall number (257 for openat on x86-64) in rax, the arguments in rdi, rsi and rdx, and executes the syscall instruction. The CPU switches to ring 0 and jumps to the kernel's single entry point. The kernel resolves the path, checks your permissions, and creates file descriptor 3.",
    add: [1, 1, 0],
  },
  {
    mode: "user",
    thread: "running",
    title: "Back in user mode with fd 3",
    detail: "sysret drops the CPU back to ring 3 with 3 in rax. .NET asks the size with fstat (another round trip) and allocates the byte[] on its own heap, which needs no kernel call.",
    add: [1, 3, 0],
  },
  {
    mode: "kernel",
    thread: "running",
    title: "read system call",
    detail: "read(3, buffer, 4096). The kernel checks that fd 3 is open in this process and that the buffer lies in this process's writable memory. The file isn't in the page cache, so the kernel asks the disk driver to fetch it.",
    add: [1, 1, 0],
  },
  {
    mode: "kernel",
    thread: "blocked",
    title: "Your thread blocks; another thread runs",
    detail: "The disk will take tens of microseconds (SSD) to milliseconds (spinning disk). The kernel marks your thread blocked, takes it off the run queue, and the scheduler switches the core to another ready thread. This is a context switch, and it costs your thread no CPU while it waits.",
    add: [0, 0, 1],
  },
  {
    mode: "kernel",
    thread: "ready",
    title: "Disk interrupt",
    detail: "The disk controller finishes the transfer (by DMA, straight into memory) and raises an interrupt. Whatever the core is running, the CPU stops after the current instruction, switches to kernel mode and runs the interrupt handler from the interrupt descriptor table. The handler marks the I/O complete and moves your thread back to ready.",
    add: [0, 0, 0],
  },
  {
    mode: "kernel",
    thread: "running",
    title: "Scheduled again, read returns",
    detail: "Later the scheduler picks your thread (another context switch). The kernel copies the bytes from the page cache into your buffer and puts the byte count in rax.",
    add: [0, 0, 1],
  },
  {
    mode: "user",
    thread: "running",
    title: "Back in user mode, then close",
    detail: "Your code has its bytes. One more round trip, close(3), releases the descriptor, and ReadAllBytes returns. A strace of a real run shows calls like these (openat, fstat, read or pread64, close), plus a few extras such as flock.",
    add: [1, 3, 0],
  },
];

type Answer = "user" | "syscall" | "trap";

const ANSWERS: { key: Answer; label: string }[] = [
  { key: "user", label: "Stays in user mode" },
  { key: "syscall", label: "System call" },
  { key: "trap", label: "Interrupt or exception" },
];

const QUIZ: { code: string; answer: Answer; why: string }[] = [
  { code: "int c = a + b;", answer: "user", why: "Arithmetic on registers is an ordinary instruction. The kernel isn't involved." },
  { code: "Console.WriteLine(\"hi\");", answer: "syscall", why: "Writing to the terminal ends in write(1, ...): only the kernel can talk to the terminal device." },
  { code: "var list = new List<int>();", answer: "user", why: "The GC hands out memory from a heap it already reserved, by bumping a pointer. It calls mmap (the system call that maps more memory into the process) only occasionally, when it needs more address space." },
  { code: "var now = DateTime.UtcNow; // on Linux", answer: "user", why: "The trick question. clock_gettime is a syscall on paper, but Linux maps it into your process through the vDSO (a small piece of kernel-provided code mapped into every process), so it reads the time without a mode switch." },
  { code: "Thread.Sleep(100);", answer: "syscall", why: "Sleeping asks the kernel to take the thread off the run queue (nanosleep, or a wait on a futex, the kernel's basic sleep-until-woken primitive). Only the scheduler can do that." },
  { code: "int x = 1 / zero; // on x64", answer: "trap", why: "The divide instruction itself faults. The CPU raises a divide-error exception, the kernel turns it into a signal, and .NET's handler turns that into DivideByZeroException. (On ARM64, division by zero doesn't fault, so the JIT emits an explicit check instead.)" },
  { code: "bigArray[4096 * 500] = 1; // first touch", answer: "trap", why: "The page was reserved but never touched, so it has no physical memory yet. The access raises a page fault; the kernel maps a zeroed page and re-runs the instruction. Your code never notices." },
  { code: "A key is pressed while your loop runs", answer: "trap", why: "That's a hardware interrupt. The keyboard controller signals the CPU, which runs the kernel's handler and then resumes your loop exactly where it was." },
  { code: "asm(\"cli\"); // disable interrupts", answer: "trap", why: "cli is privileged. In user mode the CPU raises a general protection fault instead of running it, and the kernel kills the process with SIGSEGV. That refusal is the hardware enforcing the boundary." },
];

export function KernelModeSyscalls() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<(Answer | null)[]>(() => QUIZ.map(() => null));
  const s = STEPS[step];
  const [syscalls, modeSwitches, contextSwitches] = STEPS.slice(0, step + 1).reduce(
    (t, x) => [t[0] + x.add[0], t[1] + x.add[1], t[2] + x.add[2]],
    [0, 0, 0],
  );
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.filter((p, i) => p === QUIZ[i].answer).length;

  return (
    <div className="tool-widget">
      <div className="crypto-section">
        <h3>Follow one file read across the boundary</h3>
        <pre className="algo-code">byte[] data = File.ReadAllBytes("notes.txt");</pre>
        <div className="ks-lanes" aria-label="CPU mode at each step">
          {(["user", "kernel"] as const).map((lane) => (
            <div key={lane} className="ks-lane">
              <span className="ks-lane-label">{lane === "user" ? "User mode (ring 3)" : "Kernel mode (ring 0)"}</span>
              <div className="ks-lane-cells">
                {STEPS.map((x, i) => (
                  <button
                    key={i}
                    className={`ks-cell ${x.mode === lane ? (i === step ? "ks-on" : i < step ? "ks-past" : "ks-future") : "ks-blank"}`}
                    onClick={() => setStep(i)}
                    aria-label={`Step ${i + 1}`}
                    tabIndex={x.mode === lane ? 0 : -1}
                  >
                    {x.mode === lane ? i + 1 : ""}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="cm-status-list">
          <span className={`cm-status ${s.mode === "kernel" ? "cm-status-blocked" : "cm-status-running"}`}>CPU: {s.mode} mode</span>
          <span className={`cm-status cm-status-${s.thread}`}>your thread: {s.thread}</span>
        </div>
        <div className="drill-feedback">
          <p>
            <strong>
              {step + 1}. {s.title}
            </strong>
          </p>
          <p>{s.detail}</p>
        </div>
        <div className="cm-actions">
          <button disabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </button>
          <button disabled={step === STEPS.length - 1} onClick={() => setStep(step + 1)}>
            Next step
          </button>
          <button disabled={step === 0} onClick={() => setStep(0)}>
            Restart
          </button>
        </div>
        <div className="tool-readout">
          <div className="readout-cell">
            <span className="readout-label">System calls</span>
            <span className="readout-value">{syscalls}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Mode switches (yours)</span>
            <span className="readout-value">{modeSwitches}</span>
          </div>
          <div className="readout-cell">
            <span className="readout-label">Context switches</span>
            <span className="readout-value">{contextSwitches}</span>
          </div>
        </div>
        <p className="gate-note">
          A system call is a mode switch, not a context switch: the same thread keeps running with more privilege. A context switch happens only
          when the kernel puts a different thread on the core, here because the read had to wait. That's why a server doing blocking I/O on
          thousands of threads spends so much time switching.
        </p>
      </div>

      <div className="crypto-section">
        <h3>Where does this run?</h3>
        <ol className="cm-quiz">
          {QUIZ.map((q, i) => (
            <li key={i}>
              <p>
                <code>{q.code}</code>
              </p>
              <div className="sql-presets">
                {ANSWERS.map((a) => (
                  <button
                    key={a.key}
                    className={picked[i] === a.key ? (a.key === q.answer ? "active" : "cm-wrong") : ""}
                    onClick={() => setPicked(picked.map((p, k) => (k === i ? a.key : p)))}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
              {picked[i] !== null && (
                <p className={picked[i] === q.answer ? "constraint-ok" : "constraint-fail"}>
                  {picked[i] === q.answer ? "Right. " : `Not quite: ${ANSWERS.find((a) => a.key === q.answer)!.label.toLowerCase()}. `}
                  {q.why}
                </p>
              )}
            </li>
          ))}
        </ol>
        {answered > 0 && (
          <p className="gate-note">
            {score} of {QUIZ.length} right{answered < QUIZ.length ? ` so far (${answered} answered)` : ""}.
          </p>
        )}
      </div>

      <div className="crypto-section">
        <h3>Three ways into the kernel</h3>
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th></th>
                <th>System call</th>
                <th>Interrupt</th>
                <th>Exception</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Caused by</td><td>a deliberate instruction (syscall, svc)</td><td>a device or the timer</td><td>the current instruction going wrong</td></tr>
              <tr><td>Timing</td><td>synchronous</td><td>asynchronous, any moment</td><td>synchronous</td></tr>
              <tr><td>Examples</td><td>read, write, mmap, fork</td><td>packet arrived, disk done, timer tick</td><td>page fault, divide by zero, invalid opcode</td></tr>
              <tr><td>Afterwards</td><td>returns to the next instruction</td><td>resumes whatever was interrupted</td><td>re-runs the instruction (page fault) or kills/signals the process</td></tr>
            </tbody>
          </table>
        </div>
        <p className="gate-note">
          The timer interrupt is what makes preemptive scheduling possible: even a thread stuck in <code>while (true) {"{}"}</code> loses the CPU
          when its time slice ends. How page faults and the TLB work is in{" "}
          <button className="link-button" onClick={() => openLesson("memory-hierarchy")}>
            Virtual Memory, Paging and Cache Locality
          </button>
          , and how the scheduler uses the time slice is in{" "}
          <button className="link-button" onClick={() => openLesson("threads-processes")}>
            Threads vs Processes and the Scheduler
          </button>
          .
        </p>
      </div>
    </div>
  );
}
