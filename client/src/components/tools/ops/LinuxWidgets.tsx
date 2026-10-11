import { useMemo, useState } from "react";
import { describe, formatRun, nextRuns, parseCron } from "./cron";

// Simulators for the Linux administration lessons. The shell-behaviour widgets replay
// output captured from real bash 5.2 runs; systemd, apt, ssh and the disk incident are
// small state machines that follow the real tools' messages.

// ---- Quoting and word splitting -------------------------------------------------------

type SplitForm = "unquoted" | "double" | "single";

function splitWords(value: string): string[] {
  return value.split(/[ \t\n]+/).filter((w) => w !== "");
}

export function WordSplitting() {
  const [value, setValue] = useState("quarterly report.txt");
  const forms: { id: SplitForm; code: string; args: string[]; note: string }[] = [
    {
      id: "unquoted",
      code: "printf '[%s]\\n' $file",
      args: splitWords(value),
      note: "Unquoted: the shell splits the value on spaces, tabs and newlines, and would also expand any * or ? as a filename pattern. An empty value disappears entirely.",
    },
    {
      id: "double",
      code: "printf '[%s]\\n' \"$file\"",
      args: [value],
      note: "Double quotes: the variable is expanded, and the result stays exactly one argument, spaces and all. This is what you want almost every time.",
    },
    {
      id: "single",
      code: "printf '[%s]\\n' '$file'",
      args: ["$file"],
      note: "Single quotes: nothing inside is expanded. You get the literal characters $file.",
    },
  ];
  const hasGlob = /[*?[]/.test(value);
  return (
    <div className="ops-split">
      <label className="ops-field">
        <span>
          file=<code>"…"</code>
        </span>
        <input className="lt-search" value={value} onChange={(e) => setValue(e.target.value)} aria-label="Value of the file variable" />
      </label>
      <div className="ops-split-grid">
        {forms.map((f) => (
          <div key={f.id} className="ops-card">
            <code className="ops-card-code">{f.code}</code>
            <div className="ops-argcount">
              {f.args.length} argument{f.args.length === 1 ? "" : "s"}
            </div>
            <div className="ops-args">
              {f.args.length === 0 ? <span className="ops-arg ops-arg-none">(none)</span> : f.args.map((a, i) => <span key={i} className="ops-arg">{a}</span>)}
            </div>
            <p className="gate-note">{f.note}</p>
          </div>
        ))}
      </div>
      {hasGlob && (
        <p className="constraint-fail">
          Your value contains a wildcard character. Unquoted, bash would also try to match it against filenames in the current folder and replace it with
          whatever matches, which this widget doesn't show. One more reason to quote.
        </p>
      )}
      <p className="gate-note">
        Try two spaces in a row, a leading space, or an empty value. Same rules for <code>$@</code>: <code>"$@"</code> keeps every argument as it was passed,
        while <code>$@</code> and <code>$*</code> unquoted split them again, and <code>"$*"</code> glues them into one.
      </p>
    </div>
  );
}

// ---- set -euo pipefail --------------------------------------------------------------------

const STRICT_BODY = `echo "start"
grep ERROR missing.log | sort
echo "pipeline status: $?"
cp /etc/nope.conf /tmp/
echo "copied config"
echo "deploying to $TARGET_DIR/app"
echo "done"`;

// Captured with bash 5.2.21 on Ubuntu 24.04: `bash deploy.sh 2>&1; echo $?` for each mix.
const STRICT_RUNS: Record<string, { out: string; code: number }> = {
  "000": {
    out: "start\ngrep: missing.log: No such file or directory\npipeline status: 0\ncp: cannot stat '/etc/nope.conf': No such file or directory\ncopied config\ndeploying to /app\ndone",
    code: 0,
  },
  "001": {
    out: "start\ngrep: missing.log: No such file or directory\npipeline status: 2\ncp: cannot stat '/etc/nope.conf': No such file or directory\ncopied config\ndeploying to /app\ndone",
    code: 0,
  },
  "010": {
    out: "start\ngrep: missing.log: No such file or directory\npipeline status: 0\ncp: cannot stat '/etc/nope.conf': No such file or directory\ncopied config\ndeploy.sh: line 8: TARGET_DIR: unbound variable",
    code: 1,
  },
  "011": {
    out: "start\ngrep: missing.log: No such file or directory\npipeline status: 2\ncp: cannot stat '/etc/nope.conf': No such file or directory\ncopied config\ndeploy.sh: line 8: TARGET_DIR: unbound variable",
    code: 1,
  },
  "100": { out: "start\ngrep: missing.log: No such file or directory\npipeline status: 0\ncp: cannot stat '/etc/nope.conf': No such file or directory", code: 1 },
  "101": { out: "start\ngrep: missing.log: No such file or directory", code: 2 },
  "110": { out: "start\ngrep: missing.log: No such file or directory\npipeline status: 0\ncp: cannot stat '/etc/nope.conf': No such file or directory", code: 1 },
  "111": { out: "start\ngrep: missing.log: No such file or directory", code: 2 },
};

export function StrictMode() {
  const [e, setE] = useState(false);
  const [u, setU] = useState(false);
  const [p, setP] = useState(false);
  const opts = `${e ? " -e" : ""}${u ? " -u" : ""}${p ? " -o pipefail" : ""}`;
  const script = `#!/usr/bin/env bash\n${opts ? `set${opts}\n` : ""}${STRICT_BODY}`;
  const run = STRICT_RUNS[`${+e}${+u}${+p}`];
  const explain = !e && !u && !p
    ? "With no options, bash shrugs at every failure: the pipeline reports sort's success, the copy fails and the script carries on, and an unset variable quietly becomes empty, so it would deploy to /app. Exit status 0: whatever ran this thinks it worked."
    : run.code === 2
      ? "-e plus pipefail: the pipeline's status is now grep's 2 (file not found), so -e stops the script right there with that status."
      : e
        ? "-e stops at the first failing command. Without pipefail a pipeline only reports its last command (sort, which succeeded), so the script gets past the grep and stops at cp."
        : u
          ? "Without -e the failures are still ignored, but -u refuses to expand an unset variable: the script stops before it can deploy to the wrong place."
          : "pipefail alone changes what $? says about the pipeline (2, from grep), but without -e nothing acts on it.";
  return (
    <div>
      <div className="lt-toggle ops-toggles" role="group" aria-label="Shell options">
        <button className={e ? "active" : ""} aria-pressed={e} onClick={() => setE(!e)}>
          -e (exit on error)
        </button>
        <button className={u ? "active" : ""} aria-pressed={u} onClick={() => setU(!u)}>
          -u (unset is an error)
        </button>
        <button className={p ? "active" : ""} aria-pressed={p} onClick={() => setP(!p)}>
          -o pipefail
        </button>
      </div>
      <div className="lt-pair">
        <div className="lt-pane">
          <div className="lt-pane-head">
            <span className="lt-lang">deploy.sh</span>
          </div>
          <pre className="algo-code lt-code">{script}</pre>
        </div>
        <div className="lt-pane">
          <div className="lt-pane-head">
            <span className="lt-lang">bash deploy.sh</span>
          </div>
          <pre className="algo-code lt-code ops-output">
            {run.out}
            {"\n"}
            <span className={run.code === 0 ? "ops-ok" : "ops-bad"}>[exit status {run.code}]</span>
          </pre>
        </div>
      </div>
      <p className="lt-p">{explain}</p>
    </div>
  );
}

// ---- Text processing toolbox ------------------------------------------------------------

const SERVERS_CSV = `host,site,role,cpu,status
web01,oslo,web,34,up
web02,oslo,web,91,up
db01,oslo,database,67,up
web03,bergen,web,12,down
db02,bergen,database,88,up
plc-gw01,bergen,gateway,5,up
web04,stavanger,web,45,maintenance`;

// Every output below was produced by running the command against servers.csv in bash
// on Ubuntu 24.04 (GNU grep, sed, coreutils; awk is mawk).
const TOOLBOX: { tool: string; cmd: string; out: string; why: string }[] = [
  { tool: "grep", cmd: "grep web servers.csv", out: "web01,oslo,web,34,up\nweb02,oslo,web,91,up\nweb03,bergen,web,12,down\nweb04,stavanger,web,45,maintenance", why: "Prints every line containing the pattern anywhere, not just in the role column." },
  { tool: "grep", cmd: "grep -v ',up$' servers.csv", out: "host,site,role,cpu,status\nweb03,bergen,web,12,down\nweb04,stavanger,web,45,maintenance", why: "-v inverts the match. $ anchors the pattern to the end of the line. The header line doesn't end in ,up either, so it comes along." },
  { tool: "grep", cmd: "grep -c oslo servers.csv", out: "3", why: "-c counts matching lines instead of printing them." },
  { tool: "grep", cmd: "grep -E '^(db|plc)' servers.csv", out: "db01,oslo,database,67,up\ndb02,bergen,database,88,up\nplc-gw01,bergen,gateway,5,up", why: "-E turns on extended regular expressions, so | means \"or\" and the brackets group. ^ anchors to the start of the line." },
  { tool: "cut", cmd: "cut -d, -f1,5 servers.csv", out: "host,status\nweb01,up\nweb02,up\ndb01,up\nweb03,down\ndb02,up\nplc-gw01,up\nweb04,maintenance", why: "-d sets the delimiter (a comma), -f picks fields by number. Fine for simple CSV; it doesn't understand quoted commas." },
  { tool: "sort / uniq", cmd: "tail -n +2 servers.csv | cut -d, -f2 | sort | uniq -c", out: "      3 bergen\n      3 oslo\n      1 stavanger", why: "tail -n +2 skips the header. uniq only merges neighbouring duplicates, which is why sort comes first. -c prefixes each with its count." },
  { tool: "sort", cmd: "tail -n +2 servers.csv | sort -t, -k4 -n -r | head -3", out: "web02,oslo,web,91,up\ndb02,bergen,database,88,up\ndb01,oslo,database,67,up", why: "-t, splits on commas, -k4 sorts by the 4th field, -n compares as numbers (so 9 comes before 34), -r reverses. The three busiest hosts." },
  { tool: "sed", cmd: "sed 's/oslo/OSL/' servers.csv | head -3", out: "host,site,role,cpu,status\nweb01,OSL,web,34,up\nweb02,OSL,web,91,up", why: "s/old/new/ replaces the first match on each line. Add g at the end (s/old/new/g) for every match. The file itself is untouched; sed -i would edit it in place." },
  { tool: "sed", cmd: "sed -n '2,3p' servers.csv", out: "web01,oslo,web,34,up\nweb02,oslo,web,91,up", why: "-n stops sed printing every line; 2,3p prints just lines 2 to 3." },
  { tool: "sed", cmd: "sed '1d; s/,/ | /g' servers.csv | head -2", out: "web01 | oslo | web | 34 | up\nweb02 | oslo | web | 91 | up", why: "Two commands separated by ;. 1d deletes line 1, then every comma becomes \" | \" thanks to g." },
  { tool: "awk", cmd: "awk -F, 'NR > 1 && $4 > 60 { print $1, $4 \"%\" }' servers.csv", out: "web02 91%\ndb01 67%\ndb02 88%", why: "awk runs the { action } on every line where the condition is true. -F, splits on commas, $4 is field 4, NR is the line number. Comparisons are numeric when both sides look like numbers." },
  { tool: "awk", cmd: "awk -F, 'NR > 1 { total[$2] += $4; n[$2]++ } END { for (s in total) print s, total[s] / n[s] }' servers.csv | sort", out: "bergen 35\noslo 64\nstavanger 45", why: "Average CPU per site. awk arrays are keyed by any string; END runs once after the last line. for (s in total) has no fixed order, hence the sort." },
  { tool: "tr", cmd: "tail -n +2 servers.csv | cut -d, -f1 | tr '\\n' ' '; echo", out: "web01 web02 db01 web03 db02 plc-gw01 web04 ", why: "tr translates characters: here every newline becomes a space, turning a column into one line. The echo adds the final newline back." },
  { tool: "xargs", cmd: "grep ',down$' servers.csv | cut -d, -f1 | xargs -I{} echo ssh {} sudo systemctl restart nginx", out: "ssh web03 sudo systemctl restart nginx", why: "xargs turns lines of input into arguments for another command. -I{} runs the command once per line with {} replaced. The echo makes it a dry run: remove it to really do it." },
  { tool: "xargs", cmd: "printf '%s\\n' a.log b.log | xargs echo rm", out: "rm a.log b.log", why: "Without -I, xargs packs as many inputs as fit onto one command line. With file names that may contain spaces, use find -print0 | xargs -0 instead." },
];

export function TextToolbox() {
  const [i, setI] = useState(0);
  const tools = [...new Set(TOOLBOX.map((t) => t.tool))];
  const pick = TOOLBOX[i];
  return (
    <div>
      <details className="ops-details">
        <summary>servers.csv (the input for every command)</summary>
        <pre className="algo-code lt-code">{SERVERS_CSV}</pre>
      </details>
      {tools.map((tool) => (
        <div key={tool} className="ops-tool-row">
          <span className="ops-tool-name">{tool}</span>
          <div className="sql-presets">
            {TOOLBOX.map((t, j) =>
              t.tool === tool ? (
                <button key={j} className={j === i ? "active" : ""} onClick={() => setI(j)}>
                  <code>{t.cmd.length > 46 ? `${t.cmd.slice(0, 44)}…` : t.cmd}</code>
                </button>
              ) : null,
            )}
          </div>
        </div>
      ))}
      <pre className="algo-code lt-code">$ {pick.cmd}</pre>
      <pre className="algo-code lt-code ops-output">{pick.out}</pre>
      <p className="lt-p">{pick.why}</p>
    </div>
  );
}

// ---- systemd service ----------------------------------------------------------------------

type Restart = "no" | "on-failure" | "always";
type Active = "inactive" | "active" | "failed";

interface SvcState {
  enabled: boolean;
  active: Active;
  result: string;
  since: string;
  pid: number;
  restartLoaded: Restart; // what systemd is using
  restartOnDisk: Restart; // what the file says
  restarts: number;
  clock: number; // seconds after 09:00:00
  journal: string[];
  console: string[];
  boot: number;
}

const UNIT = "academy-api.service";
const DESC = "Academy API";

function clockText(s: number) {
  const h = 9 + Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function initialSvc(): SvcState {
  return {
    enabled: false,
    active: "inactive",
    result: "",
    since: "",
    pid: 0,
    restartLoaded: "no",
    restartOnDisk: "no",
    restarts: 0,
    clock: 0,
    journal: [],
    console: [],
    boot: 1,
  };
}

function svcReducer(s: SvcState, action: string, arg?: Restart): SvcState {
  const n: SvcState = { ...s, journal: [...s.journal], console: [] };
  const log = (who: string, msg: string) => {
    n.clock += 1;
    n.journal.push(`Oct 12 ${clockText(n.clock)} web01 ${who}: ${msg}`);
  };
  const sd = (msg: string) => log("systemd[1]", msg);
  const start = () => {
    n.pid = 2000 + Math.floor(n.clock * 7) + n.restarts * 13;
    sd(`Started ${UNIT} - ${DESC}.`);
    log(`dotnet[${n.pid}]`, "Now listening on: http://0.0.0.0:8080");
    n.active = "active";
    n.result = "";
    n.since = clockText(n.clock);
  };
  const died = (how: "failure" | "signal" | "clean") => {
    if (how === "failure") {
      log(`dotnet[${n.pid}]`, "Unhandled exception. System.InvalidOperationException: database unreachable");
      sd(`${UNIT}: Main process exited, code=exited, status=1/FAILURE`);
      sd(`${UNIT}: Failed with result 'exit-code'.`);
    } else if (how === "signal") {
      sd(`${UNIT}: Main process exited, code=killed, status=9/KILL`);
      sd(`${UNIT}: Failed with result 'signal'.`);
    } else {
      sd(`${UNIT}: Deactivated successfully.`);
    }
    const restart = n.restartLoaded === "always" || (n.restartLoaded === "on-failure" && how !== "clean");
    if (restart) {
      n.restarts += 1;
      n.clock += 4;
      sd(`${UNIT}: Scheduled restart job, restart counter is at ${n.restarts}.`);
      start();
    } else {
      n.active = how === "clean" ? "inactive" : "failed";
      n.result = how === "failure" ? "exit-code" : how === "signal" ? "signal" : "";
      n.since = clockText(n.clock);
    }
  };
  const stop = () => {
    sd(`Stopping ${UNIT} - ${DESC}...`);
    sd(`${UNIT}: Deactivated successfully.`);
    sd(`Stopped ${UNIT} - ${DESC}.`);
    n.active = "inactive";
    n.result = "";
    n.since = clockText(n.clock);
  };
  const running = s.active === "active";
  switch (action) {
    case "start":
      n.console.push(`$ sudo systemctl start ${UNIT}`);
      if (!running) start();
      else n.console.push("(already running: start does nothing, and prints nothing)");
      break;
    case "stop":
      n.console.push(`$ sudo systemctl stop ${UNIT}`);
      if (running) stop();
      else n.console.push("(not running: nothing to do)");
      break;
    case "restart":
      n.console.push(`$ sudo systemctl restart ${UNIT}`);
      if (running) stop();
      start();
      break;
    case "enable":
      n.console.push(`$ sudo systemctl enable ${UNIT}`);
      if (!s.enabled) n.console.push(`Created symlink /etc/systemd/system/multi-user.target.wants/${UNIT} → /etc/systemd/system/${UNIT}.`);
      n.enabled = true;
      break;
    case "disable":
      n.console.push(`$ sudo systemctl disable ${UNIT}`);
      if (s.enabled) n.console.push(`Removed "/etc/systemd/system/multi-user.target.wants/${UNIT}".`);
      n.enabled = false;
      break;
    case "crash":
      n.console.push("(the app hits an unhandled exception and exits with status 1)");
      if (running) died("failure");
      else n.console.push("(it isn't running, so nothing happens)");
      break;
    case "kill":
      n.console.push(`$ sudo kill -9 ${s.pid || "PID"}`);
      if (running) died("signal");
      else n.console.push("(it isn't running, so there's nothing to kill)");
      break;
    case "exit0":
      n.console.push("(the app finishes its work and exits with status 0)");
      if (running) died("clean");
      else n.console.push("(it isn't running, so nothing happens)");
      break;
    case "edit":
      n.restartOnDisk = arg ?? "no";
      n.console.push(`$ sudo systemctl edit --full ${UNIT}   (set Restart=${n.restartOnDisk})`);
      break;
    case "reload":
      n.console.push("$ sudo systemctl daemon-reload");
      n.restartLoaded = n.restartOnDisk;
      break;
    case "reboot":
      n.console.push("$ sudo reboot");
      n.boot += 1;
      n.restartLoaded = n.restartOnDisk; // a fresh boot reads every unit file
      n.journal.push(`-- Boot ${["5d2c", "a91e", "07bf", "c3d8", "e6a4"][n.boot % 5]}… --`);
      n.clock += 60;
      n.restarts = 0;
      n.active = "inactive";
      n.result = "";
      n.since = clockText(n.clock);
      if (n.enabled) start();
      break;
  }
  n.journal = n.journal.slice(-14);
  return n;
}

export function SystemdService() {
  const [s, setS] = useState<SvcState>(initialSvc);
  const act = (a: string, arg?: Restart) => setS((cur) => svcReducer(cur, a, arg));
  const stale = s.restartLoaded !== s.restartOnDisk;
  const activeLine =
    s.active === "active"
      ? `active (running) since Mon 2026-10-12 ${s.since} UTC`
      : s.active === "failed"
        ? `failed (Result: ${s.result}) since Mon 2026-10-12 ${s.since} UTC`
        : "inactive (dead)" + (s.since ? ` since Mon 2026-10-12 ${s.since} UTC` : "");
  const unitFile = `[Unit]
Description=${DESC}
After=network-online.target
Wants=network-online.target

[Service]
User=academy
WorkingDirectory=/opt/academy
ExecStart=/usr/bin/dotnet /opt/academy/Server.dll
Restart=${s.restartOnDisk}
RestartSec=3

[Install]
WantedBy=multi-user.target`;
  return (
    <div>
      <div className="lt-pair">
        <div className="lt-pane">
          <div className="lt-pane-head">
            <span className="lt-lang">/etc/systemd/system/{UNIT}</span>
          </div>
          <pre className="algo-code lt-code">{unitFile}</pre>
          <div className="sql-presets" role="group" aria-label="Restart policy in the file">
            {(["no", "on-failure", "always"] as Restart[]).map((r) => (
              <button key={r} className={s.restartOnDisk === r ? "active" : ""} onClick={() => act("edit", r)}>
                Restart={r}
              </button>
            ))}
          </div>
        </div>
        <div className="lt-pane">
          <div className="lt-pane-head">
            <span className="lt-lang">systemctl status {UNIT}</span>
          </div>
          <pre className="algo-code lt-code ops-output">
            {stale && (
              <span className="ops-warn">
                {`Warning: The unit file, source configuration file or drop-ins of ${UNIT} changed on disk. Run 'systemctl daemon-reload' to reload units.\n`}
              </span>
            )}
            <span className={s.active === "active" ? "ops-ok" : s.active === "failed" ? "ops-bad" : ""}>●</span>
            {` ${UNIT} - ${DESC}
     Loaded: loaded (/etc/systemd/system/${UNIT}; ${s.enabled ? "enabled" : "disabled"}; preset: enabled)
     Active: ${activeLine}`}
            {s.active === "active" ? `\n   Main PID: ${s.pid} (dotnet)` : ""}
          </pre>
          <p className="gate-note">
            Restart policy systemd is using: <strong>{s.restartLoaded}</strong>
            {stale && " (the file says something else until daemon-reload)"}
          </p>
        </div>
      </div>
      <div className="ops-button-groups">
        <div className="sql-presets">
          <span className="ops-group-label">systemctl</span>
          <button onClick={() => act("start")}>start</button>
          <button onClick={() => act("stop")}>stop</button>
          <button onClick={() => act("restart")}>restart</button>
          <button onClick={() => act("enable")}>enable</button>
          <button onClick={() => act("disable")}>disable</button>
          <button onClick={() => act("reload")}>daemon-reload</button>
        </div>
        <div className="sql-presets">
          <span className="ops-group-label">things happen</span>
          <button onClick={() => act("crash")}>app crashes (exit 1)</button>
          <button onClick={() => act("exit0")}>app exits cleanly (exit 0)</button>
          <button onClick={() => act("kill")}>kill -9</button>
          <button onClick={() => act("reboot")}>reboot the server</button>
          <button onClick={() => setS(initialSvc())}>reset</button>
        </div>
      </div>
      {s.console.length > 0 && <pre className="algo-code lt-code">{s.console.join("\n")}</pre>}
      <div className="lt-pane-head">
        <span className="lt-lang">journalctl -u {UNIT}</span>
      </div>
      <pre className="algo-code lt-code ops-output ops-journal">{s.journal.length ? s.journal.join("\n") : "-- No entries --"}</pre>
      <p className="gate-note">
        A model, not a real systemd: the messages follow systemd 255's wording (Ubuntu 24.04). Things to try: start it and reboot without enabling it; set
        Restart=on-failure, crash it, and notice nothing changed until daemon-reload; compare a crash with a clean exit under on-failure and always.
      </p>
    </div>
  );
}

// ---- apt dependency model -------------------------------------------------------------------

interface Pkg {
  deps: string[];
  desc: string;
}

const REPO: Record<string, Pkg> = {
  nginx: { deps: ["nginx-common"], desc: "small, powerful, scalable web/proxy server" },
  "nginx-common": { deps: [], desc: "configuration files for nginx" },
  curl: { deps: ["libcurl4t64"], desc: "command line tool for transferring data with URL syntax" },
  libcurl4t64: { deps: ["libssl3t64"], desc: "easy-to-use client-side URL transfer library" },
  libssl3t64: { deps: [], desc: "Secure Sockets Layer toolkit, shared libraries" },
  jq: { deps: ["libjq1"], desc: "lightweight and flexible command-line JSON processor" },
  libjq1: { deps: ["libonig5"], desc: "lightweight and flexible command-line JSON processor, shared library" },
  libonig5: { deps: [], desc: "regular expressions library" },
  htop: { deps: ["libncursesw6"], desc: "interactive processes viewer" },
  libncursesw6: { deps: [], desc: "shared libraries for terminal handling" },
};

type Installed = Record<string, "manual" | "auto">;

const START_INSTALLED: Installed = { libssl3t64: "auto", libncursesw6: "auto", "openssh-client": "manual" };

function needed(installed: Installed): Set<string> {
  // Everything reachable from a manually installed package.
  const keep = new Set<string>();
  const visit = (p: string) => {
    if (keep.has(p)) return;
    keep.add(p);
    (REPO[p]?.deps ?? []).forEach(visit);
  };
  Object.entries(installed).forEach(([p, how]) => how === "manual" && visit(p));
  // openssh-client stands in for the rest of the system, which needs libssl and ncurses.
  if (installed["openssh-client"]) {
    visit("libssl3t64");
    visit("libncursesw6");
  }
  return keep;
}

function summary(upgraded: number, installed: number, removed: number) {
  return `${upgraded} upgraded, ${installed} newly installed, ${removed} to remove and 0 not upgraded.`;
}

function wrapList(names: string[]) {
  return `  ${names.sort().join(" ")}`;
}

export function AptSimulator() {
  const [installed, setInstalled] = useState<Installed>(START_INSTALLED);
  const [out, setOut] = useState<string>("Pick a command. The list on the right is what dpkg has installed.");

  function install(pkg: string) {
    const toAdd: string[] = [];
    const visit = (p: string) => {
      if (installed[p] || toAdd.includes(p)) return;
      toAdd.push(p);
      REPO[p].deps.forEach(visit);
    };
    visit(pkg);
    const lines = [`$ sudo apt install ${pkg}`, "Reading package lists... Done", "Building dependency tree... Done", "Reading state information... Done"];
    if (toAdd.length === 0) {
      lines.push(`${pkg} is already the newest version.`);
      if (installed[pkg] === "auto") lines.push(`${pkg} set to manually installed.`);
      lines.push(summary(0, 0, 0));
      setInstalled({ ...installed, [pkg]: "manual" });
    } else {
      const extra = toAdd.filter((p) => p !== pkg);
      if (extra.length) lines.push("The following additional packages will be installed:", wrapList(extra));
      lines.push("The following NEW packages will be installed:", wrapList([...toAdd]), summary(0, toAdd.length, 0));
      const next = { ...installed };
      toAdd.forEach((p) => (next[p] = p === pkg ? "manual" : "auto"));
      setInstalled(next);
    }
    setOut(lines.join("\n"));
  }

  function remove(pkg: string) {
    // Removing a package also removes everything installed that depends on it.
    const gone = new Set<string>([pkg]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const p of Object.keys(installed)) {
        if (!gone.has(p) && (REPO[p]?.deps ?? []).some((d) => gone.has(d))) {
          gone.add(p);
          grew = true;
        }
      }
    }
    if (pkg === "libssl3t64" || pkg === "libncursesw6") gone.add("openssh-client");
    const next: Installed = { ...installed };
    gone.forEach((p) => delete next[p]);
    const keep = needed(next);
    const orphans = Object.keys(next).filter((p) => next[p] === "auto" && !keep.has(p));
    const lines = [`$ sudo apt remove ${pkg}`, "Reading package lists... Done", "Building dependency tree... Done", "Reading state information... Done"];
    if (orphans.length)
      lines.push("The following packages were automatically installed and are no longer required:", wrapList(orphans), "Use 'sudo apt autoremove' to remove them.");
    lines.push("The following packages will be REMOVED:", wrapList([...gone]), summary(0, 0, gone.size));
    if (gone.size > 1) lines.push("", "(Everything that depends on what you removed has to go too. Read this list before you answer Y.)");
    setInstalled(next);
    setOut(lines.join("\n"));
  }

  function autoremove() {
    const keep = needed(installed);
    const orphans = Object.keys(installed).filter((p) => installed[p] === "auto" && !keep.has(p));
    const lines = ["$ sudo apt autoremove", "Reading package lists... Done", "Building dependency tree... Done", "Reading state information... Done"];
    if (orphans.length) {
      lines.push("The following packages will be REMOVED:", wrapList(orphans), summary(0, 0, orphans.length));
      const next = { ...installed };
      orphans.forEach((p) => delete next[p]);
      setInstalled(next);
    } else lines.push(summary(0, 0, 0));
    setOut(lines.join("\n"));
  }

  const keep = needed(installed);
  const top = ["nginx", "curl", "jq", "htop"];
  return (
    <div>
      <div className="ops-tool-row">
        <span className="ops-tool-name">install</span>
        <div className="sql-presets">
          {top.map((p) => (
            <button key={p} onClick={() => install(p)}>
              apt install {p}
            </button>
          ))}
        </div>
      </div>
      <div className="ops-tool-row">
        <span className="ops-tool-name">remove</span>
        <div className="sql-presets">
          {[...top, "libjq1", "libssl3t64"].map((p) => (
            <button key={p} disabled={!installed[p]} onClick={() => remove(p)}>
              apt remove {p}
            </button>
          ))}
          <button onClick={autoremove}>apt autoremove</button>
          <button
            onClick={() => {
              setInstalled(START_INSTALLED);
              setOut("Back to a fresh system.");
            }}
          >
            reset
          </button>
        </div>
      </div>
      <div className="ops-apt">
        <pre className="algo-code lt-code ops-output">{out}</pre>
        <div className="cm-scroll">
          <table className="bigo-table ops-apt-table">
            <thead>
              <tr>
                <th>installed package</th>
                <th>marked</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(installed)
                .sort()
                .map((p) => (
                  <tr key={p}>
                    <td>
                      <code>{p}</code>
                    </td>
                    <td className={installed[p] === "auto" && !keep.has(p) ? "ops-bad" : ""}>
                      {installed[p]}
                      {installed[p] === "auto" && !keep.has(p) ? ", unused" : ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="gate-note">
        A model of apt's bookkeeping with a handful of real Ubuntu 24.04 package names; openssh-client stands in for the rest of the system. The messages
        follow apt's wording. Try installing jq, then removing it, then autoremove; or remove libssl3t64 and read what else goes.
      </p>
    </div>
  );
}

// ---- cron -----------------------------------------------------------------------------------

const CRON_NOW = new Date(2026, 9, 12, 9, 30); // Monday 12 October 2026, 09:30

const CRON_CHALLENGES: { prompt: string; answer: string }[] = [
  { prompt: "Every weekday (Monday to Friday) at 07:30", answer: "30 7 * * 1-5" },
  { prompt: "Every 15 minutes", answer: "*/15 * * * *" },
  { prompt: "At 02:00 on the first day of every month", answer: "0 2 1 * *" },
  { prompt: "Every Sunday at 23:45", answer: "45 23 * * 0" },
  { prompt: "On the hour, every hour from 08:00 to 18:00, weekdays only", answer: "0 8-18 * * 1-5" },
  { prompt: "At 06:00 and 18:00 every day", answer: "0 6,18 * * *" },
];

function sameSchedule(a: string, b: string): boolean {
  try {
    const sa = parseCron(a);
    const sb = parseCron(b);
    for (const from of [CRON_NOW, new Date(2027, 1, 27, 22, 10)]) {
      const ra = nextRuns(sa, from, 40).map((d) => d.getTime());
      const rb = nextRuns(sb, from, 40).map((d) => d.getTime());
      if (ra.join() !== rb.join()) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function CronExplainer() {
  const [expr, setExpr] = useState("30 7 * * 1-5");
  const [challenge, setChallenge] = useState(0);
  const [guess, setGuess] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const result = useMemo(() => {
    try {
      const s = parseCron(expr);
      return { ok: true as const, text: describe(s), runs: nextRuns(s, CRON_NOW, 6).map(formatRun) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [expr]);
  const fields = expr.trim().split(/\s+/);
  const labels = ["minute", "hour", "day of month", "month", "day of week"];
  const c = CRON_CHALLENGES[challenge];
  return (
    <div>
      <label className="ops-field">
        <span>Schedule</span>
        <input className="lt-search ops-mono" value={expr} onChange={(e) => setExpr(e.target.value)} aria-label="Cron schedule" spellCheck={false} />
      </label>
      {fields.length === 5 && !expr.trim().startsWith("@") && (
        <div className="ops-cron-fields">
          {fields.map((f, i) => (
            <div key={i} className="ops-cron-field">
              <code>{f}</code>
              <span>{labels[i]}</span>
            </div>
          ))}
        </div>
      )}
      {result.ok ? (
        <>
          <p className="lt-p">
            <strong>Runs {result.text}.</strong>
          </p>
          <p className="gate-note">Next runs after Mon 2026-10-12 09:30:</p>
          <ol className="ops-runs">
            {result.runs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </>
      ) : (
        <p className="constraint-fail">{result.error}</p>
      )}
      <div className="sql-presets">
        {["*/5 * * * *", "0 3 * * *", "0 0 * * 0", "0 9-17/2 * * mon-fri", "0 0 13 * 5", "@hourly"].map((e) => (
          <button key={e} onClick={() => setExpr(e)}>
            <code>{e}</code>
          </button>
        ))}
      </div>

      <div className="drill-card ops-challenge">
        <div className="drill-progress">
          Challenge {challenge + 1} of {CRON_CHALLENGES.length}
        </div>
        <p className="lt-p">
          Write a schedule for: <strong>{c.prompt}</strong>
        </p>
        <div className="ops-inline-form">
          <input
            className="lt-search ops-mono"
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value);
              setChecked(null);
            }}
            placeholder="m h dom mon dow"
            aria-label="Your schedule"
            spellCheck={false}
          />
          <button onClick={() => setChecked(sameSchedule(guess, c.answer))}>Check</button>
          <button
            onClick={() => {
              setChallenge((challenge + 1) % CRON_CHALLENGES.length);
              setGuess("");
              setChecked(null);
            }}
          >
            Next
          </button>
        </div>
        {checked === true && <p className="constraint-ok">Right: it fires at exactly the same times as {c.answer}.</p>}
        {checked === false && (
          <p className="constraint-fail">
            Not the same schedule. Paste it into the box above to see when it really runs. One answer: <code>{c.answer}</code>
          </p>
        )}
      </div>
    </div>
  );
}

// ---- SSH keys ------------------------------------------------------------------------------

interface SshState {
  keyMade: boolean;
  keyMode: "600" | "644";
  authorized: boolean;
  known: boolean;
  hostKey: number;
  knownKey: number;
  passwordAuth: boolean;
}

const FP = ["SHA256:xq3vO1d0mT9kYb2r7Wc5pLh8uEaNf4ZsGjK6iR0tVyQ", "SHA256:N7bR2kXp5TqW9mLc3vHd8sYf1aJu6oEg4iZxC0nBtPe"];

export function SshLogin() {
  const [s, setS] = useState<SshState>({ keyMade: false, keyMode: "600", authorized: false, known: false, hostKey: 0, knownKey: 0, passwordAuth: true });
  const [out, setOut] = useState("Start by making a key pair, then try to connect.");
  const [pendingTrust, setPendingTrust] = useState(false);

  function connect(trust?: boolean) {
    const lines = ["$ ssh deploy@web01"];
    if (!s.known && trust === undefined) {
      lines.push(
        "The authenticity of host 'web01 (10.20.0.11)' can't be established.",
        `ED25519 key fingerprint is ${FP[s.hostKey]}.`,
        "This key is not known by any other names.",
        "Are you sure you want to continue connecting (yes/no/[fingerprint])?",
      );
      setPendingTrust(true);
      setOut(lines.join("\n"));
      return;
    }
    let next = s;
    if (trust !== undefined) {
      setPendingTrust(false);
      if (!trust) {
        setOut(out + "\nno\nHost key verification failed.");
        return;
      }
      next = { ...s, known: true, knownKey: s.hostKey };
      setS(next);
      lines.length = 0;
      lines.push(out, "yes", "Warning: Permanently added 'web01' (ED25519) to the list of known hosts.");
    } else if (s.knownKey !== s.hostKey) {
      lines.push(
        "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
        "@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @",
        "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
        "IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!",
        "Someone could be eavesdropping on you right now (man-in-the-middle attack)!",
        "It is also possible that a host key has just been changed.",
        "The fingerprint for the ED25519 key sent by the remote host is",
        `${FP[s.hostKey]}.`,
        "Please contact your system administrator.",
        "Add correct host key in /home/ana/.ssh/known_hosts to get rid of this message.",
        "Offending ED25519 key in /home/ana/.ssh/known_hosts:3",
        "Host key for web01 has changed and you have requested strict checking.",
        "Host key verification failed.",
        "",
        "(Expected here, because you rebuilt the server. Confirm the new fingerprint with whoever rebuilt it, then: ssh-keygen -R web01)",
      );
      setOut(lines.join("\n"));
      return;
    }
    if (next.keyMade && next.keyMode === "644") {
      lines.push(
        "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
        "@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @",
        "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
        "Permissions 0644 for '/home/ana/.ssh/id_ed25519' are too open.",
        "It is required that your private key files are NOT accessible by others.",
        "This private key will be ignored.",
        'Load key "/home/ana/.ssh/id_ed25519": bad permissions',
      );
    }
    if (next.keyMade && next.keyMode === "600" && next.authorized) {
      lines.push("Enter passphrase for key '/home/ana/.ssh/id_ed25519':", "Welcome to Ubuntu 24.04.5 LTS", "deploy@web01:~$", "", "(Logged in with your key: the server checked a signature made by your private key against the public key in authorized_keys. No password crossed the network.)");
    } else if (next.passwordAuth) {
      lines.push("deploy@web01's password:", "Welcome to Ubuntu 24.04.5 LTS", "deploy@web01:~$", "", "(Logged in with a password: the key wasn't usable, so ssh fell back to asking.)");
    } else {
      lines.push("deploy@web01: Permission denied (publickey).", "", "(The server only accepts keys, and no key it trusts was offered.)");
    }
    setOut(lines.join("\n"));
  }

  const act = (label: string, fn: () => void) => (
    <button disabled={pendingTrust} onClick={fn}>
      {label}
    </button>
  );
  return (
    <div>
      <div className="ops-ssh">
        <div className="ops-card">
          <strong>Your laptop (ana)</strong>
          <ul className="lt-list">
            <li>~/.ssh/id_ed25519 (private): {s.keyMade ? `present, mode ${s.keyMode}` : "none"}</li>
            <li>~/.ssh/id_ed25519.pub: {s.keyMade ? "present" : "none"}</li>
            <li>~/.ssh/known_hosts: {s.known ? `web01 ${FP[s.knownKey].slice(0, 16)}…` : "no entry for web01"}</li>
          </ul>
        </div>
        <div className="ops-card">
          <strong>Server web01 (user deploy)</strong>
          <ul className="lt-list">
            <li>host key: {FP[s.hostKey].slice(0, 16)}…</li>
            <li>~/.ssh/authorized_keys: {s.authorized ? "contains ana's public key" : "empty"}</li>
            <li>PasswordAuthentication {s.passwordAuth ? "yes" : "no"}</li>
          </ul>
        </div>
      </div>
      <div className="sql-presets">
        {act("ssh-keygen -t ed25519", () => {
          setS({ ...s, keyMade: true, keyMode: "600" });
          setOut("$ ssh-keygen -t ed25519 -C ana@conperio\nGenerating public/private ed25519 key pair.\n(… passphrase prompts, fingerprint and randomart, as in the sample above …)");
        })}
        {act("ssh-copy-id deploy@web01", () => {
          if (!s.keyMade) return setOut("$ ssh-copy-id deploy@web01\n/usr/bin/ssh-copy-id: ERROR: No identities found");
          if (!s.passwordAuth && !s.authorized)
            return setOut("$ ssh-copy-id deploy@web01\n…\ndeploy@web01: Permission denied (publickey).\n\n(ssh-copy-id logs in to install the key, normally with your password. With passwords switched off, someone who can already log in has to add it.)");
          setS({ ...s, authorized: true });
          setOut("$ ssh-copy-id deploy@web01\n…\ndeploy@web01's password:\n\nNumber of key(s) added: 1\n\nNow try logging into the machine, with:   \"ssh 'deploy@web01'\"\nand check to make sure that only the key(s) you wanted were added.");
        })}
        {act("ssh deploy@web01", () => connect())}
        {act(s.keyMode === "600" ? "chmod 644 the private key" : "chmod 600 the private key", () => s.keyMade && setS({ ...s, keyMode: s.keyMode === "600" ? "644" : "600" }))}
        {act(s.passwordAuth ? "server: PasswordAuthentication no" : "server: PasswordAuthentication yes", () => setS({ ...s, passwordAuth: !s.passwordAuth }))}
        {act("rebuild the server", () => {
          setS({ ...s, hostKey: 1 - s.hostKey, authorized: false });
          setOut("(web01 was reinstalled: it has a brand-new host key, and authorized_keys is empty again.)");
        })}
        {act("ssh-keygen -R web01", () => {
          setS({ ...s, known: false });
          setOut("$ ssh-keygen -R web01\n# Host web01 found: line 3\n/home/ana/.ssh/known_hosts updated.\nOriginal contents retained as /home/ana/.ssh/known_hosts.old");
        })}
      </div>
      {pendingTrust && (
        <div className="sql-presets">
          <button onClick={() => connect(true)}>yes</button>
          <button onClick={() => connect(false)}>no</button>
        </div>
      )}
      <pre className="algo-code lt-code ops-output">{out}</pre>
      <p className="gate-note">
        A model of one laptop and one server. The messages follow OpenSSH 9.6's wording; the unprotected-key warning was captured from ssh-keygen, the others
        couldn't be captured without running an SSH server here.
      </p>
    </div>
  );
}

// ---- Disk full ------------------------------------------------------------------------------

interface DirNode {
  name: string;
  mb?: number; // files only
  children?: DirNode[];
}

const DISK_TREE: DirNode = {
  name: "/",
  children: [
    { name: "boot", children: [{ name: "vmlinuz", mb: 14 }, { name: "initrd.img", mb: 68 }] },
    {
      name: "home",
      children: [{ name: "ana", children: [{ name: "Downloads", children: [{ name: "ubuntu-24.04.iso", mb: 2700 }] }, { name: "notes.txt", mb: 0.1 }] }],
    },
    {
      name: "opt",
      children: [{ name: "academy", children: [{ name: "Server.dll", mb: 4 }, { name: "wwwroot", mb: 38 }] }],
    },
    { name: "usr", children: [{ name: "lib", mb: 3100 }, { name: "share", mb: 1400 }, { name: "bin", mb: 410 }] },
    {
      name: "var",
      children: [
        { name: "cache", children: [{ name: "apt", mb: 312 }] },
        { name: "lib", children: [{ name: "docker", mb: 4100 }, { name: "postgresql", mb: 1900 }] },
        {
          name: "log",
          children: [
            { name: "syslog", mb: 48 },
            { name: "journal", mb: 820 },
            { name: "academy", children: [{ name: "api.log", mb: 14600 }, { name: "api.log.1", mb: 210 }] },
          ],
        },
      ],
    },
  ],
};

function sizeOf(n: DirNode): number {
  return n.mb ?? (n.children ?? []).reduce((s, c) => s + sizeOf(c), 0);
}

// du -h style: rounds up, one decimal below 10.
function human(mb: number): string {
  const kb = mb * 1024;
  const units: [string, number][] = [
    ["G", 1024 * 1024],
    ["M", 1024],
    ["K", 1],
  ];
  for (const [u, size] of units) {
    if (kb >= size || u === "K") {
      const v = kb / size;
      return v < 10 ? `${Math.ceil(v * 10) / 10}${u}`.replace(/^(\d+)$/, "$1.0") : `${Math.ceil(v)}${u}`;
    }
  }
  return "0";
}

const DISK_SIZE_MB = 30 * 1024;

export function DiskFull() {
  const [path, setPath] = useState<string[]>([]);
  const [fix, setFix] = useState<"none" | "rm" | "rm-restart" | "truncate">("none");
  let node = DISK_TREE;
  for (const p of path) node = node.children!.find((c) => c.name === p)!;
  const dirPath = "/" + path.join("/");
  const entries = [...(node.children ?? [])].sort((a, b) => sizeOf(a) - sizeOf(b));
  const logMb = 14600;
  const freed = fix === "rm-restart" || fix === "truncate" ? logMb : 0;
  const used = sizeOf(DISK_TREE) + 300 - freed; // + filesystem overhead
  const usedClamped = Math.min(used, DISK_SIZE_MB);
  const pct = Math.min(100, Math.ceil((usedClamped / DISK_SIZE_MB) * 100));
  const avail = Math.max(0, DISK_SIZE_MB - usedClamped);
  const atLog = dirPath === "/var/log/academy";
  return (
    <div>
      <p className="lt-p">
        An alert says the API on <code>web01</code> is failing to write. Start with <code>df</code>, then follow the biggest directory down with{" "}
        <code>du</code>. Click a directory to go into it.
      </p>
      <pre className="algo-code lt-code ops-output">
        {`$ df -h /
Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        30G  ${human(usedClamped).padStart(4)}  ${human(avail).padStart(4)} ${String(pct).padStart(3)}% /`}
      </pre>
      <div className="ops-crumbs">
        <button className="link-button" onClick={() => setPath([])}>
          /
        </button>
        {path.map((p, i) => (
          <span key={i}>
            {i > 0 && " / "}
            <button className="link-button" onClick={() => setPath(path.slice(0, i + 1))}>
              {p}
            </button>
          </span>
        ))}
      </div>
      <pre className="algo-code lt-code ops-du">
        {`$ sudo du -sh ${dirPath === "/" ? "/*" : dirPath + "/*"} | sort -h\n`}
        {entries.map((c) => {
          const full = `${dirPath === "/" ? "" : dirPath}/${c.name}`;
          const deleted = full === "/var/log/academy/api.log" && fix !== "none" && fix !== "truncate";
          if (deleted) return null;
          const shownMb = full === "/var/log/academy/api.log" && fix === "truncate" ? 0 : sizeOf(c);
          return (
            <span key={c.name}>
              {human(shownMb).padEnd(8)}
              {c.children ? (
                <button className="link-button ops-du-link" onClick={() => setPath([...path, c.name])}>
                  {full}
                </button>
              ) : (
                full
              )}
              {"\n"}
            </span>
          );
        })}
      </pre>
      {atLog && (
        <div className="drill-card">
          <p className="lt-p">
            Found it: one log file the app never rotates. The API process still has it open. What do you do?
          </p>
          <div className="sql-presets">
            <button className={fix === "rm" ? "active" : ""} onClick={() => setFix("rm")}>
              sudo rm api.log
            </button>
            <button className={fix === "rm-restart" ? "active" : ""} onClick={() => setFix(fix === "rm" ? "rm-restart" : "rm")}>
              {fix === "rm" || fix === "rm-restart" ? "then: sudo systemctl restart academy-api" : "rm, then restart the service"}
            </button>
            <button className={fix === "truncate" ? "active" : ""} onClick={() => setFix("truncate")}>
              sudo truncate -s 0 api.log
            </button>
            <button onClick={() => setFix("none")}>undo</button>
          </div>
          {fix === "rm" && (
            <>
              <p className="constraint-fail">
                The file is gone from the listing, but df still says {pct}%. A deleted file's space is only released when the last process holding it open
                closes it, and the API still has it open:
              </p>
              <pre className="algo-code lt-code ops-output">{`$ sudo lsof +L1
COMMAND   PID    USER   FD   TYPE DEVICE    SIZE/OFF NLINK    NODE NAME
dotnet   2117 academy   3w   REG    8,1 15309209600     0  524411 /var/log/academy/api.log (deleted)`}</pre>
            </>
          )}
          {fix === "rm-restart" && <p className="constraint-ok">Restarting the service closed the file, and the space came back. Now set up log rotation so it doesn't happen again.</p>}
          {fix === "truncate" && (
            <p className="constraint-ok">
              Emptying the file in place frees the space at once, without a restart, because the process keeps the same open file. (The app keeps writing at
              its old offset unless it opened the file in append mode, which loggers normally do.) Next: log rotation.
            </p>
          )}
        </div>
      )}
      <p className="gate-note">
        A made-up server. The df and du output formats are real (du -h rounds up); the lsof line has the same shape as the capture in the lesson above.
      </p>
    </div>
  );
}
