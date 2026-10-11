import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { V86 } from "v86";
import { withInlineCode } from "../../inlineCode";
import { LINUX_LESSONS, SANDBOX_RELOGIN, SANDBOX_SETUP, SANDBOX_WELCOME } from "../../linuxLessons";

// A real (tiny) Linux running in the browser: the v86 emulator boots a Linux kernel and a
// BusyBox userland built by tools/linux-image/build.sh. Nothing leaves the page, and
// "Restart machine" throws the whole computer away and boots a fresh one.
//
// The VM has two serial ports. The first is the learner's terminal (xterm.js). The second
// is a root shell the learner never sees; this component uses it to set up each lesson
// and to check the tasks, by sending a command and reading back its exit code.

const ASSETS = `${import.meta.env.BASE_URL}linux/`;
const PROMPT = "learner@academy:";

type BootState = "booting" | "ready" | "failed";

interface Props {
  lesson: keyof typeof LINUX_LESSONS;
}

// Runs one command at a time on the hidden root shell and resolves with its exit code.
class Checker {
  private output = "";
  private queue: Promise<unknown> = Promise.resolve();
  private counter = 0;
  private waiting: (() => void) | null = null;

  private emulator: V86;

  constructor(emulator: V86) {
    this.emulator = emulator;
    emulator.add_listener("serial1-output-byte", (byte: number) => {
      this.output += String.fromCharCode(byte);
      this.waiting?.();
    });
  }

  run(command: string, timeoutMs = 8000): Promise<number> {
    const result = this.queue.then(() => this.runNow(command, timeoutMs));
    this.queue = result.catch(() => undefined);
    return result;
  }

  private runNow(command: string, timeoutMs: number): Promise<number> {
    const marker = `__done_${++this.counter}__`;
    const pattern = new RegExp(`${marker} (\\d+)`);
    this.output = "";
    const line = `cd /home/learner; ( ${command} ) >/dev/null 2>&1 </dev/null; echo ${marker} $?\n`;
    this.emulator.serial_send_bytes(1, new TextEncoder().encode(line));

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiting = null;
        reject(new Error("The check didn't answer in time."));
      }, timeoutMs);
      this.waiting = () => {
        const match = this.output.match(pattern);
        if (!match) return;
        clearTimeout(timer);
        this.waiting = null;
        resolve(Number(match[1]));
      };
    });
  }
}

