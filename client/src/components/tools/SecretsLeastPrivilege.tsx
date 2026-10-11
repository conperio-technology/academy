import { useState } from "react";
import { LessonLink, Quiz, Tabs, type QuizItem } from "./netSecShared";

// Part 1: spot the secrets in a small repository. Part 2: grant a service account exactly the
// database permissions its job needs, and see what each extra permission would let an
// attacker do.

interface Line {
  text: string;
  secret?: string; // why it's a leak, if it is one
  decoy?: string; // why it looks like one but isn't
}

const FILES: { name: string; lines: Line[] }[] = [
  {
    name: "appsettings.json",
    lines: [
      { text: "{" },
      { text: '  "ConnectionStrings": {' },
      {
        text: '    "Reports": "Server=sql01;Database=Reports;User Id=report_app;Password=Pl4nt!Rep0rts;"',
        secret: "A database password committed to Git. Everyone with access to the repository, now and forever, has it.",
      },
      { text: "  }," },
      { text: '  "Logging": { "LogLevel": { "Default": "Information" } }' },
      { text: "}" },
    ],
  },
  {
    name: ".env",
    lines: [
      { text: "HISTORIAN_URL=https://historian.conperio.example", decoy: "A URL isn't secret on its own." },
      { text: "HISTORIAN_API_KEY=key_9f2c71d0a4be4e3c8d5a", secret: "A .env file holding a real key was committed. .env belongs in .gitignore." },
    ],
  },
  {
    name: "README.md",
    lines: [
      { text: "## Local setup" },
      {
        text: "dotnet user-secrets set \"ConnectionStrings:Reports\" \"Server=localhost;...;Password=<your-password>\"",
        decoy: "A placeholder, and the right advice: user-secrets keeps development secrets outside the repository.",
      },
    ],
  },
  {
    name: "ReportJob.cs",
    lines: [
      { text: "var token = await auth.GetTokenAsync();" },
      { text: 'logger.LogInformation("Calling historian with token {Token}", token);', secret: "Secrets in logs. Logs are copied widely and kept for months; log that a call happened, never the token." },
      {
        text: 'var url = $"https://historian.conperio.example/api/tags?api_key={key}";',
        secret: "A key in a URL ends up in proxy logs, browser history and server access logs. Send it in a header.",
      },
    ],
  },
  {
    name: "deploy.yml",
    lines: [
      { text: "env:" },
      { text: "  REPORTS_DB_PASSWORD: ${{ secrets.REPORTS_DB_PASSWORD }}", decoy: "Correct: the pipeline reads it from its secret store at run time." },
      { text: "  SMTP_PASSWORD: Summer2026!", secret: "A plain-text password in a pipeline file. Move it into the pipeline's secret store." },
    ],
  },
];

const SECRET_COUNT = FILES.flatMap((f) => f.lines).filter((l) => l.secret).length;

