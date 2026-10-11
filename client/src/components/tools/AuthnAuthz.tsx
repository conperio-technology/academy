import { useState } from "react";

// A simulated request through the same shape this app is deployed with: an ingress whose
// login middleware AUTHENTICATES (who are you?), then the app AUTHORIZES (are you allowed
// to do this?). Nothing here is sent anywhere; it's a model, like the Git lessons.

interface Caller {
  id: string;
  label: string;
  identity: string | null; // who the login proves you are, if anyone
  role: "employee" | "lead" | null;
  forged?: boolean; // skips the ingress and sends the identity header directly
}

const CALLERS: Caller[] = [
  { id: "anon", label: "Not logged in", identity: null, role: null },
  { id: "ava", label: "Ava (employee)", identity: "ava@conperio.com", role: "employee" },
  { id: "ben", label: "Ben (team lead)", identity: "ben@conperio.com", role: "lead" },
  {
    id: "forger",
    label: "Someone calling the app directly with a fake header",
    identity: "ben@conperio.com",
    role: "lead",
    forged: true,
  },
];

interface Action {
  id: string;
  label: string;
  request: string;
  allowed: (c: Caller) => boolean;
  rule: string;
}

const ACTIONS: Action[] = [
  {
    id: "list",
    label: "Open the lesson list",
    request: "GET /api/lessons",
    allowed: () => true,
    rule: "any logged-in user",
  },
  {
    id: "own",
    label: "See their own progress",
    request: "GET /api/progress",
    allowed: () => true,
    rule: "any logged-in user, for their own rows",
  },
  {
    id: "team",
    label: "See Ava's progress",
    request: "GET /api/team/ava@conperio.com/progress",
    allowed: (c) => c.role === "lead" || c.identity === "ava@conperio.com",
    rule: "Ava herself, or a team lead",
  },
  {
    id: "reset",
    label: "Reset Ava's progress",
    request: "DELETE /api/team/ava@conperio.com/progress",
    allowed: (c) => c.identity === "ava@conperio.com",
    rule: "only Ava -- even a lead can view but not erase someone's work",
  },
];

type StageState = "pass" | "fail" | "skipped" | "bypassed";

interface Stage {
  title: string;
  state: StageState;
  detail: string;
}

export function AuthnAuthz() {
  const [callerId, setCallerId] = useState("ava");
  const [actionId, setActionId] = useState("team");
  const [networkPolicy, setNetworkPolicy] = useState(false);

  const caller = CALLERS.find((c) => c.id === callerId)!;
  const action = ACTIONS.find((a) => a.id === actionId)!;

  const stages: Stage[] = [];
  let status = 200;
  let statusText = "OK";

  if (caller.forged) {
    if (networkPolicy) {
      stages.push({
        title: "Network",
        state: "fail",
        detail: "A network policy only lets traffic in through the ingress. The direct connection is refused.",
      });
      stages.push({ title: "Ingress login (authentication)", state: "skipped", detail: "Never reached." });
      stages.push({ title: "App rules (authorization)", state: "skipped", detail: "Never reached." });
      status = 0;
      statusText = "Connection refused";
    } else {
      stages.push({
        title: "Network",
        state: "pass",
        detail: "Nothing stops a connection straight to the app, skipping the ingress.",
      });
      stages.push({
        title: "Ingress login (authentication)",
        state: "bypassed",
        detail: `Bypassed. The caller just set the header X-User: ${caller.identity} themselves, and the app trusts it.`,
      });
    }
  } else {
    stages.push({ title: "Network", state: "pass", detail: "Arrives at the ingress as normal." });
    if (!caller.identity) {
      stages.push({
        title: "Ingress login (authentication)",
        state: "fail",
        detail: "No valid sign-in. The ingress sends the browser to the Microsoft login page instead.",
      });
      stages.push({ title: "App rules (authorization)", state: "skipped", detail: "Never reached." });
      status = 401;
      statusText = "Unauthorized (really: unauthenticated)";
    } else {
      stages.push({
        title: "Ingress login (authentication)",
        state: "pass",
        detail: `Signed in as ${caller.identity}. The ingress adds X-User: ${caller.identity} and forwards the request.`,
      });
    }
  }

  if (stages.length === 2) {
    const ok = action.allowed(caller);
    stages.push({
      title: "App rules (authorization)",
      state: ok ? "pass" : "fail",
      detail: `${action.request} is allowed for ${action.rule}. ${caller.identity} is a${caller.role === "employee" ? "n employee" : " team lead"} -- ${ok ? "allowed" : "not allowed"}.`,
    });
    if (!ok) {
      status = 403;
      statusText = "Forbidden";
    }
  }

  const icon: Record<StageState, string> = { pass: "✓", fail: "✗", skipped: "–", bypassed: "⚠" };

  return (
    <div className="tool-widget">
      <div className="auth-pickers">
        <label>
          Who's asking
          <select value={callerId} onChange={(e) => setCallerId(e.target.value)}>
            {CALLERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          What they want
          <select value={actionId} onChange={(e) => setActionId(e.target.value)}>
            {ACTIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <code className="sql-snippet">{action.request}</code>

      <ol className="auth-stages">
        {stages.map((s) => (
          <li key={s.title} className={`auth-stage auth-${s.state}`}>
            <span className="auth-icon">{icon[s.state]}</span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className={`auth-result ${status === 200 && !caller.forged ? "constraint-ok" : "constraint-fail"}`}>
        {status === 0 ? statusText : `${status} ${statusText}`}
        {status === 200 && caller.forged && " -- and the attacker is now acting as Ben."}
      </p>

      {caller.forged && (
        <label className="sql-index-toggle">
          <input type="checkbox" checked={networkPolicy} onChange={(e) => setNetworkPolicy(e.target.checked)} /> Only
          allow traffic to the app from the ingress (a network policy)
        </label>
      )}
    </div>
  );
}
