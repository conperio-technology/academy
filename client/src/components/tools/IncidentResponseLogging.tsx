import { useMemo, useState } from "react";
import { LessonLink, Tabs } from "./netSecShared";

// Part 1: tune a detection rule over an SSH log and see what it catches and what it misses.
// Part 2: a ransomware tabletop exercise, one decision per incident response phase.

interface Event {
  t: number; // minutes after 02:00
  ok: boolean;
  user: string;
  ip: string;
  invalid?: boolean;
}

function buildLog(): Event[] {
  const ev: Event[] = [];
  // Brute force: 24 quick failures from one address, then a success on a service account.
  const users = ["admin", "root", "test", "svc_backup", "oracle", "ubuntu"];
  for (let i = 0; i < 24; i++) ev.push({ t: 14 + i * 0.15, ok: false, user: users[i % users.length], ip: "203.0.113.45", invalid: !["root", "svc_backup"].includes(users[i % users.length]) });
  ev.push({ t: 17.8, ok: true, user: "svc_backup", ip: "203.0.113.45" });
  // Password spraying: one attempt per user, every 3 minutes, from one address.
  const staff = ["ava", "ben", "chen", "dana", "erik", "fatima", "gus", "hana", "ivan", "jonas", "kai", "lena"];
  staff.forEach((u, i) => ev.push({ t: 20 + i * 3, ok: false, user: u, ip: "198.51.100.77" }));
  // A real user mistyping, then getting in.
  ev.push({ t: 31, ok: false, user: "jonas", ip: "10.10.4.21" }, { t: 31.4, ok: false, user: "jonas", ip: "10.10.4.21" }, { t: 31.9, ok: true, user: "jonas", ip: "10.10.4.21" });
  // A monitoring job that logs in every 10 minutes.
  for (let i = 0; i < 6; i++) ev.push({ t: 5 + i * 10, ok: true, user: "nagios", ip: "10.10.1.5" });
  // Someone whose saved password is old: six failures over an hour from the office.
  for (let i = 0; i < 6; i++) ev.push({ t: 2 + i * 9, ok: false, user: "dana", ip: "10.10.4.33" });
  return ev.sort((a, b) => a.t - b.t);
}

const LOG = buildLog();

