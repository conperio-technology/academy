import { useMemo, useState, type ReactNode } from "react";

// Simulators for the Windows & PowerShell lessons. None of this runs Windows: each widget
// is a small model whose rules follow Microsoft's documentation, and whose messages follow
// the real tools' wording. The lessons flag every output that couldn't be captured.

// ---- Services ------------------------------------------------------------------------------

type StartType = "Automatic" | "Automatic (Delayed Start)" | "Manual" | "Disabled";
type SvcStatus = "Running" | "Stopped";

interface WinSvc {
  name: string;
  display: string;
  start: StartType;
  status: SvcStatus;
  dependsOn?: string;
  recovery: boolean; // "Restart the Service" on first failure
  failures: number;
}

const START_SERVICES: WinSvc[] = [
  { name: "MSSQLSERVER", display: "SQL Server (MSSQLSERVER)", start: "Automatic", status: "Running", recovery: false, failures: 0 },
  { name: "AcademyApi", display: "Academy API", start: "Manual", status: "Stopped", dependsOn: "MSSQLSERVER", recovery: false, failures: 0 },
  { name: "Spooler", display: "Print Spooler", start: "Automatic", status: "Running", recovery: true, failures: 0 },
  { name: "wuauserv", display: "Windows Update", start: "Manual", status: "Stopped", recovery: false, failures: 0 },
];