function FindSecrets() {
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const keyOf = (f: string, i: number) => `${f}:${i}`;
  const found = FILES.flatMap((f) => f.lines.map((l, i) => ({ l, k: keyOf(f.name, i) }))).filter((x) => x.l.secret && picked.includes(x.k)).length;
  return (
    <>
      <p className="gate-note">Click every line that leaks a secret, then check. There are {SECRET_COUNT}.</p>
      {FILES.map((f) => (
        <div key={f.name} className="ns-file">
          <div className="ns-file-name mono ns-small">{f.name}</div>
          {f.lines.map((l, i) => {
            const k = keyOf(f.name, i);
            const on = picked.includes(k);
            const verdict = checked ? (l.secret ? (on ? "ns-line-hit" : "ns-line-miss") : on ? "ns-line-false" : "") : on ? "ns-line-on" : "";
            return (
              <div key={k}>
                <button
                  className={`ns-line mono ${verdict}`}
                  disabled={checked}
                  aria-pressed={on}
                  onClick={() => setPicked(on ? picked.filter((x) => x !== k) : [...picked, k])}
                >
                  {l.text}
                </button>
                {checked && (l.secret || (on && l.decoy) || (l.decoy && !on)) && (
                  <p className={`ns-small ${l.secret ? (on ? "constraint-ok" : "constraint-fail") : on ? "constraint-fail" : "status-text"}`}>
                    {l.secret ? (on ? "Found: " : "Missed: ") + l.secret : (on ? "Not a leak: " : "") + l.decoy}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div className="darr-actions">
        {!checked ? (
          <button onClick={() => setChecked(true)}>Check</button>
        ) : (
          <button
            onClick={() => {
              setChecked(false);
              setPicked([]);
            }}
          >
            Start again
          </button>
        )}
      </div>
      {checked && (
        <p className="drill-statement">
          Found {found} of {SECRET_COUNT}. Deleting a secret in a new commit doesn&apos;t remove it from Git history: treat any committed secret as leaked and rotate it
          (issue a new one, revoke the old).
        </p>
      )}
    </>
  );
}

interface Perm {
  id: string;
  label: string;
  needed: boolean;
  risk: string;
}

const PERMS: Perm[] = [
  { id: "selOrders", label: "SELECT on dbo.Orders", needed: true, risk: "" },
  { id: "selMachines", label: "SELECT on dbo.Machines", needed: true, risk: "" },
  { id: "insReports", label: "INSERT on dbo.ShiftReports", needed: true, risk: "" },
  { id: "reader", label: "db_datareader (read every table)", needed: false, risk: "read every table, including Employees and Payroll" },
  { id: "writer", label: "db_datawriter (write every table)", needed: false, risk: "change or delete production orders" },
  { id: "delReports", label: "DELETE on dbo.ShiftReports", needed: false, risk: "erase the report history, covering their tracks" },
  { id: "owner", label: "db_owner", needed: false, risk: "drop tables, change permissions and read everything in the database" },
  { id: "sysadmin", label: "sysadmin (server role)", needed: false, risk: "control every database on the server and often run operating system commands through it" },
];

function LeastPrivilege() {
  const [granted, setGranted] = useState<string[]>(["owner"]);
  const g = PERMS.filter((p) => granted.includes(p.id));
  const has = (id: string) => granted.includes(id);
  const covers = (needId: string, broad: string[]) => has(needId) || broad.some(has);
  const works =
    covers("selOrders", ["reader", "owner", "sysadmin"]) && covers("selMachines", ["reader", "owner", "sysadmin"]) && covers("insReports", ["writer", "owner", "sysadmin"]);
  const extras = g.filter((p) => !p.needed);
  return (
    <>
      <p className="gate-note">
        The shift report service reads Orders and Machines and inserts one row into ShiftReports at the end of each shift. Its database login was created by someone in
        a hurry. Choose what it really needs.
      </p>
      <ul className="sdi-points prep-tasks">
        {PERMS.map((p) => (
          <li key={p.id}>
            <label>
              <input type="checkbox" checked={has(p.id)} onChange={(e) => setGranted(e.target.checked ? [...granted, p.id] : granted.filter((x) => x !== p.id))} />
              <span className="mono ns-small">{p.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className={works ? "constraint-ok" : "constraint-fail"}>{works ? "The service works." : "The service fails: it's missing a permission it needs."}</p>
      {extras.length > 0 ? (
        <div className="drill-feedback">
          <p>If an attacker steals this login (from a leaked config file, say), they could also:</p>
          <ul>
            {extras.map((p) => (
              <li key={p.id}>{p.risk}</li>
            ))}
          </ul>
        </div>
      ) : (
        works && <p className="constraint-ok">Least privilege: a stolen login can read two tables and add reports. That's the whole blast radius.</p>
      )}
    </>
  );
}

const QUIZ: QuizItem[] = [
  {
    q: "A developer notices they pushed an API key to a shared repository an hour ago. What's the most important step?",
    options: ["Delete the file in a new commit", "Revoke the key and issue a new one, then remove it from the code", "Make the repository private"],
    answer: 1,
    why: "Once pushed, assume it's copied: clones, forks, CI logs and secret-scanning bots all see it within minutes. Only rotation makes the leaked value useless.",
  },
  {
    q: "Where should a production database password live?",
    options: ["appsettings.Production.json in the repository", "A secrets manager (Azure Key Vault, AWS Secrets Manager, HashiCorp Vault, Kubernetes secrets) read at run time, or better, no password at all with a managed identity", "An environment variable typed into the deploy script"],
    answer: 1,
    why: "A secrets manager controls and audits who can read it and lets you rotate it. Managed identities (the platform vouches for the app) remove the password entirely.",
  },
  {
    q: "Which is least privilege for a Windows service that reads one folder?",
    options: ["Run it as LocalSystem", "Run it as a domain admin so it never hits permission errors", "A dedicated service account (or virtual account) with read access to that folder only"],
    answer: 2,
    why: "If the service is compromised, the attacker gets exactly what the account has. LocalSystem and domain admin turn one bug into control of the machine or the domain.",
  },
];

export function SecretsLeastPrivilege() {
  const [tab, setTab] = useState<"secrets" | "privilege">("secrets");
  return (
    <div className="tool-widget">
      <Tabs
        tabs={[
          { id: "secrets", label: "Find the leaked secrets" },
          { id: "privilege", label: "Least privilege" },
        ]}
        value={tab}
        onChange={setTab}
      />
      <div className="crypto-section">{tab === "secrets" ? <FindSecrets /> : <LeastPrivilege />}</div>
      <Quiz items={QUIZ} title="Check yourself" />
      <p className="gate-note">
        Encrypting secrets at rest and in transit is covered in <LessonLink id="security-hashing-encryption">Hashing vs. Encryption</LessonLink>.
      </p>
    </div>
  );
}