function stamp(t: number) {
  const total = Math.floor(t * 60);
  const h = 2 + Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `Oct 10 ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function line(e: Event, i: number) {
  const pid = 4100 + i * 7;
  return e.ok
    ? `${stamp(e.t)} jump01 sshd[${pid}]: Accepted password for ${e.user} from ${e.ip} port ${40000 + i * 13} ssh2`
    : `${stamp(e.t)} jump01 sshd[${pid}]: Failed password for ${e.invalid ? "invalid user " : ""}${e.user} from ${e.ip} port ${40000 + i * 13} ssh2`;
}

type GroupBy = "ip" | "user";

interface Alert {
  key: string;
  at: number;
  count: number;
  kind: "threshold" | "success-after";
}

function detect(threshold: number, window: number, groupBy: GroupBy, successAfter: boolean): Alert[] {
  const alerts: Alert[] = [];
  const fired = new Set<string>();
  LOG.forEach((e, i) => {
    const key = groupBy === "ip" ? e.ip : e.user;
    const recent = LOG.slice(0, i + 1).filter((x) => !x.ok && (groupBy === "ip" ? x.ip : x.user) === key && x.t > e.t - window);
    if (!e.ok && recent.length >= threshold && !fired.has(`t:${key}`)) {
      fired.add(`t:${key}`);
      alerts.push({ key, at: e.t, count: recent.length, kind: "threshold" });
    }
    if (successAfter && e.ok && recent.length >= 3 && !fired.has(`s:${key}`)) {
      fired.add(`s:${key}`);
      alerts.push({ key, at: e.t, count: recent.length, kind: "success-after" });
    }
  });
  return alerts;
}

const ACTORS: { id: string; label: string; match: (a: Alert) => boolean; bad: boolean }[] = [
  { id: "brute", label: "Brute force from 203.0.113.45 that got in as svc_backup", match: (a) => a.key === "203.0.113.45" || a.key === "svc_backup", bad: true },
  { id: "spray", label: "Password spraying from 198.51.100.77 (12 users, one try each)", match: (a) => a.key === "198.51.100.77", bad: true },
  { id: "typo", label: "Jonas mistyping twice, then logging in", match: (a) => a.key === "10.10.4.21" || a.key === "jonas", bad: false },
  { id: "stale", label: "Dana's laptop retrying an old saved password", match: (a) => a.key === "10.10.4.33" || a.key === "dana", bad: false },
];

function Detection() {
  const [threshold, setThreshold] = useState(5);
  const [window, setWindow] = useState(5);
  const [groupBy, setGroupBy] = useState<GroupBy>("ip");
  const [successAfter, setSuccessAfter] = useState(false);
  const alerts = useMemo(() => detect(threshold, window, groupBy, successAfter), [threshold, window, groupBy, successAfter]);
  return (
    <>
      <p className="gate-note">
        An hour of the SSH log on a jump host (the one server you connect to before reaching others). Write a detection rule and see what it catches.
      </p>
      <pre className="algo-code ns-log">{LOG.map(line).join("\n")}</pre>
      <div className="tool-inputs">
        <label>
          Alert after N failures
          <input type="number" min={2} max={30} value={threshold} onChange={(e) => setThreshold(Math.max(2, Math.min(30, Number(e.target.value) || 5)))} />
        </label>
        <label>
          within (minutes)
          <input type="number" min={1} max={60} value={window} onChange={(e) => setWindow(Math.max(1, Math.min(60, Number(e.target.value) || 5)))} />
        </label>
      </div>
      <Tabs
        tabs={[
          { id: "ip", label: "Count per source IP" },
          { id: "user", label: "Count per username" },
        ]}
        value={groupBy}
        onChange={setGroupBy}
      />
      <label className="tool-checkbox">
        <input type="checkbox" checked={successAfter} onChange={(e) => setSuccessAfter(e.target.checked)} /> Also alert on a success after 3 or more recent failures
      </label>
      <ul className="ns-plain-list">
        {ACTORS.map((a) => {
          const hit = alerts.some(a.match);
          const good = hit === a.bad;
          return (
            <li key={a.id} className={good ? "constraint-ok" : "constraint-fail"}>
              {hit ? (a.bad ? "Caught: " : "False alarm: ") : a.bad ? "Missed: " : "Correctly quiet: "}
              {a.label}
            </li>
          );
        })}
      </ul>
      {alerts.length > 0 && (
        <div className="cm-scroll">
          <table className="bigo-table">
            <thead>
              <tr>
                <th>Alert time</th>
                <th>{groupBy === "ip" ? "Source" : "User"}</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={`${a.kind}-${a.key}`}>
                  <td className="mono">{stamp(a.at).slice(7)}</td>
                  <td className="mono">{a.key}</td>
                  <td>{a.kind === "threshold" ? `${a.count} failures in ${window} min` : `successful login after ${a.count} recent failures`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="gate-note">
        Spraying is built to stay under limits: counted per username it never shows up, because each account sees one attempt. Counted per source address, a longer
        window catches it, but set the window too long or the threshold too low and Dana&apos;s retries start to alert. Real detections in a SIEM (security
        information and event management system) combine signals, such as how many different usernames one address tried. And the alert that matters most here
        is a success after many failures: that&apos;s an attacker who got in.
      </p>
    </>
  );
}

interface Decision {
  phase: string;
  situation: string;
  options: { text: string; good: boolean; why: string }[];
}

const TABLETOP: Decision[] = [
  {
    phase: "Preparation",
    situation: "Before anything happens: which of these helps most when ransomware hits the plant?",
    options: [
      { text: "Offline or immutable backups, restore tested this quarter, and a printed contact list", good: true, why: "If the network and email are encrypted, you need backups the attacker couldn't reach and phone numbers on paper." },
      { text: "A bigger antivirus licence", good: false, why: "Useful, but ransomware crews routinely disable antivirus first. Backups and a plan are what get you running again." },
    ],
  },
  {
    phase: "Detection and analysis",
    situation: "06:40. The night shift calls: HMI screens show a ransom note, and the file server is full of .locked files.",
    options: [
      { text: "Declare an incident, start a timeline, call the incident lead and IT security", good: true, why: "Writing down what you see and when, from the first minute, makes every later decision and report easier." },
      { text: "Reboot the HMIs to see if the note goes away", good: false, why: "Rebooting destroys evidence in memory and may finish the encryption. Keep running machines on, and isolate them instead." },
    ],
  },
  {
    phase: "Containment",
    situation: "Encryption is still spreading across office servers.",
    options: [
      { text: "Isolate: pull affected machines and the office-to-plant links off the network, keep them powered on", good: true, why: "Containment first stops the spread. Breaking the office to production conduit protects the control system even if the office is lost." },
      { text: "Pay the ransom quickly to stop it", good: false, why: "Payment doesn't stop spreading encryption, is a management and legal decision, and often doesn't get everything back." },
    ],
  },
  {
    phase: "Eradication and recovery",
    situation: "The spread has stopped. How do you bring systems back?",
    options: [
      { text: "Rebuild from known-good images, restore data from clean backups, reset credentials, and bring systems back in order with monitoring", good: true, why: "Attackers usually have persistence and stolen passwords. Restoring onto a compromised system invites a second round." },
      { text: "Run a cleanup tool on each server and switch them back on", good: false, why: "You can't be sure a cleaned system is clean. Rebuild, and change every password the attacker could have seen." },
    ],
  },
  {
    phase: "Post-incident activity",
    situation: "Production runs again. What now?",
    options: [
      { text: "A blameless review within two weeks: timeline, root cause (how they got in), what worked, and owned actions", good: true, why: "Lessons learned is the phase most often skipped and the one that stops it happening again. Regulators and insurers will also ask." },
      { text: "Close the ticket; everyone is tired", good: false, why: "Without a root cause the same gap stays open." },
    ],
  },
];

function Tabletop() {
  const [picks, setPicks] = useState<Record<number, number>>({});
  const score = TABLETOP.filter((d, i) => picks[i] !== undefined && d.options[picks[i]].good).length;
  return (
    <>
      <p className="gate-note">
        A tabletop exercise is a walk-through of an incident on paper, done before you need it. Pick what you&apos;d do at each phase of the incident response
        lifecycle (from NIST SP 800-61; its 2025 revision maps the same work onto the NIST Cybersecurity Framework functions).
      </p>
      <ol className="cm-quiz">
        {TABLETOP.map((d, i) => (
          <li key={d.phase}>
            <p>
              <strong>{d.phase}.</strong> {d.situation}
            </p>
            <div className="drill-options">
              {d.options.map((o, k) => (
                <button
                  key={o.text}
                  className={`drill-option ${picks[i] === undefined ? "" : o.good ? "correct" : picks[i] === k ? "wrong" : "dim"}`}
                  disabled={picks[i] !== undefined}
                  onClick={() => setPicks({ ...picks, [i]: k })}
                >
                  {o.text}
                </button>
              ))}
            </div>
            {picks[i] !== undefined && <p className={d.options[picks[i]].good ? "constraint-ok" : "constraint-fail"}>{d.options[picks[i]].why}</p>}
          </li>
        ))}
      </ol>
      {Object.keys(picks).length === TABLETOP.length && (
        <p className="drill-statement">
          {score} of {TABLETOP.length} good calls.{" "}
          <button className="link-button" onClick={() => setPicks({})}>
            Run it again
          </button>
        </p>
      )}
    </>
  );
}

export function IncidentResponseLogging() {
  const [tab, setTab] = useState<"detect" | "tabletop">("detect");
  return (
    <div className="tool-widget">
      <Tabs
        tabs={[
          { id: "detect", label: "Write a detection rule" },
          { id: "tabletop", label: "Ransomware tabletop" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="crypto-section">{tab === "detect" ? <Detection /> : <Tabletop />}</div>
      <div className="crypto-section">
        <h3>What to log, and what never to log</h3>
        <div className="ns-two-col">
          <div>
            <p>
              <strong>Log</strong>
            </p>
            <ul className="ns-small">
              <li>Sign-ins, failures, lockouts and MFA events, with user, source address and time</li>
              <li>Permission and role changes, new accounts, password resets</li>
              <li>Admin actions and configuration changes (including PLC program downloads)</li>
              <li>Access denied events (403s), input validation failures</li>
              <li>Firewall and VPN connections at the network edge and between zones</li>
            </ul>
          </div>
          <div>
            <p>
              <strong>Never log</strong>
            </p>
            <ul className="ns-small">
              <li>Passwords, even wrong ones (often a typo of the right one)</li>
              <li>Session cookies, access tokens, API keys</li>
              <li>Full card numbers and other regulated personal data</li>
            </ul>
            <p className="ns-small">
              Keep clocks in sync with NTP and log in UTC, or timelines across systems won&apos;t line up. Ship logs off the machine, since attackers delete local
              ones.
            </p>
          </div>
        </div>
        <p className="gate-note">
          Securing the plant side, where many of these logs come from: <LessonLink id="sec-ot-ics-security">OT/ICS Security</LessonLink>.
        </p>
      </div>
    </div>
  );
}