export function WinServices() {
  const [svcs, setSvcs] = useState<WinSvc[]>(START_SERVICES);
  const [log, setLog] = useState<string[]>(["PS C:\\> Get-Service MSSQLSERVER, AcademyApi, Spooler, wuauserv"]);
  const find = (list: WinSvc[], n: string) => list.find((s) => s.name === n)!;

  function update(fn: (list: WinSvc[]) => WinSvc[], lines: string[]) {
    setSvcs((cur) => fn(cur.map((s) => ({ ...s }))));
    setLog(lines);
  }

  function start(name: string) {
    const s = find(svcs, name);
    const lines = [`PS C:\\> Start-Service ${name}`];
    if (s.start === "Disabled") {
      lines.push(
        `Start-Service: Service '${s.display} (${name})' cannot be started due to the following error: Cannot start service '${name}' on computer '.'.`,
        "(A disabled service can't be started at all. Set-Service -StartupType Manual first.)",
      );
      return setLog(lines);
    }
    update((list) => {
      const t = find(list, name);
      if (t.dependsOn) {
        const dep = find(list, t.dependsOn);
        if (dep.status === "Stopped" && dep.start !== "Disabled") {
          dep.status = "Running";
          lines.push(`(Windows starts ${dep.name} first, because ${name} depends on it.)`);
        }
        if (dep.start === "Disabled") {
          lines.push(`Start-Service: Service '${t.display} (${name})' cannot be started: the dependency service ${dep.name} is disabled.`);
          return list;
        }
      }
      t.status = "Running";
      return list;
    }, lines);
  }

  function stop(name: string) {
    const lines = [`PS C:\\> Stop-Service ${name}`];
    const dependents = svcs.filter((s) => s.dependsOn === name && s.status === "Running");
    if (dependents.length) {
      lines.push(
        `Stop-Service: Cannot stop service '${find(svcs, name).display} (${name})' because it has dependent services. It can only be stopped if the Force flag is set.`,
        `(${dependents.map((d) => d.name).join(", ")} depends on it. Stop-Service ${name} -Force stops both.)`,
      );
      return setLog(lines);
    }
    update((list) => {
      find(list, name).status = "Stopped";
      return list;
    }, lines);
  }

  function crash(name: string) {
    update(
      (list) => {
        const t = find(list, name);
        if (t.status !== "Running") return list;
        t.failures += 1;
        t.status = t.recovery ? "Running" : "Stopped";
        return list;
      },
      [
        `(${name} crashes.)`,
        `Event 7034 or 7031, Service Control Manager: The ${find(svcs, name).display} service terminated unexpectedly.` +
          (find(svcs, name).recovery ? "  The following corrective action will be taken in 60000 milliseconds: Restart the service." : ""),
        find(svcs, name).recovery ? "(Recovery is set to restart it, so after a minute it's running again.)" : "(No recovery action is set, so it stays stopped.)",
      ],
    );
  }

  function reboot() {
    update(
      (list) =>
        list.map((s) => ({ ...s, status: s.start.startsWith("Automatic") ? "Running" : "Stopped", failures: 0 })),
      [
        "PS C:\\> Restart-Computer",
        "(After the reboot, Automatic services start during boot and Automatic (Delayed Start) ones about two minutes later. Manual services start only when something asks for them.)",
      ],
    );
  }

  return (
    <div>
      <div className="cm-scroll">
        <table className="bigo-table ops-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>DisplayName</th>
              <th>Status</th>
              <th>StartType</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {svcs.map((s) => (
              <tr key={s.name}>
                <td>
                  <code>{s.name}</code>
                </td>
                <td>
                  {s.display}
                  {s.dependsOn && <span className="ops-note-inline"> (depends on {s.dependsOn})</span>}
                </td>
                <td className={s.status === "Running" ? "ops-ok" : ""}>{s.status}</td>
                <td>
                  <select
                    className="ops-select"
                    value={s.start}
                    aria-label={`Startup type of ${s.name}`}
                    onChange={(e) => {
                      const v = e.target.value as StartType;
                      const psType = v === "Automatic (Delayed Start)" ? "AutomaticDelayedStart" : v;
                      update(
                        (list) => {
                          find(list, s.name).start = v;
                          return list;
                        },
                        [`PS C:\\> Set-Service ${s.name} -StartupType ${psType}`, "(Changes what happens at the next boot. The service's current status is untouched.)"],
                      );
                    }}
                  >
                    {(["Automatic", "Automatic (Delayed Start)", "Manual", "Disabled"] as StartType[]).map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <div className="ops-row-actions">
                    <button onClick={() => start(s.name)}>Start</button>
                    <button onClick={() => stop(s.name)}>Stop</button>
                    <button onClick={() => crash(s.name)}>Crash</button>
                    <label className="ops-check">
                      <input
                        type="checkbox"
                        checked={s.recovery}
                        onChange={() =>
                          update(
                            (list) => {
                              const t = find(list, s.name);
                              t.recovery = !t.recovery;
                              return list;
                            },
                            [
                              `PS C:\\> sc.exe failure ${s.name} reset= 86400 actions= ${s.recovery ? '""' : "restart/60000"}`,
                              s.recovery ? "(Recovery actions removed.)" : "(On failure, restart the service after 60 seconds.)",
                            ],
                          )
                        }
                      />
                      restart on failure
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sql-presets">
        <button onClick={reboot}>Restart-Computer</button>
        <button
          onClick={() => {
            setSvcs(START_SERVICES);
            setLog(["(Reset.)"]);
          }}
        >
          reset
        </button>
      </div>
      <pre className="algo-code lt-code ops-output">{log.join("\n")}</pre>
      <p className="gate-note">
        A model of the Service Control Manager. Things to try: start Academy API (watch its dependency), set it to Manual and reboot, stop SQL Server while the
        API runs, disable a service and start it, crash a service with and without a recovery action.
      </p>
    </div>
  );
}

// ---- Event log ---------------------------------------------------------------------------

type Level = "Critical" | "Error" | "Warning" | "Information" | "Audit Success" | "Audit Failure";

interface WinEvent {
  time: string;
  log: "System" | "Application" | "Security";
  level: Level;
  id: number;
  source: string;
  message: string;
  meaning: string;
}

const EVENTS: WinEvent[] = [
  { time: "02:14:58", log: "System", level: "Critical", id: 41, source: "Kernel-Power", message: "The system has rebooted without cleanly shutting down first. This error could be caused if the system stopped responding, crashed, or lost power unexpectedly.", meaning: "An unexpected restart: power loss, a hard reset or a crash. Look just before it for the cause (a bugcheck event 1001, overheating, or nothing at all if the power simply went)." },
  { time: "02:14:59", log: "System", level: "Error", id: 6008, source: "EventLog", message: "The previous system shutdown at 02:11:40 on 12.10.2026 was unexpected.", meaning: "Written at boot when the last shutdown wasn't clean. Pairs with 41." },
  { time: "02:15:01", log: "System", level: "Information", id: 6005, source: "EventLog", message: "The Event log service was started.", meaning: "Effectively \"the machine booted\". 6006 is its clean-shutdown partner, so 6005 without a 6006 before it means an unclean stop." },
  { time: "02:15:40", log: "System", level: "Information", id: 7036, source: "Service Control Manager", message: "The Academy API service entered the running state.", meaning: "Every service start and stop is logged by the Service Control Manager." },
  { time: "08:02:13", log: "System", level: "Warning", id: 1014, source: "DNS Client Events", message: "Name resolution for the name db01.conperio.local timed out after none of the configured DNS servers responded.", meaning: "The DNS servers didn't answer in time. If this keeps happening, most other errors are a consequence." },
  { time: "08:02:20", log: "Application", level: "Error", id: 1026, source: ".NET Runtime", message: "Application: Academy.Api.exe\nCoreCLR Version: 10.0.0\nDescription: The process was terminated due to an unhandled exception.\nException Info: System.Net.Sockets.SocketException (11001): No such host is known.", meaning: "A .NET app crashed, with the exception that killed it. Usually followed by a 1000 from Application Error." },
  { time: "08:02:20", log: "Application", level: "Error", id: 1000, source: "Application Error", message: "Faulting application name: Academy.Api.exe, version: 1.4.2.0\nFaulting module name: KERNELBASE.dll\nException code: 0xe0434352", meaning: "A process crashed. Exception code 0xe0434352 is the generic code for an unhandled .NET exception." },
  { time: "08:02:21", log: "System", level: "Error", id: 7031, source: "Service Control Manager", message: "The Academy API service terminated unexpectedly.  It has done this 1 time(s).  The following corrective action will be taken in 60000 milliseconds: Restart the service.", meaning: "A service died, and its recovery settings will restart it. 7034 is the same without a recovery action." },
  { time: "09:15:02", log: "Security", level: "Audit Failure", id: 4625, source: "Microsoft Windows security auditing.", message: "An account failed to log on.\nLogon Type: 3\nAccount Name: ana\nFailure Reason: Unknown user name or bad password.\nSource Network Address: 10.20.4.77", meaning: "A failed sign-in. Logon type 3 is network (a file share, say), 10 is Remote Desktop, 2 is at the keyboard. Many in a row from one address is a password-guessing attack or a stale saved password." },
  { time: "09:15:09", log: "Security", level: "Audit Success", id: 4740, source: "Microsoft Windows security auditing.", message: "A user account was locked out.\nAccount Name: ana\nCaller Computer Name: LAPTOP-ANA17", meaning: "Logged on domain controllers. The caller computer tells you which machine keeps sending the bad password, often an old phone or mapped drive." },
  { time: "09:31:44", log: "Security", level: "Audit Success", id: 4624, source: "Microsoft Windows security auditing.", message: "An account was successfully logged on.\nLogon Type: 10\nAccount Name: ana\nSource Network Address: 10.20.4.77", meaning: "A successful sign-in, here over Remote Desktop (type 10)." },
  { time: "10:05:12", log: "System", level: "Information", id: 19, source: "WindowsUpdateClient", message: "Installation Successful: Windows successfully installed the following update: 2026-10 Cumulative Update for Windows Server 2025 for x64-based Systems", meaning: "An update installed. 20 is a failed installation." },
  { time: "10:06:30", log: "System", level: "Information", id: 1074, source: "User32", message: "The process C:\\Windows\\system32\\svchost.exe (WEB01) has initiated the restart of computer WEB01 on behalf of user NT AUTHORITY\\SYSTEM for the following reason: Operating System: Service pack (Planned)", meaning: "Who or what asked for a restart or shutdown, and why. The first thing to check when a server rebooted \"by itself\"." },
  { time: "10:06:58", log: "System", level: "Information", id: 6006, source: "EventLog", message: "The Event log service was stopped.", meaning: "A clean shutdown." },
];

const LEVEL_NUM: Partial<Record<Level, number>> = { Critical: 1, Error: 2, Warning: 3, Information: 4 };

export function EventLog() {
  const [logName, setLogName] = useState<"All" | WinEvent["log"]>("All");
  const [level, setLevel] = useState<"All" | Level>("All");
  const [idText, setIdText] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const ids = idText
    .split(/[\s,]+/)
    .filter((x) => /^\d+$/.test(x))
    .map(Number);
  const shown = EVENTS.map((e, i) => ({ e, i })).filter(
    ({ e }) => (logName === "All" || e.log === logName) && (level === "All" || e.level === level) && (ids.length === 0 || ids.includes(e.id)),
  );
  const filter: string[] = [];
  filter.push(`LogName='${logName === "All" ? "System','Application','Security" : logName}'`);
  if (level !== "All" && LEVEL_NUM[level]) filter.push(`Level=${LEVEL_NUM[level]}`);
  if (level === "Audit Failure") filter.push("Keywords=4503599627370496");
  if (level === "Audit Success") filter.push("Keywords=9007199254740992");
  if (ids.length) filter.push(`Id=${ids.join(",")}`);
  return (
    <div>
      <div className="ops-filter-row">
        <label>
          Log{" "}
          <select className="ops-select" value={logName} onChange={(e) => setLogName(e.target.value as typeof logName)}>
            {["All", "System", "Application", "Security"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label>
          Level{" "}
          <select className="ops-select" value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
            {["All", "Critical", "Error", "Warning", "Information", "Audit Success", "Audit Failure"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="ops-grow">
          Event IDs{" "}
          <input className="lt-search ops-mono" value={idText} onChange={(e) => setIdText(e.target.value)} placeholder="e.g. 41, 6008, 1074" />
        </label>
      </div>
      <pre className="algo-code lt-code">{`Get-WinEvent -FilterHashtable @{ ${filter.join("; ")} }`}</pre>
      <div className="cm-scroll">
        <table className="bigo-table ops-table ops-events">
          <thead>
            <tr>
              <th>Time (12 Oct)</th>
              <th>Log</th>
              <th>Level</th>
              <th>Id</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(({ e, i }) => (
              <tr key={i} className={open === i ? "cm-row-on" : ""} onClick={() => setOpen(open === i ? null : i)}>
                <td>
                  <button className="link-button">{e.time}</button>
                </td>
                <td>{e.log}</td>
                <td className={e.level === "Critical" || e.level === "Error" || e.level === "Audit Failure" ? "ops-bad" : e.level === "Warning" ? "ops-warn" : ""}>{e.level}</td>
                <td>{e.id}</td>
                <td>{e.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {shown.length === 0 && <p className="lt-empty">No events match.</p>}
      {open !== null && (
        <div className="ops-card ops-event-detail">
          <strong>
            {EVENTS[open].log} event {EVENTS[open].id}, {EVENTS[open].source}
          </strong>
          <pre className="algo-code lt-code ops-output">{EVENTS[open].message}</pre>
          <p className="lt-p">{EVENTS[open].meaning}</p>
        </div>
      )}
      <p className="gate-note">
        Made-up events on a made-up server, written in the real messages' wording (shortened). Click a row for what it means. The story: an unexpected
        restart at 02:14, a DNS outage that crashed the API at 08:02, a lockout, and a planned update reboot. Try the IDs 41, 6008, 1074 together.
      </p>
    </div>
  );
}

// ---- NTFS and share permissions ----------------------------------------------------------

const R = 1, W = 2, D = 4, P = 8;
const RIGHTS: { bit: number; label: string }[] = [
  { bit: R, label: "Read" },
  { bit: W, label: "Write" },
  { bit: D, label: "Delete" },
  { bit: P, label: "Change permissions" },
];
const MASKS: Record<string, number> = { Read: R, Write: W, Modify: R | W | D, "Full control": R | W | D | P };

interface Ace {
  id: string;
  who: string;
  allow: boolean;
  level: keyof typeof MASKS;
  inherited: boolean;
  on: boolean;
}

const START_ACL: Ace[] = [
  { id: "a1", who: "Administrators", allow: true, level: "Full control", inherited: true, on: true },
  { id: "a2", who: "GG-Finance", allow: true, level: "Modify", inherited: true, on: true },
  { id: "a3", who: "Domain Users", allow: true, level: "Read", inherited: true, on: true },
  { id: "a4", who: "GG-Contractors", allow: false, level: "Write", inherited: true, on: true },
  { id: "a5", who: "cy", allow: true, level: "Modify", inherited: false, on: false },
  { id: "a6", who: "bo", allow: false, level: "Read", inherited: false, on: false },
];

const USERS: Record<string, string[]> = {
  ana: ["GG-Finance", "Domain Users", "Authenticated Users", "Everyone"],
  bo: ["GG-Finance", "Domain Users", "Authenticated Users", "Everyone"],
  cy: ["GG-Contractors", "Domain Users", "Authenticated Users", "Everyone"],
};

function evaluate(aces: Ace[], user: string): number {
  // Windows checks ACEs in canonical order: explicit deny, explicit allow, inherited deny,
  // inherited allow. For each right, the first ACE that mentions it decides.
  const order = (a: Ace) => (a.inherited ? 2 : 0) + (a.allow ? 1 : 0);
  const sorted = aces.filter((a) => a.on).sort((a, b) => order(a) - order(b));
  let granted = 0;
  let denied = 0;
  for (const a of sorted) {
    if (a.who !== user && !USERS[user].includes(a.who)) continue;
    const bits = MASKS[a.level] & ~(granted | denied);
    if (a.allow) granted |= bits;
    else denied |= bits;
  }
  return granted;
}

function rightsText(mask: number) {
  if ((mask & (R | W | D | P)) === (R | W | D | P)) return "Full control";
  if ((mask & (R | W | D)) === (R | W | D)) return "Modify";
  const names = RIGHTS.filter((r) => mask & r.bit).map((r) => r.label);
  return names.length ? names.join(", ") : "No access";
}

export function NtfsAccess() {
  const [acl, setAcl] = useState<Ace[]>(START_ACL);
  const [share, setShare] = useState<"everyone-read" | "auth-full">("everyone-read");
  const shareMask = share === "everyone-read" ? R : R | W | D | P;
  const toggle = (id: string) => setAcl(acl.map((a) => (a.id === id ? { ...a, on: !a.on } : a)));
  return (
    <div>
      <p className="lt-p">
        Folder <code>D:\Shares\Finance\Budgets</code> on file server FS01, shared as <code>\\FS01\Finance</code>. Tick or untick entries in its access
        control list (ACL) and change the share permission.
      </p>
      <div className="cm-scroll">
        <table className="bigo-table ops-table">
          <thead>
            <tr>
              <th>On</th>
              <th>Type</th>
              <th>Principal</th>
              <th>Access</th>
              <th>Inherited from</th>
            </tr>
          </thead>
          <tbody>
            {acl.map((a) => (
              <tr key={a.id} className={a.on ? "" : "ops-dim"}>
                <td>
                  <input type="checkbox" checked={a.on} onChange={() => toggle(a.id)} aria-label={`${a.allow ? "Allow" : "Deny"} ${a.who}`} />
                </td>
                <td className={a.allow ? "ops-ok" : "ops-bad"}>{a.allow ? "Allow" : "Deny"}</td>
                <td>{a.who}</td>
                <td>{a.level}</td>
                <td>{a.inherited ? "D:\\Shares\\Finance\\" : "(explicit, set on this folder)"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sql-presets">
        <span className="ops-group-label">Share permission on \\FS01\Finance:</span>
        <button className={share === "everyone-read" ? "active" : ""} onClick={() => setShare("everyone-read")}>
          Everyone: Read (the default)
        </button>
        <button className={share === "auth-full" ? "active" : ""} onClick={() => setShare("auth-full")}>
          Authenticated Users: Full control
        </button>
      </div>
      <div className="cm-scroll">
        <table className="bigo-table ops-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Member of</th>
              <th>NTFS (sitting at FS01)</th>
              <th>Over the network</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(USERS).map((u) => {
              const ntfs = evaluate(acl, u);
              const net = ntfs & shareMask;
              return (
                <tr key={u}>
                  <td>
                    <strong>{u}</strong>
                  </td>
                  <td>{USERS[u].slice(0, 2).join(", ")}</td>
                  <td>{rightsText(ntfs)}</td>
                  <td className={net === 0 ? "ops-bad" : ""}>{rightsText(net)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        Rules applied: ACEs are checked explicit deny, explicit allow, inherited deny, inherited allow, and for each right the first matching one wins. Over
        the network you get whichever is more restrictive, the share permission or NTFS. Try: switch on the explicit Allow for cy (it beats the inherited
        Deny), switch on the explicit Deny for bo, and change the share to see why ana can't save her budget from her laptop.
      </p>
    </div>
  );
}

// ---- PowerShell pipeline ---------------------------------------------------------------------

interface ProcObj {
  Name: string;
  Id: number;
  CPU: number;
  WS: number; // bytes
  Company: string;
}

const PROCS: ProcObj[] = [
  { Name: "chrome", Id: 4120, CPU: 812.4, WS: 512_000_000, Company: "Google LLC" },
  { Name: "Code", Id: 7744, CPU: 233.9, WS: 389_000_000, Company: "Microsoft Corporation" },
  { Name: "explorer", Id: 3304, CPU: 61.2, WS: 141_000_000, Company: "Microsoft Corporation" },
  { Name: "Teams", Id: 9012, CPU: 145.0, WS: 420_000_000, Company: "Microsoft Corporation" },
  { Name: "svchost", Id: 1188, CPU: 12.7, WS: 24_000_000, Company: "Microsoft Corporation" },
  { Name: "sqlservr", Id: 2260, CPU: 402.1, WS: 1_250_000_000, Company: "Microsoft Corporation" },
  { Name: "notepad", Id: 8836, CPU: 0.4, WS: 18_000_000, Company: "Microsoft Corporation" },
  { Name: "Academy.Api", Id: 5532, CPU: 96.3, WS: 210_000_000, Company: "Conperio" },
];

type Row = Record<string, string | number>;

interface Stage {
  id: string;
  code: string;
  apply: (rows: Row[]) => Row[];
  note: string;
}

const STAGES: Stage[] = [
  { id: "cpu", code: "Where-Object CPU -gt 100", apply: (r) => r.filter((x) => typeof x.CPU === "number" && x.CPU > 100), note: "Keeps the objects whose CPU property is greater than 100. A number comparison, because CPU is a number, not text." },
  { id: "ms", code: "Where-Object Company -like 'Microsoft*'", apply: (r) => r.filter((x) => String(x.Company ?? "").toLowerCase().startsWith("microsoft")), note: "-like uses wildcards and, like all PowerShell comparisons, ignores case unless you use -clike." },
  { id: "sortws", code: "Sort-Object WS -Descending", apply: (r) => [...r].sort((a, b) => Number(b.WS) - Number(a.WS)), note: "Sorts by the WS (working set, memory in use) property, biggest first." },
  { id: "sortname", code: "Sort-Object Name", apply: (r) => [...r].sort((a, b) => String(a.Name).localeCompare(String(b.Name), "en", { sensitivity: "base" })), note: "Text sorts ignore case, so Code sorts among the c's." },
  { id: "first3", code: "Select-Object -First 3", apply: (r) => r.slice(0, 3), note: "Keeps the first three objects, like head -n 3." },
  { id: "props", code: "Select-Object Name, Id, @{n='MB'; e={[math]::Round($_.WS / 1MB)}}", apply: (r) => r.map((x) => ("Name" in x ? { Name: x.Name, Id: x.Id, MB: Math.round(Number(x.WS) / 1048576) } : x)), note: "Makes new objects with just these properties. The @{n=...; e={...}} part is a calculated property; $_ is the current object and 1MB is a built-in constant (1048576)." },
  { id: "measure", code: "Measure-Object WS -Sum", apply: (r) => [{ Count: r.length, Sum: r.reduce((s, x) => s + Number(x.WS ?? 0), 0), Property: "WS" }], note: "Turns the stream into one summary object. Its Sum is a number you can keep using." },
];

function fmt(v: string | number) {
  return typeof v === "number" && !Number.isInteger(v) ? v.toFixed(2) : String(v);
}

export function PsPipeline() {
  const [chosen, setChosen] = useState<string[]>(["cpu", "sortws", "first3"]);
  const stages = chosen.map((id) => STAGES.find((s) => s.id === id)!);
  const results: Row[][] = [];
  let rows: Row[] = PROCS.map((p) => ({ ...p }));
  results.push(rows);
  for (const s of stages) {
    rows = s.apply(rows);
    results.push(rows);
  }
  const [view, setView] = useState<number | null>(null);
  const at = view === null || view > stages.length ? stages.length : view;
  const shown = results[at];
  const cols = shown.length ? Object.keys(shown[0]) : [];
  return (
    <div>
      <div className="sql-presets">
        {STAGES.map((s) => (
          <button key={s.id} onClick={() => setChosen([...chosen, s.id])} disabled={chosen.includes("measure") || chosen.length >= 6}>
            + <code>{s.code.length > 34 ? s.code.slice(0, 32) + "…" : s.code}</code>
          </button>
        ))}
        <button onClick={() => setChosen(chosen.slice(0, -1))} disabled={!chosen.length}>
          remove last
        </button>
        <button onClick={() => setChosen([])}>clear</button>
      </div>
      <div className="ops-pipeline">
        <button className={at === 0 ? "active" : ""} onClick={() => setView(0)}>
          <code>Get-Process</code>
          <span>{results[0].length} objects</span>
        </button>
        {stages.map((s, i) => (
          <button key={i} className={at === i + 1 ? "active" : ""} onClick={() => setView(i + 1)}>
            <code>| {s.code}</code>
            <span>
              {results[i + 1].length} object{results[i + 1].length === 1 ? "" : "s"}
            </span>
          </button>
        ))}
      </div>
      <p className="lt-p">{at === 0 ? "Get-Process emits one System.Diagnostics.Process object per running process (only a few of their 50-odd properties are shown)." : stages[at - 1].note}</p>
      <div className="cm-scroll">
        <table className="bigo-table ops-table">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <td key={c} className="mono">
                    {fmt(r[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gate-note">
        Click a stage to see the objects flowing out of it. Made-up processes; the cmdlets behave as described in their documentation. Nothing here is parsed
        out of text: each stage receives objects and reads their properties by name.
      </p>
    </div>
  );
}

// ---- Verb-Noun and Get-Member ---------------------------------------------------------------

const TASKS: { task: string; verb: string; noun: string }[] = [
  { task: "List the services on this machine", verb: "Get", noun: "Service" },
  { task: "Stop a running process", verb: "Stop", noun: "Process" },
  { task: "Copy a file", verb: "Copy", noun: "Item" },
  { task: "Create a new folder", verb: "New", noun: "Item" },
  { task: "Read a text file's lines", verb: "Get", noun: "Content" },
  { task: "Change a service's startup type", verb: "Set", noun: "Service" },
  { task: "Check whether a TCP port answers on another machine", verb: "Test", noun: "NetConnection" },
  { task: "Find the commands that exist for a topic", verb: "Get", noun: "Command" },
  { task: "Turn objects into a CSV file", verb: "Export", noun: "Csv" },
  { task: "Restart the computer", verb: "Restart", noun: "Computer" },
];

const VERBS = ["Get", "Set", "New", "Remove", "Start", "Stop", "Restart", "Copy", "Test", "Export", "Import"];
const NOUNS = ["Service", "Process", "Item", "Content", "NetConnection", "Command", "Csv", "Computer", "ChildItem", "Help"];

const MEMBERS: Record<string, { cmd: string; type: string; rows: [string, string, string][] }> = {
  service: {
    cmd: "Get-Service Spooler | Get-Member",
    type: "System.ServiceProcess.ServiceController",
    rows: [
      ["Close", "Method", "void Close()"],
      ["Refresh", "Method", "void Refresh()"],
      ["Start", "Method", "void Start(), void Start(string[] args)"],
      ["Stop", "Method", "void Stop(), void Stop(bool stopDependentServices)"],
      ["WaitForStatus", "Method", "void WaitForStatus(System.ServiceProcess.ServiceControllerStatus desiredStatus), …"],
      ["DependentServices", "Property", "System.ServiceProcess.ServiceController[] DependentServices {get;}"],
      ["DisplayName", "Property", "string DisplayName {get;set;}"],
      ["Name", "AliasProperty", "Name = ServiceName"],
      ["ServicesDependedOn", "Property", "System.ServiceProcess.ServiceController[] ServicesDependedOn {get;}"],
      ["StartType", "Property", "System.ServiceProcess.ServiceStartMode StartType {get;}"],
      ["Status", "Property", "System.ServiceProcess.ServiceControllerStatus Status {get;}"],
    ],
  },
  process: {
    cmd: "Get-Process -Id $PID | Get-Member",
    type: "System.Diagnostics.Process",
    rows: [
      ["Name", "AliasProperty", "Name = ProcessName"],
      ["WS", "AliasProperty", "WS = WorkingSet64"],
      ["Kill", "Method", "void Kill(), void Kill(bool entireProcessTree)"],
      ["WaitForExit", "Method", "void WaitForExit(), bool WaitForExit(int milliseconds), …"],
      ["Id", "Property", "int Id {get;}"],
      ["StartTime", "Property", "datetime StartTime {get;}"],
      ["Threads", "Property", "System.Diagnostics.ProcessThreadCollection Threads {get;}"],
      ["CPU", "ScriptProperty", "System.Object CPU {get=$this.TotalProcessorTime.TotalSeconds;}"],
      ["Path", "ScriptProperty", "System.Object Path {get=$this.Mainmodule.FileName;}"],
    ],
  },
  file: {
    cmd: "Get-Item C:\\Windows\\notepad.exe | Get-Member",
    type: "System.IO.FileInfo",
    rows: [
      ["CopyTo", "Method", "System.IO.FileInfo CopyTo(string destFileName), …"],
      ["Delete", "Method", "void Delete()"],
      ["MoveTo", "Method", "void MoveTo(string destFileName), …"],
      ["Attributes", "Property", "System.IO.FileAttributes Attributes {get;set;}"],
      ["CreationTime", "Property", "datetime CreationTime {get;set;}"],
      ["Extension", "Property", "string Extension {get;}"],
      ["FullName", "Property", "string FullName {get;}"],
      ["LastWriteTime", "Property", "datetime LastWriteTime {get;set;}"],
      ["Length", "Property", "long Length {get;}"],
      ["BaseName", "ScriptProperty", "System.Object BaseName {get=…}"],
    ],
  },
};

export function PsVerbNoun() {
  const [t, setT] = useState(0);
  const [verb, setVerb] = useState("Get");
  const [noun, setNoun] = useState("Service");
  const [checked, setChecked] = useState(false);
  const [kind, setKind] = useState<keyof typeof MEMBERS>("service");
  const task = TASKS[t];
  const right = verb === task.verb && noun === task.noun;
  const m = MEMBERS[kind];
  return (
    <div>
      <div className="drill-card ops-challenge">
        <div className="drill-progress">
          Task {t + 1} of {TASKS.length}
        </div>
        <p className="lt-p">
          <strong>{task.task}.</strong> Build the cmdlet name.
        </p>
        <div className="ops-inline-form">
          <select className="ops-select" value={verb} onChange={(e) => (setVerb(e.target.value), setChecked(false))} aria-label="Verb">
            {VERBS.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <span>-</span>
          <select className="ops-select" value={noun} onChange={(e) => (setNoun(e.target.value), setChecked(false))} aria-label="Noun">
            {NOUNS.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <button onClick={() => setChecked(true)}>Check</button>
          <button
            onClick={() => {
              setT((t + 1) % TASKS.length);
              setChecked(false);
            }}
          >
            Next
          </button>
        </div>
        {checked &&
          (right ? (
            <p className="constraint-ok">
              Yes: <code>{`${task.verb}-${task.noun}`}</code>. Try <code>{`Get-Help ${task.verb}-${task.noun} -Examples`}</code> next.
            </p>
          ) : (
            <p className="constraint-fail">
              Not that one. <code>{`Get-Command -Verb ${task.verb === verb ? verb : "*"} -Noun *${task.noun === noun ? noun : ""}*`}</code> would help you find
              it. (Answer: <code>{`${task.verb}-${task.noun}`}</code>)
            </p>
          ))}
      </div>
      <h4 className="ops-subhead">Get-Member: what is this object?</h4>
      <div className="sql-presets">
        {(Object.keys(MEMBERS) as (keyof typeof MEMBERS)[]).map((k) => (
          <button key={k} className={k === kind ? "active" : ""} onClick={() => setKind(k)}>
            <code>{MEMBERS[k].cmd.split(" |")[0]}</code>
          </button>
        ))}
      </div>
      <pre className="algo-code lt-code ops-output">
        {`PS C:\\> ${m.cmd}

   TypeName: ${m.type}

${"Name".padEnd(20)}${"MemberType".padEnd(16)}Definition
${"----".padEnd(20)}${"----------".padEnd(16)}----------
${m.rows.map(([n, t2, d]) => `${n.padEnd(20)}${t2.padEnd(16)}${d}`).join("\n")}`}
      </pre>
      <p className="gate-note">A selection of the members, in Get-Member's layout (the real lists are longer). Written from the .NET types, not captured.</p>
    </div>
  );
}

// ---- Execution policy ------------------------------------------------------------------------

type Policy = "Restricted" | "AllSigned" | "RemoteSigned" | "Unrestricted" | "Bypass";
type Origin = "local" | "downloaded" | "downloaded-unblocked";

export function ExecutionPolicy() {
  const [policy, setPolicy] = useState<Policy>("RemoteSigned");
  const [origin, setOrigin] = useState<Origin>("downloaded");
  const [signed, setSigned] = useState(false);
  const path = origin === "local" ? "C:\\Scripts\\cleanup.ps1" : "C:\\Users\\ana\\Downloads\\fix-printer.ps1";
  const internet = origin === "downloaded";
  let verdict: "runs" | "blocked" | "prompt";
  let message = "";
  if (policy === "Bypass") verdict = "runs";
  else if (policy === "Restricted") {
    verdict = "blocked";
    message = `File ${path} cannot be loaded because running scripts is disabled on this system. For more information, see about_Execution_Policies at https://go.microsoft.com/fwlink/?LinkID=135170.`;
  } else if (policy === "AllSigned") {
    verdict = signed ? "runs" : "blocked";
    if (!signed) message = `File ${path} cannot be loaded. The file ${path} is not digitally signed. You cannot run this script on the current system. For more information about running scripts and setting execution policy, see about_Execution_Policies at https://go.microsoft.com/fwlink/?LinkID=135170.`;
  } else if (policy === "RemoteSigned") {
    verdict = !internet || signed ? "runs" : "blocked";
    if (verdict === "blocked") message = `File ${path} cannot be loaded. The file ${path} is not digitally signed. You cannot run this script on the current system. For more information about running scripts and setting execution policy, see about_Execution_Policies at https://go.microsoft.com/fwlink/?LinkID=135170.`;
  } else {
    verdict = internet && !signed ? "prompt" : "runs";
    if (verdict === "prompt") message = `Security warning\nRun only scripts that you trust. While scripts from the internet can be useful, this script can potentially harm your computer. If you trust this script, use the Unblock-File cmdlet to allow the script to run without this warning message. Do you want to run ${path}?\n[D] Do not run  [R] Run once  [S] Suspend  [?] Help (default is "D"):`;
  }
  const explain: Record<Policy, string> = {
    Restricted: "No scripts at all; you can still type commands. The default on Windows desktop editions.",
    AllSigned: "Every script must be signed by a publisher you trust, including your own.",
    RemoteSigned: "Scripts written on this machine run; scripts that came from the internet must be signed. The default on Windows Server, and the usual choice.",
    Unrestricted: "Everything runs, but you're warned before running an unsigned script from the internet. Always the policy on Linux and macOS.",
    Bypass: "Nothing is checked and nothing is shown. Meant for automation that runs PowerShell inside another program.",
  };
  return (
    <div>
      <div className="ops-tool-row">
        <span className="ops-tool-name">policy</span>
        <div className="sql-presets">
          {(["Restricted", "AllSigned", "RemoteSigned", "Unrestricted", "Bypass"] as Policy[]).map((p) => (
            <button key={p} className={p === policy ? "active" : ""} onClick={() => setPolicy(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="ops-tool-row">
        <span className="ops-tool-name">script</span>
        <div className="sql-presets">
          <button className={origin === "local" ? "active" : ""} onClick={() => setOrigin("local")}>
            written on this PC
          </button>
          <button className={origin === "downloaded" ? "active" : ""} onClick={() => setOrigin("downloaded")}>
            downloaded from the internet
          </button>
          <button className={origin === "downloaded-unblocked" ? "active" : ""} onClick={() => setOrigin("downloaded-unblocked")}>
            downloaded, then Unblock-File
          </button>
          <button className={signed ? "active" : ""} onClick={() => setSigned(!signed)}>
            {signed ? "signed by a trusted publisher" : "not signed"}
          </button>
        </div>
      </div>
      <p className="lt-p">{explain[policy]}</p>
      <pre className="algo-code lt-code ops-output">
        {`PS C:\\> & '${path}'\n`}
        {verdict === "runs" ? (
          <span className="ops-ok">(the script runs)</span>
        ) : verdict === "prompt" ? (
          <span className="ops-warn">{message}</span>
        ) : (
          <span className="ops-bad">{message}</span>
        )}
      </pre>
      <p className="gate-note">
        Downloaded files carry a hidden marker, the Mark of the Web (a Zone.Identifier alternate data stream), which is how PowerShell knows where a script
        came from; Unblock-File removes it. Messages follow PowerShell's documented wording; not captured on Windows.
      </p>
    </div>
  );
}

// ---- Active Directory --------------------------------------------------------------------------

interface AdNode {
  name: string;
  kind: "domain" | "ou" | "container" | "user" | "group" | "computer";
  children?: AdNode[];
  attrs?: Record<string, string>;
}

const AD_TREE: AdNode = {
  name: "conperio.local",
  kind: "domain",
  children: [
    { name: "Users", kind: "container", children: [{ name: "Administrator", kind: "user", attrs: { sAMAccountName: "Administrator", memberOf: "Domain Admins, Enterprise Admins" } }] },
    { name: "Computers", kind: "container", children: [] },
    { name: "Domain Controllers", kind: "ou", children: [{ name: "DC01", kind: "computer", attrs: { dNSHostName: "dc01.conperio.local", operatingSystem: "Windows Server 2025 Datacenter" } }, { name: "DC02", kind: "computer", attrs: { dNSHostName: "dc02.conperio.local", operatingSystem: "Windows Server 2025 Datacenter" } }] },
    {
      name: "Oslo",
      kind: "ou",
      children: [
        {
          name: "Users",
          kind: "ou",
          children: [
            { name: "Ana Berg", kind: "user", attrs: { sAMAccountName: "ana", userPrincipalName: "ana@conperio.com", title: "Controller", memberOf: "GG-Finance-Oslo" } },
            { name: "Bo Li", kind: "user", attrs: { sAMAccountName: "bo", userPrincipalName: "bo@conperio.com", title: "Automation engineer", memberOf: "GG-Engineering" } },
          ],
        },
        { name: "Workstations", kind: "ou", children: [{ name: "LAPTOP-ANA17", kind: "computer", attrs: { dNSHostName: "laptop-ana17.conperio.local", operatingSystem: "Windows 11 Enterprise" } }] },
        { name: "Servers", kind: "ou", children: [{ name: "FS01", kind: "computer", attrs: { dNSHostName: "fs01.conperio.local", operatingSystem: "Windows Server 2025 Standard" } }] },
      ],
    },
    {
      name: "Groups",
      kind: "ou",
      children: [
        { name: "GG-Finance-Oslo", kind: "group", attrs: { groupScope: "Global", groupCategory: "Security", member: "Ana Berg", memberOf: "DL-FS01-Finance-Modify" } },
        { name: "GG-Engineering", kind: "group", attrs: { groupScope: "Global", groupCategory: "Security", member: "Bo Li" } },
        { name: "DL-FS01-Finance-Modify", kind: "group", attrs: { groupScope: "DomainLocal", groupCategory: "Security", member: "GG-Finance-Oslo", usedFor: "Modify on \\\\FS01\\Finance (NTFS)" } },
      ],
    },
    { name: "Service Accounts", kind: "ou", children: [{ name: "svc-academy-api", kind: "user", attrs: { sAMAccountName: "svc-academy-api", description: "Runs the Academy API service on WEB01", memberOf: "(none)" } }] },
  ],
};

function dnOf(path: AdNode[]): string {
  const parts: string[] = [];
  for (let i = path.length - 1; i >= 1; i--) {
    const n = path[i];
    parts.push(`${n.kind === "ou" ? "OU" : "CN"}=${n.name}`);
  }
  return [...parts, "DC=conperio", "DC=local"].join(",");
}

const ICON: Record<AdNode["kind"], string> = { domain: "◆", ou: "▣", container: "▢", user: "👤", group: "👥", computer: "🖥" };

export function AdExplorer() {
  const [sel, setSel] = useState<string[]>(["Oslo", "Users", "Ana Berg"]);
  const [inGG, setInGG] = useState(true);
  const [nested, setNested] = useState(true);
  const [loggedOff, setLoggedOff] = useState(true);
  const path = useMemo(() => {
    const out: AdNode[] = [AD_TREE];
    let cur = AD_TREE;
    for (const s of sel) {
      const next = cur.children?.find((c) => c.name === s);
      if (!next) break;
      out.push(next);
      cur = next;
    }
    return out;
  }, [sel]);
  const node = path[path.length - 1];
  function render(n: AdNode, trail: string[], depth: number): ReactNode {
    const key = trail.join("/");
    const active = key === sel.join("/");
    return (
      <li key={key || "root"}>
        <button className={`link-button ops-ad-node ${active ? "ops-ad-active" : ""}`} style={{ paddingLeft: depth * 14 }} onClick={() => setSel(trail)}>
          <span aria-hidden="true">{ICON[n.kind]}</span> {n.name}
        </button>
        {n.children && n.children.length > 0 && <ul className="ops-ad-tree">{n.children.map((c) => render(c, [...trail, c.name], depth + 1))}</ul>}
      </li>
    );
  }
  const access = inGG && nested && loggedOff;
  return (
    <div>
      <div className="ops-ad">
        <ul className="ops-ad-tree ops-ad-root">{render(AD_TREE, [], 0)}</ul>
        <div className="ops-card ops-ad-detail">
          <strong>
            {ICON[node.kind]} {node.name}
          </strong>{" "}
          <span className="ops-note-inline">({node.kind === "ou" ? "organizational unit" : node.kind})</span>
          <pre className="algo-code lt-code">
            {node.kind === "domain"
              ? "distinguishedName : DC=conperio,DC=local\nDNSRoot           : conperio.local\nNetBIOSName       : CONPERIO"
              : `distinguishedName : ${dnOf(path)}` +
                Object.entries(node.attrs ?? {})
                  .map(([k, v]) => `\n${k.padEnd(18)}: ${v}`)
                  .join("")}
          </pre>
          <p className="gate-note">
            {node.kind === "ou"
              ? "An OU is a folder you create to organise objects and to link Group Policy to. Moving a user between OUs changes which policies apply, not what they can access."
              : node.kind === "container"
                ? "Built-in containers (CN=Users, CN=Computers) aren't OUs: you can't link Group Policy to them, which is why companies move objects into their own OUs."
                : node.kind === "group"
                  ? "Groups grant access. Scope decides where members can come from and where the group can be used."
                  : node.kind === "computer"
                    ? "Computers have accounts too: joining a PC to the domain creates this object, and the machine logs on with its own password."
                    : node.kind === "user"
                      ? "sAMAccountName is the old-style logon name (CONPERIO\\ana); userPrincipalName is the email-style one."
                      : "The domain: one directory database, replicated between the domain controllers."}
          </p>
        </div>
      </div>
      <h4 className="ops-subhead">Can Ana save a file on \\FS01\Finance? (AGDLP)</h4>
      <div className="ops-agdlp">
        <span className="ops-agdlp-box">Ana (account)</span>
        <button className={`ops-agdlp-link ${inGG ? "on" : "off"}`} onClick={() => setInGG(!inGG)}>
          {inGG ? "member of →" : "not a member ✕"}
        </button>
        <span className="ops-agdlp-box">GG-Finance-Oslo (global)</span>
        <button className={`ops-agdlp-link ${nested ? "on" : "off"}`} onClick={() => setNested(!nested)}>
          {nested ? "member of →" : "not a member ✕"}
        </button>
        <span className="ops-agdlp-box">DL-FS01-Finance-Modify (domain local)</span>
        <span className="ops-agdlp-link on">has Modify on →</span>
        <span className="ops-agdlp-box">\\FS01\Finance</span>
      </div>
      <div className="sql-presets">
        <button className={loggedOff ? "active" : ""} onClick={() => setLoggedOff(!loggedOff)}>
          {loggedOff ? "Ana has signed in since the change" : "Ana is still in the session she started before the change"}
        </button>
      </div>
      <p className={access ? "constraint-ok" : "constraint-fail"}>
        {access
          ? "Yes. Her sign-in ticket lists both groups, and the domain local group is on the folder's ACL."
          : !loggedOff && inGG && nested
            ? "Not yet. Group memberships are read when you sign in (they're baked into the Kerberos ticket), so she has to sign out and back in, or wait for a new ticket."
            : "No. The chain from Ana to the permission is broken."}
      </p>
    </div>
  );
}

// ---- Group Policy precedence ------------------------------------------------------------------

interface Gpo {
  id: string;
  name: string;
  level: "Local" | "Site" | "Domain" | "OU: Oslo" | "OU: Oslo/Workstations";
  value: number | null; // screen lock minutes; null = not configured
  enforced: boolean;
  linked: boolean;
}

const START_GPOS: Gpo[] = [
  { id: "l", name: "Local Group Policy", level: "Local", value: 30, enforced: false, linked: true },
  { id: "s", name: "Oslo-Site Defaults", level: "Site", value: null, enforced: false, linked: true },
  { id: "d", name: "Default Domain Policy", level: "Domain", value: 15, enforced: false, linked: true },
  { id: "o", name: "Oslo Baseline", level: "OU: Oslo", value: 10, enforced: false, linked: true },
  { id: "w", name: "Oslo Workstations", level: "OU: Oslo/Workstations", value: 5, enforced: false, linked: true },
];

export function GpoPrecedence() {
  const [gpos, setGpos] = useState<Gpo[]>(START_GPOS);
  const [block, setBlock] = useState(false);
  const set = (id: string, patch: Partial<Gpo>) => setGpos(gpos.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  // Processing order: Local, Site, Domain, parent OU, child OU; later wins. Block Inheritance on
  // the Workstations OU drops everything above it except Enforced links (and the local policy).
  // Enforced links are applied after everything else, the highest level last, so it wins.
  const active = gpos.filter((g) => g.linked && (!block || g.level === "Local" || g.level === "OU: Oslo/Workstations" || g.enforced));
  const normal = active.filter((g) => !g.enforced);
  const enforced = active.filter((g) => g.enforced).reverse();
  const order = [...normal, ...enforced];
  let winner: Gpo | null = null;
  for (const g of order) if (g.value !== null) winner = g;
  const blocked = gpos.filter((g) => g.linked && !active.includes(g));
  return (
    <div>
      <p className="lt-p">
        The setting is <strong>screen lock after N minutes of inactivity</strong>, for laptop LAPTOP-ANA17 in OU Oslo/Workstations.
      </p>
      <div className="cm-scroll">
        <table className="bigo-table ops-table">
          <thead>
            <tr>
              <th>Linked at</th>
              <th>GPO</th>
              <th>Screen lock</th>
              <th>Link enabled</th>
              <th>Enforced</th>
            </tr>
          </thead>
          <tbody>
            {gpos.map((g) => (
              <tr key={g.id} className={!g.linked || blocked.includes(g) ? "ops-dim" : winner?.id === g.id ? "cm-row-on" : ""}>
                <td>{g.level}</td>
                <td>{g.name}</td>
                <td>
                  <select
                    className="ops-select"
                    value={g.value ?? ""}
                    aria-label={`${g.name} screen lock`}
                    onChange={(e) => set(g.id, { value: e.target.value === "" ? null : Number(e.target.value) })}
                  >
                    <option value="">Not configured</option>
                    {[5, 10, 15, 30].map((v) => (
                      <option key={v} value={v}>
                        {v} min
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input type="checkbox" checked={g.linked} onChange={() => set(g.id, { linked: !g.linked })} aria-label={`${g.name} link enabled`} />
                </td>
                <td>
                  {g.level === "Local" ? (
                    "n/a"
                  ) : (
                    <input type="checkbox" checked={g.enforced} onChange={() => set(g.id, { enforced: !g.enforced })} aria-label={`${g.name} enforced`} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sql-presets">
        <button className={block ? "active" : ""} onClick={() => setBlock(!block)}>
          {block ? "Block Inheritance is ON for OU Oslo/Workstations" : "Block Inheritance is off for OU Oslo/Workstations"}
        </button>
        <button
          onClick={() => {
            setGpos(START_GPOS);
            setBlock(false);
          }}
        >
          reset
        </button>
      </div>
      <p className={winner ? "constraint-ok" : "lt-p"}>
        {winner ? `Result: lock after ${winner.value} minutes, from "${winner.name}".` : "Result: not configured by any policy, so Windows' default applies."}
      </p>
      <p className="gate-note">
        Applied in this order (later overrides earlier): {order.map((g) => g.name + (g.enforced ? " [enforced]" : "")).join(" → ") || "nothing"}
        {blocked.length > 0 && `. Blocked: ${blocked.map((g) => g.name).join(", ")}.`}
      </p>
    </div>
  );
}

// ---- Bash vs PowerShell ------------------------------------------------------------------------

const PAIRS: { topic: string; task: string; bash: string; ps: string }[] = [
  { topic: "files", task: "Where am I? / change folder", bash: "pwd; cd /var/log", ps: "Get-Location; Set-Location C:\\Logs   (aliases: pwd, cd)" },
  { topic: "files", task: "List files, including hidden", bash: "ls -la", ps: "Get-ChildItem -Force   (aliases: ls, dir, gci)" },
  { topic: "files", task: "Find files by name, recursively", bash: "find . -name '*.log'", ps: "Get-ChildItem -Recurse -Filter *.log" },
  { topic: "files", task: "Copy, move, delete", bash: "cp a b; mv a b; rm -r dir", ps: "Copy-Item a b; Move-Item a b; Remove-Item dir -Recurse" },
  { topic: "files", task: "Make a folder (and parents)", bash: "mkdir -p a/b/c", ps: "New-Item -ItemType Directory a\\b\\c   (creates parents)" },
  { topic: "files", task: "Show a file", bash: "cat notes.txt", ps: "Get-Content notes.txt   (alias: cat, gc)" },
  { topic: "files", task: "Last 20 lines, and follow", bash: "tail -n 20 -f app.log", ps: "Get-Content app.log -Tail 20 -Wait" },
  { topic: "text", task: "Search for text in files", bash: "grep -ri timeout /var/log", ps: "Select-String -Path C:\\Logs\\*.log -Pattern timeout   (case-insensitive by default)" },
  { topic: "text", task: "Count lines", bash: "wc -l app.log", ps: "(Get-Content app.log).Count   or   Get-Content app.log | Measure-Object -Line" },
  { topic: "text", task: "Replace text", bash: "sed 's/old/new/g' f", ps: "(Get-Content f) -replace 'old', 'new'" },
  { topic: "text", task: "Sort and count repeats", bash: "sort | uniq -c | sort -rn", ps: "Group-Object | Sort-Object Count -Descending" },
  { topic: "text", task: "First 5 results", bash: "head -n 5", ps: "Select-Object -First 5" },
  { topic: "text", task: "Filter rows", bash: "awk -F, '$4 > 60' servers.csv", ps: "Import-Csv servers.csv | Where-Object { [int]$_.cpu -gt 60 }" },
  { topic: "text", task: "Pick columns", bash: "cut -d, -f1,5 servers.csv", ps: "Import-Csv servers.csv | Select-Object host, status" },
  { topic: "text", task: "Parse JSON", bash: "curl -s URL | jq '.items[].name'", ps: "(Invoke-RestMethod URL).items.name" },
  { topic: "processes", task: "List processes", bash: "ps aux", ps: "Get-Process   (alias: ps)" },
  { topic: "processes", task: "Top 5 by memory", bash: "ps aux --sort=-rss | head -n 6", ps: "Get-Process | Sort-Object WS -Descending | Select-Object -First 5" },
  { topic: "processes", task: "Stop a process", bash: "kill 4120; pkill chrome", ps: "Stop-Process -Id 4120; Stop-Process -Name chrome" },
  { topic: "services", task: "Service status", bash: "systemctl status nginx", ps: "Get-Service W3SVC" },
  { topic: "services", task: "Restart a service", bash: "sudo systemctl restart nginx", ps: "Restart-Service W3SVC   (in an elevated session)" },
  { topic: "services", task: "Start at boot", bash: "sudo systemctl enable nginx", ps: "Set-Service W3SVC -StartupType Automatic" },
  { topic: "services", task: "Recent errors in the logs", bash: "journalctl -p err --since today", ps: "Get-WinEvent -FilterHashtable @{LogName='System'; Level=2; StartTime=(Get-Date).Date}" },
  { topic: "network", task: "My IP addresses", bash: "ip -br addr", ps: "Get-NetIPAddress -AddressFamily IPv4" },
  { topic: "network", task: "Can I reach port 443?", bash: "nc -zv web01 443", ps: "Test-NetConnection web01 -Port 443" },
  { topic: "network", task: "Look up a name", bash: "dig +short web01.conperio.local", ps: "Resolve-DnsName web01.conperio.local" },
  { topic: "network", task: "Download a file", bash: "curl -fLO https://example.com/f.zip", ps: "Invoke-WebRequest https://example.com/f.zip -OutFile f.zip" },
  { topic: "scripting", task: "Variables", bash: "name=\"Ana\"; echo \"Hi $name\"", ps: "$name = \"Ana\"; \"Hi $name\"" },
  { topic: "scripting", task: "If", bash: "if [ \"$n\" -gt 5 ]; then ...; fi", ps: "if ($n -gt 5) { ... }" },
  { topic: "scripting", task: "Loop over items", bash: "for f in *.log; do echo \"$f\"; done", ps: "foreach ($f in Get-ChildItem *.log) { $f.Name }" },
  { topic: "scripting", task: "Did the last command work?", bash: "$?   (0 = success)", ps: "$?   (True/False)   and   $LASTEXITCODE for native programs" },
  { topic: "scripting", task: "Stop on errors", bash: "set -euo pipefail", ps: "$ErrorActionPreference = 'Stop'; Set-StrictMode -Version Latest" },
  { topic: "scripting", task: "Environment variable", bash: "echo $PATH; export X=1", ps: "$env:PATH; $env:X = '1'" },
  { topic: "scripting", task: "Get help", bash: "man grep; grep --help", ps: "Get-Help Select-String -Examples" },
  { topic: "remote", task: "Run a command on another machine", bash: "ssh web01 'systemctl status nginx'", ps: "Invoke-Command -ComputerName WEB01 { Get-Service W3SVC }" },
  { topic: "remote", task: "Interactive remote shell", bash: "ssh web01", ps: "Enter-PSSession WEB01" },
];

export function BashVsPs() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("all");
  const topics = ["all", ...new Set(PAIRS.map((p) => p.topic))];
  const needle = q.trim().toLowerCase();
  const rows = PAIRS.filter((p) => (topic === "all" || p.topic === topic) && (!needle || `${p.task} ${p.bash} ${p.ps}`.toLowerCase().includes(needle)));
  return (
    <div>
      <div className="lt-sheet-controls">
        <input className="lt-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. grep, service, port" aria-label="Search the table" />
        <div className="lt-chips">
          {topics.map((t) => (
            <button key={t} className={t === topic ? "active" : ""} onClick={() => setTopic(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="ops-pairs">
        {rows.map((p) => (
          <div key={p.task} className="lt-entry">
            <h4>{p.task}</h4>
            <div className="ops-pair">
              <span className="ops-pair-label ops-bash-label">bash</span>
              <code>{p.bash}</code>
            </div>
            <div className="ops-pair">
              <span className="ops-pair-label ops-ps-label">PowerShell</span>
              <code>{p.ps}</code>
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && <p className="lt-empty">Nothing matches.</p>}
      <p className="gate-note">{rows.length} of {PAIRS.length} shown. PowerShell 7 runs on Linux and macOS too; the Windows-only cmdlets (services, event logs, networking) are marked by what they manage.</p>
    </div>
  );
}
