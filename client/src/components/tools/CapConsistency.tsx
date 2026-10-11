import { useState } from "react";

// Part 1 is two datacenters, each with a copy of a ticket inventory. While the link is up
// every sale reaches both copies. Cut the link and the mode decides what happens: CP
// refuses sales on the side that can't reach the leader; AP lets both sides keep selling,
// and on heal the copies are reconciled by last-write-wins or by merging the sales.
// Part 2 is a quorum calculator over N replicas with fixed, made-up network latencies.

type Side = "US" | "EU";
type Mode = "CP" | "AP";
type Merge = "lww" | "counter";

const STOCK = 5;

interface Sale {
  id: number;
  side: Side;
  t: number;
}

interface Copy {
  sales: Sale[]; // the sales this copy knows about
  lastWrite: number; // logical time of the last write it applied
}

interface State {
  us: Copy;
  eu: Copy;
  linkUp: boolean;
  t: number;
  log: { text: string; bad?: boolean }[];
}

const fresh = (): State => ({
  us: { sales: [], lastWrite: 0 },
  eu: { sales: [], lastWrite: 0 },
  linkUp: true,
  t: 0,
  log: [{ text: `t=0 both sides start with ${STOCK} tickets` }],
});

const left = (c: Copy) => STOCK - c.sales.length;

