import { useEffect, useState } from "react";
import { fetchEvidence } from "../api";
import {
  computeBadges,
  computeCertificates,
  loadCertificateName,
  loadSeenBadges,
  saveCertificateName,
  saveSeenBadges,
  type Badge,
  type PathCertificate,
} from "../badges";
import type { LessonEvidence, NavItem } from "../types";

// The dashboard's Badges panel: earned badges in colour, the rest greyed out with what's left,
// and a printable certificate for each finished study path. Everything is worked out from
// progress kept in this browser (badges.ts), so it is self-issued and for fun.
export function Badges({ items }: { items: NavItem[] }) {
  const [evidence, setEvidence] = useState<LessonEvidence[]>([]);
  const [showing, setShowing] = useState<PathCertificate | null>(null);
  useEffect(() => {
    fetchEvidence()
      .then(setEvidence)
      .catch(() => setEvidence([]));
  }, [items]);

  const badges = computeBadges(items, evidence);
  const certificates = computeCertificates(items);
  const earned = badges.filter((b) => b.earned).length;
  const groups = [...new Set(badges.map((b) => b.group))];

  return (
    <details className="badges-panel">
      <summary>
        <h2>
          Badges ({earned} of {badges.length})
        </h2>
        <span className="gate-note">and a certificate for each study path you finish</span>
      </summary>
      <p className="gate-note">
        Worked out from the progress kept in this browser, so they're for fun, not proof: nobody else can see or check
        them.
      </p>
      {groups.map((g) => (
        <div key={g}>
          <h3>{g}</h3>
          <ul className="badge-grid">
            {badges
              .filter((b) => b.group === g)
              .sort((a, b) => Number(b.earned) - Number(a.earned))
              .map((b) => (
                <BadgeTile key={b.id} badge={b} />
              ))}
          </ul>
        </div>
      ))}
      <h3>Certificates</h3>
      <ul className="badge-grid">
        {certificates.map((c) => (
          <li key={c.id} className={`badge ${c.earned ? "earned" : ""}`}>
            <strong>{c.path}</strong>
            {c.earned ? (
              <button onClick={() => setShowing(c)}>View certificate</button>
            ) : (
              <span className="gate-note">{c.id === "faang" ? "Finish every task in your FAANG plan" : `${c.done} of ${c.total} lessons done`}</span>
            )}
          </li>
        ))}
      </ul>
      {showing && <Certificate cert={showing} onClose={() => setShowing(null)} />}
    </details>
  );
}

function BadgeTile({ badge }: { badge: Badge }) {
  return (
    <li className={`badge ${badge.earned ? "earned" : ""}`} title={badge.how}>
      <span className="badge-icon" aria-hidden="true">
        {badge.earned ? "🏅" : "🔒"}
      </span>
      <strong>{badge.name}</strong>
      <span className="gate-note">{badge.earned ? badge.how : `${badge.how}: ${badge.progress}`}</span>
    </li>
  );
}

function Certificate({ cert, onClose }: { cert: PathCertificate; onClose: () => void }) {
  const [name, setName] = useState(loadCertificateName);
  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="certificate-overlay" role="dialog" aria-label={`${cert.path} certificate`}>
      <div className="certificate-controls">
        <label>
          Name on the certificate{" "}
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              saveCertificateName(e.target.value);
            }}
            placeholder="Your name"
          />
        </label>
        <button onClick={() => window.print()}>Print or save as PDF</button>
        <button className="link-button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="certificate">
        <p className="certificate-org">Conperio Academy</p>
        <p className="certificate-kicker">Certificate of completion</p>
        <p className="certificate-name">{name || "Your name"}</p>
        <p>finished every lesson on the</p>
        <p className="certificate-path">{cert.path}</p>
        <p>study path</p>
        <p className="certificate-date">{date}</p>
        <p className="certificate-note">Self-issued from progress kept in the learner's own browser.</p>
      </div>
    </div>
  );
}

// A short "badge earned" note, for badges earned since the last check. On the very first check
// everything already earned is recorded silently, so a returning learner isn't flooded.
export function BadgeToast({ items }: { items: NavItem[] }) {
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    if (items.length === 0) return;
    let live = true;
    fetchEvidence()
      .catch(() => [])
      .then((evidence) => {
        if (!live) return;
        const earned = computeBadges(items, evidence).filter((b) => b.earned);
        const seen = loadSeenBadges();
        saveSeenBadges([...new Set([...(seen ?? []), ...earned.map((b) => b.id)])]);
        if (seen === null) return;
        const fresh = earned.filter((b) => !seen.includes(b.id));
        if (fresh.length > 0) setNames(fresh.map((b) => b.name));
      });
    return () => {
      live = false;
    };
  }, [items]);
  useEffect(() => {
    if (names.length === 0) return;
    const t = window.setTimeout(() => setNames([]), 6000);
    return () => window.clearTimeout(t);
  }, [names]);
  if (names.length === 0) return null;
  return (
    <div className="badge-toast" role="status">
      🏅 Badge earned: {names.join(", ")}
      <button className="link-button" onClick={() => setNames([])} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
