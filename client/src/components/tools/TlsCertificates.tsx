import { useState } from "react";

// A browser's certificate checks, run against a made-up chain. Each scenario breaks one
// thing so you can see which check catches it and what the user would see.

interface Cert {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  names?: string[]; // Subject Alternative Names, leaf only
  isCa: boolean;
}

const ROOT: Cert = {
  subject: "Example Root CA",
  issuer: "Example Root CA",
  validFrom: "2015-01-01",
  validTo: "2040-01-01",
  isCa: true,
};
const INTERMEDIATE: Cert = {
  subject: "Example TLS Issuing CA 2",
  issuer: "Example Root CA",
  validFrom: "2023-01-01",
  validTo: "2030-01-01",
  isCa: true,
};
const LEAF: Cert = {
  subject: "academy.conperio.com",
  issuer: "Example TLS Issuing CA 2",
  validFrom: "2026-03-01",
  validTo: "2027-03-01",
  names: ["academy.conperio.com"],
  isCa: false,
};

interface Scenario {
  id: string;
  label: string;
  url: string;
  chain: Cert[]; // leaf first
  trustedRoots: string[];
  today: string;
  sentIntermediate: boolean;
}

const BASE: Omit<Scenario, "id" | "label"> = {
  url: "https://academy.conperio.com",
  chain: [LEAF, INTERMEDIATE, ROOT],
  trustedRoots: [ROOT.subject],
  today: "2026-10-09",
  sentIntermediate: true,
};

const SCENARIOS: Scenario[] = [
  { id: "ok", label: "Everything correct", ...BASE },
  { id: "expired", label: "Certificate expired", ...BASE, today: "2027-04-15" },
  { id: "host", label: "Wrong hostname", ...BASE, url: "https://training.conperio.com" },
  {
    id: "self",
    label: "Self-signed",
    ...BASE,
    chain: [{ ...LEAF, issuer: LEAF.subject }],
  },
  { id: "missing", label: "Server forgot the intermediate", ...BASE, sentIntermediate: false },
];

interface Check {
  label: string;
  ok: boolean;
  detail: string;
  browserError?: string;
}

function runChecks(s: Scenario): Check[] {
  const leaf = s.chain[0];
  const host = new URL(s.url).hostname;
  const checks: Check[] = [];

  // 1. Can we build a path from the leaf up to a root we already trust?
  const sent = s.sentIntermediate ? s.chain : [leaf];
  let path: Cert[] = [leaf];
  let current = leaf;
  while (current.issuer !== current.subject) {
    const parent =
      sent.find((c) => c.subject === current.issuer) ??
      (s.trustedRoots.includes(current.issuer) ? s.chain.find((c) => c.subject === current.issuer) : undefined);
    if (!parent) break;
    path = [...path, parent];
    current = parent;
  }
  const top = path[path.length - 1];
  const chainOk = top.issuer === top.subject && s.trustedRoots.includes(top.subject);
  checks.push({
    label: "Chain leads to a trusted root",
    ok: chainOk,
    detail: chainOk
      ? `${path.map((c) => c.subject).join(" → ")}, and "${top.subject}" is in the browser's built-in list of trusted roots.`
      : top.issuer === top.subject
        ? `"${top.subject}" signed itself, and it isn't in the trusted root list. Anyone can make a certificate like this.`
        : `The server only sent "${leaf.subject}". Its issuer "${leaf.issuer}" is unknown, so there's no path to a trusted root.`,
    browserError: top.issuer === top.subject ? "NET::ERR_CERT_AUTHORITY_INVALID" : "NET::ERR_CERT_AUTHORITY_INVALID (incomplete chain)",
  });

  // 2. Is today inside every certificate's validity window?
  const expired = path.find((c) => s.today < c.validFrom || s.today > c.validTo);
  checks.push({
    label: "Every certificate is in date",
    ok: !expired,
    detail: expired
      ? `"${expired.subject}" is valid ${expired.validFrom} to ${expired.validTo}, but today is ${s.today}.`
      : `Today (${s.today}) is inside every certificate's validity window.`,
    browserError: "NET::ERR_CERT_DATE_INVALID",
  });

  // 3. Does the leaf actually name the site we asked for?
  const hostOk = (leaf.names ?? []).includes(host);
  checks.push({
    label: "Certificate names this site",
    ok: hostOk,
    detail: hostOk
      ? `You asked for ${host}, and the certificate lists ${leaf.names!.join(", ")}.`
      : `You asked for ${host}, but the certificate is only for ${(leaf.names ?? []).join(", ")}.`,
    browserError: "NET::ERR_CERT_COMMON_NAME_INVALID",
  });

  return checks;
}

export function TlsCertificates() {
  const [scenarioId, setScenarioId] = useState("ok");
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const checks = runChecks(scenario);
  const firstFailure = checks.find((c) => !c.ok);
  const shown = scenario.sentIntermediate ? scenario.chain : [scenario.chain[0]];

  return (
    <div className="tool-widget">
      <div className="sql-presets">
        {SCENARIOS.map((s) => (
          <button key={s.id} className={s.id === scenarioId ? "active" : ""} onClick={() => setScenarioId(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <p className="gate-note">
        Browser visits <code>{scenario.url}</code> on {scenario.today}. The server sends:
      </p>
      <div className="tls-chain">
        {shown.map((c, i) => (
          <div key={i} className="tls-cert">
            <strong>{c.subject}</strong>
            <span>issued by {c.issuer}</span>
            <span>
              valid {c.validFrom} → {c.validTo}
            </span>
            {c.names && <span>names: {c.names.join(", ")}</span>}
          </div>
        ))}
      </div>

      <ol className="auth-stages">
        {checks.map((c) => (
          <li key={c.label} className={`auth-stage ${c.ok ? "auth-pass" : "auth-fail"}`}>
            <span className="auth-icon">{c.ok ? "✓" : "✗"}</span>
            <div>
              <strong>{c.label}</strong>
              <p>{c.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {firstFailure ? (
        <p className="constraint-fail">
          🔓 "Your connection is not private" -- {firstFailure.browserError}. Clicking through means talking to a server
          you can't verify.
        </p>
      ) : (
        <p className="constraint-ok">🔒 Padlock shown. The browser has verified it's really talking to {new URL(scenario.url).hostname}.</p>
      )}
    </div>
  );
}