function Partition() {
  const [mode, setMode] = useState<Mode>("CP");
  const [merge, setMerge] = useState<Merge>("lww");
  const [s, setS] = useState(fresh);

  const push = (st: State, text: string, bad = false) => ({ ...st, log: [{ text: `t=${st.t} ${text}`, bad }, ...st.log].slice(0, 12) });

  const sell = (side: Side) =>
    setS((prev) => {
      const st = { ...prev, t: prev.t + 1 };
      const mine = side === "US" ? st.us : st.eu;
      if (!st.linkUp && mode === "CP" && side === "EU")
        return push(st, "EU sale rejected: can't reach the leader in US (error 503)", true);
      if (left(mine) <= 0) return push(st, `${side} sale rejected: sold out (as far as ${side} knows)`);
      const sale: Sale = { id: st.t, side, t: st.t };
      const add = (c: Copy): Copy => ({ sales: [...c.sales, sale], lastWrite: st.t });
      if (st.linkUp) {
        const next = { ...st, us: add(st.us), eu: add(st.eu) };
        return push(next, `${side} sold 1, replicated to both sides: ${left(next.us)} left`);
      }
      const next = side === "US" ? { ...st, us: add(st.us) } : { ...st, eu: add(st.eu) };
      return push(next, `${side} sold 1 locally: ${side} now shows ${left(side === "US" ? next.us : next.eu)} left`);
    });

  const read = (side: Side) =>
    setS((prev) => {
      const st = { ...prev, t: prev.t + 1 };
      if (!st.linkUp && mode === "CP" && side === "EU") return push(st, "EU read rejected: can't confirm it has the latest value", true);
      const mine = side === "US" ? st.us : st.eu;
      const other = side === "US" ? st.eu : st.us;
      const stale = !st.linkUp && left(mine) !== left(other);
      return push(st, `${side} read: ${left(mine)} tickets left${stale ? " (the other side disagrees)" : ""}`, stale);
    });

  const toggleLink = () =>
    setS((prev) => {
      const st = { ...prev, t: prev.t + 1 };
      if (st.linkUp) return push({ ...st, linkUp: false }, "Network link cut: US and EU can't talk", true);
      const { us, eu } = st;
      const union = [...us.sales, ...eu.sales.filter((x) => !us.sales.some((y) => y.id === x.id))];
      let merged: Sale[];
      let text: string;
      let bad = false;
      if (merge === "counter") {
        merged = union;
        text = `Link restored. Merged both sides' sales: ${union.length} sold, ${STOCK - union.length} left`;
        if (union.length > STOCK) { text += `. Oversold by ${union.length - STOCK}: both sides sold the same last tickets`; bad = true; }
      } else {
        const winner = us.lastWrite >= eu.lastWrite ? us : eu;
        const loser = winner === us ? eu : us;
        const lost = loser.sales.filter((x) => !winner.sales.some((y) => y.id === x.id)).length;
        merged = winner.sales;
        text = `Link restored. Last write wins: ${winner === us ? "US" : "EU"} copy kept, ${STOCK - merged.length} left`;
        if (lost > 0) { text += `. ${lost} ${winner === us ? "EU" : "US"} sale${lost === 1 ? "" : "s"} silently lost`; bad = true; }
      }
      const copy = { sales: merged, lastWrite: st.t };
      return push({ ...st, linkUp: true, us: copy, eu: copy }, text, bad);
    });

  const diverged = left(s.us) !== left(s.eu);
  const lastBad = s.log[0]?.bad;

  return (
    <div className="crypto-section">
      <h3>1. A partition between two datacenters</h3>
      <div className="sql-presets">
        {(["CP", "AP"] as Mode[]).map((m) => (
          <button key={m} className={m === mode ? "active" : ""} onClick={() => { setMode(m); setS(fresh()); }}>
            {m === "CP" ? "CP: stay consistent" : "AP: stay available"}
          </button>
        ))}
        {mode === "AP" &&
          (["lww", "counter"] as Merge[]).map((m) => (
            <button key={m} className={m === merge ? "active" : ""} onClick={() => setMerge(m)}>
              On heal: {m === "lww" ? "last write wins" : "merge the sales"}
            </button>
          ))}
      </div>

      <div className="cap-dcs">
        {(["US", "link", "EU"] as const).map((side) => {
          if (side === "link")
            return (
              <button key="link" className={`cap-link ${s.linkUp ? "" : "cap-link-cut"}`} onClick={toggleLink}>
                {s.linkUp ? "Cut the link" : "Restore the link"}
              </button>
            );
          const copy = side === "US" ? s.us : s.eu;
          const blocked = !s.linkUp && mode === "CP" && side === "EU";
          return (
            <div key={side} className={`cap-dc ${blocked ? "cap-dc-blocked" : ""}`}>
              <strong>{side}{mode === "CP" && side === "US" ? " (leader)" : ""}</strong>
              <span className={`cap-count mono ${left(copy) < 0 ? "cap-neg" : ""}`}>{left(copy)}</span>
              <span>tickets left</span>
              <div className="cap-dc-actions">
                <button onClick={() => sell(side)}>Sell 1</button>
                <button onClick={() => read(side)}>Read</button>
              </div>
            </div>
          );
        })}
      </div>

      <ul className="cap-log">
        {s.log.map((l, i) => (
          <li key={i} className={l.bad ? "cap-log-bad" : ""}>{l.text}</li>
        ))}
      </ul>
      <button onClick={() => setS(fresh())}>Reset</button>
      <p className="gate-note">
        {s.linkUp
          ? lastBad
            ? merge === "lww" && mode === "AP"
              ? "Last write wins kept whichever copy was written most recently and threw the other side's sales away. The customers were charged, but the system forgot them. Try merging the sales instead."
              : "Merging keeps every sale, but each side only checked its own copy before selling, so together they sold more tickets than exist. That's the real price of AP for an inventory: you need a way to apologize (refund, waitlist) or you need CP."
            : "The link is up, so every sale goes to both sides and they always agree. Cut the link to see what each mode gives up."
          : mode === "CP"
            ? "US can reach the leader (it is the leader), so it keeps selling. EU can't, and rather than risk selling a ticket that's already gone, it refuses: consistent, but EU customers see errors until the link comes back."
            : diverged
              ? "Both sides keep selling and each one's count is now different. Nothing is refused, but the two copies disagree. Restore the link to see how they're reconciled."
              : "In AP mode both sides keep accepting sales during the partition. Sell on both sides, then restore the link."}
      </p>
    </div>
  );
}

// ---- 2. Quorums ---------------------------------------------------------------------------

const LATENCY_MS = [4, 6, 9, 14, 40, 85, 140]; // replicas sorted by distance from the client

