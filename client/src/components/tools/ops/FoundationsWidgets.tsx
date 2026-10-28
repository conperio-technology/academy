import { useState } from "react";

// Widget for the probability lesson: the birthday paradox computed exactly and by simulation.

// ---- Birthday paradox ------------------------------------------------------------------

function sharedBirthday(n: number) {
  let allDifferent = 1;
  for (let i = 0; i < n; i++) allDifferent *= (365 - i) / 365;
  return 1 - allDifferent;
}

export function BirthdayParadox() {
  const [n, setN] = useState(23);
  const [sim, setSim] = useState<{ n: number; rooms: number; hits: number } | null>(null);
  const exact = sharedBirthday(n);
  const pairs = (n * (n - 1)) / 2;

  function simulate() {
    const rooms = 2000;
    let hits = 0;
    for (let r = 0; r < rooms; r++) {
      const seen = new Set<number>();
      for (let i = 0; i < n; i++) {
        const day = Math.floor(Math.random() * 365);
        if (seen.has(day)) {
          hits++;
          break;
        }
        seen.add(day);
      }
    }
    setSim({ n, rooms, hits });
  }

  return (
    <div>
      <label className="sec-col">
        People in the room: {n}
        <input type="range" min={2} max={80} value={n} onChange={(ev) => setN(Number(ev.target.value))} />
      </label>
      <ul className="dbw-entries">
        <li className="dbw-run">
          Chance at least two share a birthday: <strong>{(exact * 100).toFixed(1)}%</strong>
        </li>
        <li className="dbw-run">
          Pairs of people: {n} × {n - 1} / 2 = {pairs}. Each pair matches with chance 1/365, which is why it climbs so fast.
        </li>
        <li className="dbw-run">
          Computed as 1 − (365/365 × 364/365 × … × {365 - n + 1}/365): one minus the chance that everyone is different.
        </li>
      </ul>
      <div className="sec-row">
        <button onClick={simulate}>Simulate 2,000 rooms of {n}</button>
        {sim && (
          <span className="gate-note">
            {sim.hits} of {sim.rooms} rooms of {sim.n} had a shared birthday: {((sim.hits / sim.rooms) * 100).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="gate-note">
        The same maths is why hash collisions arrive early: with a b-bit hash, expect the first collision after about 2^(b/2) items, not 2^b. A 64-bit hash collides after about 4 billion values.
      </p>
    </div>
  );
}