export default function LinuxLab({ lesson }: Props) {
  const content = LINUX_LESSONS[lesson];
  const terminalHost = useRef<HTMLDivElement>(null);
  const checker = useRef<Checker | null>(null);
  const typeInto = useRef<((text: string) => void) | null>(null);
  const [machine, setMachine] = useState(0); // bump to reboot
  const [boot, setBoot] = useState<BootState>("booting");
  const [done, setDone] = useState<boolean[]>(() => content.tasks.map(() => false));
  const [checking, setChecking] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [checkError, setCheckError] = useState<string | null>(null);

  const checkAll = useCallback(async () => {
    const c = checker.current;
    if (!c) return;
    setChecking(true);
    setCheckError(null);
    try {
      const results: boolean[] = [];
      for (const task of content.tasks) results.push((await c.run(task.check)) === 0);
      setDone(results);
    } catch (e) {
      setCheckError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }, [content]);

  // Boot a machine, wire it to a terminal, and tear both down on restart/unmount.
  useEffect(() => {
    const host = terminalHost.current;
    if (!host) return;
    setBoot("booting");
    setDone(content.tasks.map(() => false));
    setCheckError(null);

    const term = new Terminal({
      cols: 100,
      rows: 30,
      fontSize: 13,
      cursorBlink: true,
      theme: { background: "#111217" },
    });
    term.open(host);
    term.write("Starting the virtual machine…\r\n");

    const emulator = new V86({
      wasm_path: `${ASSETS}v86.wasm`,
      bios: { url: `${ASSETS}seabios.bin` },
      vga_bios: { url: `${ASSETS}vgabios.bin` },
      bzimage: { url: `${ASSETS}kernel.bin` },
      initrd: { url: `${ASSETS}initrd.bin` },
      cmdline: "console=ttyS0 quiet",
      memory_size: 128 * 1024 * 1024,
      uart1: true,
      autostart: true,
      disable_keyboard: true,
      disable_mouse: true,
    });
    const c = new Checker(emulator);
    let disposed = false;
    // destroy() fails if the emulator is still loading its files, so defer it until loaded.
    let loaded = false;
    emulator.add_listener("emulator-loaded", () => {
      loaded = true;
      if (disposed) emulator.destroy();
    });
    let seen = "";
    let ready = false;

    // Serial output arrives a byte at a time; batch it so the terminal redraws once a frame.
    let pending: number[] = [];
    let frame = 0;
    const flush = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      term.write(new Uint8Array(pending));
      pending = [];
    };

    // The sandbox setup changes the login profile and the welcome text, which the shell
    // already running has read. So once setup is done, end that shell and let init log
    // learner in again; its output is held back in `relogin` and shown from the welcome on,
    // in place of the boot messages.
    let relogin: string | null = null;
    let reloginTimer = 0;
    const reveal = () => {
      if (relogin === null || disposed) return;
      clearTimeout(reloginTimer);
      const start = relogin.indexOf(SANDBOX_WELCOME[0]);
      term.write("\x1b[2J\x1b[3J\x1b[H" + relogin.slice(Math.max(start, 0)));
      relogin = null;
      checker.current = c;
      typeInto.current = (text) => {
        emulator.serial0_send(text);
        term.focus();
      };
      setBoot("ready");
      term.focus();
    };
    const restartShell = () => {
      if (disposed) return;
      flush();
      relogin = "";
      reloginTimer = window.setTimeout(reveal, 15000);
      c.run(SANDBOX_RELOGIN).catch(reveal);
    };

    emulator.add_listener("serial0-output-byte", (byte: number) => {
      if (relogin !== null) {
        relogin += String.fromCharCode(byte);
        if (relogin.endsWith("$ ") && relogin.includes(SANDBOX_WELCOME[0])) reveal();
        return;
      }
      pending.push(byte);
      if (!frame) frame = requestAnimationFrame(flush);
      if (!ready) {
        seen = (seen + String.fromCharCode(byte)).slice(-64);
        if (seen.includes(PROMPT)) {
          ready = true;
          const steps = [...SANDBOX_SETUP, ...(content.setup ? [content.setup] : [])];
          steps
            .reduce<Promise<unknown>>((prev, step) => prev.then(() => c.run(step)), Promise.resolve())
            .then(restartShell, () => !disposed && setBoot("failed"));
        }
      }
    });

    // Re-check a moment after every Enter, so tasks tick off as you go.
    let recheck = 0;
    const input = term.onData((data) => {
      emulator.serial0_send(data);
      if (data.includes("\r")) {
        clearTimeout(recheck);
        recheck = window.setTimeout(() => !disposed && ready && checkAll(), 700);
      }
    });

    const giveUp = setTimeout(() => !ready && !disposed && setBoot("failed"), 60000);

    return () => {
      disposed = true;
      clearTimeout(giveUp);
      clearTimeout(recheck);
      clearTimeout(reloginTimer);
      cancelAnimationFrame(frame);
      checker.current = null;
      typeInto.current = null;
      input.dispose();
      if (loaded) emulator.destroy();
      term.dispose();
    };
  }, [machine, content, checkAll]);

  const finished = done.every(Boolean);

  return (
    <div className="tool-widget linux-lab">
      <p className="gate-note">{withInlineCode(content.intro)}</p>

      <details className="linux-panel" open>
        <summary>How this sandbox works</summary>
        <ul>
          <li>
            You're already logged in as <code>learner</code>, an ordinary user. There's no password and nothing to log in
            to: click the terminal and type.
          </li>
          <li>
            Your home folder is <code>/home/learner</code>, written <code>~</code> for short. <code>cd ~</code> (or just{" "}
            <code>cd</code>) takes you back there, and <code>pwd</code> shows where you are.
          </li>
          <li>
            You can create and change files in <code>~</code> and in <code>/tmp</code>. Everywhere else (<code>/</code>,{" "}
            <code>/etc</code>, <code>/srv</code> ...) belongs to root, the administrator account: you can look, but{" "}
            <code>mkdir</code> or saving a file there says <em>Permission denied</em>. That's Linux permissions doing their
            job, not a fault in the sandbox.
          </li>
          <li>
            If you see Permission denied, run <code>pwd</code> to see which folder you're in and <code>ls -ld .</code> to see
            who owns it. If the owner (third column) isn't learner, <code>cd ~</code> and try again there.
          </li>
          <li>
            There's no <code>sudo</code> or <code>su</code> here, and no task needs them. Type <code>sudo</code> to see what
            it does on a real server.
          </li>
          <li>Restart machine throws everything away and boots a fresh copy.</li>
          <li>
            This machine is the Linux kernel and BusyBox (both GPL-2.0) on the v86 emulator, with SeaBIOS (LGPL-3.0). Their
            licences, exact versions and where to get the source code are in the{" "}
            <a href={`${import.meta.env.BASE_URL}THIRD_PARTY_NOTICES.txt`} target="_blank" rel="noopener">
              third-party notices
            </a>
            .
          </li>
        </ul>
      </details>

      {content.concepts && (
        <details className="linux-panel" open>
          <summary>Before you start</summary>
          {content.concepts.map((text, i) => (
            <p key={i}>{withInlineCode(text)}</p>
          ))}
        </details>
      )}


      <div className="linux-terminal-frame">
        <div ref={terminalHost} className="linux-terminal" />
      </div>

      <div className="darr-actions">
        <button onClick={checkAll} disabled={boot !== "ready" || checking}>
          {checking ? "Checking…" : "Check my work"}
        </button>
        <button onClick={() => setMachine((m) => m + 1)}>Restart machine</button>
        <span className="status-text linux-status">
          {boot === "booting" && "Booting Linux…"}
          {boot === "ready" && "Running. Click the terminal to type."}
          {boot === "failed" && "The machine didn't start. Try Restart machine."}
        </span>
      </div>
      {checkError && <p className="constraint-fail">{checkError}</p>}

      <ol className="linux-tasks">
        {content.tasks.map((task, i) => (
          <li key={i} className={done[i] ? "linux-task linux-task-done" : "linux-task"}>
            <span className="auth-icon">{done[i] ? "✓" : "○"}</span>
            <div>
              <p>{task.title}</p>
              <details>
                <summary>Hint</summary>
                <p>{withInlineCode(task.hint)}</p>
                {revealed.has(i) ? (
                  <>
                    <code className="sql-snippet">{task.answer}</code>
                    <p className="linux-why">{withInlineCode(task.why)}</p>
                  </>
                ) : (
                  <button className="linux-reveal" onClick={() => setRevealed(new Set(revealed).add(i))}>
                    Show the answer
                  </button>
                )}
              </details>
            </div>
          </li>
        ))}
      </ol>

      <details className="linux-panel" open>
        <summary>Commands for this lesson</summary>
        <p className="linux-cheats-note">Click an example to type it into the terminal, then press Enter to run it.</p>
        <ul className="linux-cheats">
          {content.commands.map((c) => (
            <li key={c.cmd}>
              <code className="linux-cheat-cmd">{c.cmd}</code>
              <span className="linux-cheat-what">{withInlineCode(c.what)}</span>
              <button
                className="linux-cheat-example"
                disabled={boot !== "ready"}
                title="Type into the terminal"
                onClick={() => typeInto.current?.(c.example)}
              >
                <code>{c.example}</code>
              </button>
            </li>
          ))}
        </ul>
      </details>

      {finished && boot === "ready" && (
        <p className="constraint-ok">All done. Restart the machine any time to practise again from scratch.</p>
      )}
    </div>
  );
}