function Quorum() {
  const [n, setN] = useState(3);
  const [w, setW] = useState(2);
  const [r, setR] = useState(2);
  const W = Math.min(w, n);
  const Rq = Math.min(r, n);
  const overlap = Math.max(0, W + Rq - n);
  const strong = W + Rq > n;
  const preset = (pn: number, pw: number, pr: number) => { setN(pn); setW(pw); setR(pr); };

  return (
    <div className="crypto-section">
      <h3>2. Tunable consistency: N, W and R</h3>
      <div className="sql-presets">
        <button onClick={() => preset(3, 2, 2)}>N=3 W=2 R=2 (quorum)</button>
        <button onClick={() => preset(3, 3, 1)}>N=3 W=3 R=1 (fast reads)</button>
        <button onClick={() => preset(3, 1, 1)}>N=3 W=1 R=1 (fast, eventual)</button>
        <button onClick={() => preset(5, 3, 3)}>N=5 W=3 R=3</button>
      </div>
      <div className="cap-sliders">
        {([["N replicas", n, 1, 7, (v: number) => { setN(v); setW(Math.min(w, v)); setR(Math.min(r, v)); }], ["W (acks per write)", W, 1, n, setW], ["R (replies per read)", Rq, 1, n, setR]] as const).map(
          ([label, value, min, max, set]) => (
            <label key={label}>
              {label}: <strong>{value}</strong>
              <input type="range" min={min} max={max} value={value} onChange={(e) => set(Number(e.target.value))} />
            </label>
          ),
        )}
      </div>
      <div className="cap-replicas">
        {Array.from({ length: n }, (_, i) => {
          const inW = i < W; // worst case: the write reached the first W replicas...
          const inR = i >= n - Rq; // ...and the read asks the last R
          return (
            <div key={i} className={`cap-replica ${inW ? "cap-in-w" : ""} ${inR ? "cap-in-r" : ""}`}>
              <span className="mono">r{i + 1}</span>
              <span>{inW && inR ? "W + R" : inW ? "W" : inR ? "R" : "-"}</span>
            </div>
          );
        })}
      </div>
      <p className={strong ? "constraint-ok" : "constraint-fail"}>
        R + W = {Rq + W} {strong ? ">" : "<="} N = {n}:{" "}
        {strong
          ? `every read set overlaps every write set on at least ${overlap} replica${overlap === 1 ? "" : "s"}, so a read reaches at least one replica holding the latest completed write.`
          : "a read can ask only replicas the write never reached, and return an old value."}
      </p>
      <table className="bigo-table">
        <tbody>
          <tr><td>Write latency (wait for the W-th fastest ack)</td><td className="mono">{LATENCY_MS[W - 1]} ms</td></tr>
          <tr><td>Read latency (wait for the R-th fastest reply)</td><td className="mono">{LATENCY_MS[Rq - 1]} ms</td></tr>
          <tr><td>Writes still work with this many replicas down</td><td className="mono">{n - W}</td></tr>
          <tr><td>Reads still work with this many replicas down</td><td className="mono">{n - Rq}</td></tr>
        </tbody>
      </table>
      <p className="gate-note">
        {W === n
          ? "W = N makes reads cheap and always fresh, but a single replica being down blocks every write."
          : strong
            ? "Overlapping quorums let every read reach the latest completed write while tolerating some failures. The cost is waiting for the slower replicas on both reads and writes."
            : "Small W and R are fast and keep working with most replicas down, but reads can be stale until the replicas catch up: that's eventual consistency."}
      </p>
      <p className="gate-note">
        Assumptions behind this calculator: a fixed set of N replicas (no sloppy quorum or hinted handoff), and a
        write that completed on W replicas before the read started. Overlap alone doesn't make reads linearizable:
        concurrent or partly failed writes, last-write-wins on skewed clocks, and read repair that runs after the
        answer can all return an older value. Systems that need linearizable reads add coordination, such as
        Cassandra's lightweight transactions (Paxos).
      </p>
    </div>
  );
}

export function CapConsistency() {
  return (
    <div className="tool-widget">
      <Partition />
      <Quorum />
    </div>
  );
}
