import { useState } from "react";

// Simulators for the consensus lesson: a five-node Raft cluster you drive by hand (timeouts,
// crashes, partitions, client writes) and Lamport and vector clocks on three processes. The
// Raft model follows the paper's rules for terms, votes, the up-to-date log check and the
// commit rule; AppendEntries is simplified to copy the leader's log in one step instead of
// backing off one entry at a time.

// ---- Raft ------------------------------------------------------------------------------

type Role = "follower" | "candidate" | "leader";
interface Entry {
  term: number;
  cmd: string;
}
interface RNode {
  id: number;
  term: number;
  role: Role;
  votedFor: number | null;
  log: Entry[];
  commit: number; // number of committed entries
  up: boolean;
}

const IDS = [1, 2, 3, 4, 5];
const MAJORITY = 3;

function fresh(): RNode[] {
  return IDS.map((id) => ({ id, term: 0, role: "follower", votedFor: null, log: [], commit: 0, up: true }));
}

function lastTerm(n: RNode) {
  return n.log.length ? n.log[n.log.length - 1].term : 0;
}

export function RaftSim() {
  const [nodes, setNodes] = useState<RNode[]>(fresh);
  const [split, setSplit] = useState(false); // nodes 1-2 cut off from 3-5
  const [pick, setPick] = useState(1);
  const [writes, setWrites] = useState(0);
  const [log, setLog] = useState<string[]>(["Five followers in term 0, no leader. Pick a node and let its election timer run out."]);

  const reach = (a: number, b: number) => !split || a <= 2 === b <= 2;
  const say = (line: string) => setLog((l) => [line, ...l].slice(0, 12));

  function update(fn: (ns: RNode[]) => string) {
    const ns = nodes.map((n) => ({ ...n, log: [...n.log] }));
    say(fn(ns));
    setNodes(ns);
  }

  // The leader sends AppendEntries (with any new entries) to every node it can reach.
  function replicate(ns: RNode[], leader: RNode): string[] {
    const notes: string[] = [];
    for (const n of ns) {
      if (n.id === leader.id || !n.up || !reach(leader.id, n.id)) continue;
      if (n.term > leader.term) {
        notes.push(`node ${n.id} has term ${n.term} > ${leader.term}, so leader ${leader.id} steps down`);
        leader.term = n.term;
        leader.role = "follower";
        leader.votedFor = null;
        return notes;
      }
      if (n.term < leader.term) n.votedFor = null;
      n.term = leader.term;
      n.role = "follower";
      const lost = n.log.length - n.log.filter((e, i) => leader.log[i] && leader.log[i].term === e.term && leader.log[i].cmd === e.cmd).length;
      if (lost > 0) notes.push(`node ${n.id} drops ${lost} uncommitted entr${lost === 1 ? "y that conflicts" : "ies that conflict"} with the leader`);
      n.log = leader.log.map((e) => ({ ...e }));
    }
    // Commit rule: an entry from the current term stored on a majority is committed.
    for (let i = leader.log.length; i > leader.commit; i--) {
      const stored = ns.filter((n) => n.id === leader.id || (n.up && reach(leader.id, n.id) && n.log.length >= i)).length;
      if (stored >= MAJORITY && leader.log[i - 1].term === leader.term) {
        leader.commit = i;
        notes.push(`entries up to #${i} are on ${stored} nodes, a majority: committed`);
        break;
      }
    }
    for (const n of ns) if (n.id !== leader.id && n.up && reach(leader.id, n.id)) n.commit = Math.min(leader.commit, n.log.length);
    return notes;
  }

  function timeout() {
    update((ns) => {
      const c = ns.find((n) => n.id === pick)!;
      if (!c.up) return `Node ${pick} is down; a crashed node has no timer.`;
      c.term += 1;
      c.role = "candidate";
      c.votedFor = c.id;
      const votes = [c.id];
      const refused: string[] = [];
      for (const n of ns) {
        if (n.id === c.id) continue;
        if (!n.up || !reach(c.id, n.id)) {
          refused.push(`${n.id} unreachable`);
          continue;
        }
        if (n.term > c.term) {
          refused.push(`${n.id} has a newer term`);
          continue;
        }
        if (n.term < c.term) {
          n.term = c.term;
          n.role = "follower";
          n.votedFor = null;
        }
        const upToDate = lastTerm(c) > lastTerm(n) || (lastTerm(c) === lastTerm(n) && c.log.length >= n.log.length);
        if (n.votedFor !== null && n.votedFor !== c.id) refused.push(`${n.id} already voted`);
        else if (!upToDate) refused.push(`${n.id}'s log is more up to date`);
        else {
          n.votedFor = c.id;
          votes.push(n.id);
        }
      }
      const won = votes.length >= MAJORITY;
      if (won) {
        c.role = "leader";
        for (const n of ns) if (n.id !== c.id && n.role === "leader" && reach(c.id, n.id)) n.role = "follower";
        replicate(ns, c);
      }
      return `Node ${c.id} times out, starts term ${c.term} and asks for votes. Votes from ${votes.join(", ")}${refused.length ? `; refused: ${refused.join(", ")}` : ""}. ${
        won ? `${votes.length} of 5 is a majority: node ${c.id} is leader for term ${c.term} and sends heartbeats.` : `${votes.length} of 5 is not a majority; it stays a candidate and will time out again.`
      }`;
    });
  }

  function write() {
    update((ns) => {
      const leaders = ns.filter((n) => n.role === "leader" && n.up);
      const leader = leaders.find((n) => n.id === pick) ?? leaders.sort((a, b) => b.term - a.term)[0];
      if (!leader) return "No leader to take the write. Elect one first.";
      const cmd = `x=${writes + 1}`;
      setWrites((w) => w + 1);
      leader.log.push({ term: leader.term, cmd });
      const before = leader.commit;
      const notes = replicate(ns, leader);
      const committed = leader.commit > before;
      return `Client sends ${cmd} to leader ${leader.id} (term ${leader.term}). It appends entry #${leader.log.length} and replicates it. ${notes.join("; ")}${notes.length ? ". " : ""}${
        committed ? "The client gets success." : leader.role === "leader" ? "Fewer than 3 nodes have it, so it is NOT committed and the client waits." : ""
      }`;
    });
  }

  function heartbeat() {
    update((ns) => {
      const leaders = ns.filter((n) => n.role === "leader" && n.up);
      if (!leaders.length) return "No leader is sending heartbeats.";
      const notes = leaders.flatMap((l) => {
        const out = replicate(ns, l);
        return [`leader ${l.id} (term ${l.term}) sends heartbeats${out.length ? ": " + out.join("; ") : ""}`];
      });
      return notes.join(". ") + ".";
    });
  }

  function toggleUp() {
    update((ns) => {
      const n = ns.find((x) => x.id === pick)!;
      n.up = !n.up;
      if (!n.up) return `Node ${n.id} crashes${n.role === "leader" ? "; the followers stop getting heartbeats" : ""}.`;
      n.role = "follower";
      return `Node ${n.id} restarts as a follower. Its term, vote and log survived on disk; the leader will bring its log up to date.`;
    });
  }

  function toggleSplit() {
    setSplit((s) => !s);
    say(split ? "The network heals: all five nodes can reach each other again. Send heartbeats to see who is really leader." : "Network partition: nodes 1 and 2 can't reach nodes 3, 4 and 5.");
  }

  function reset() {
    setNodes(fresh());
    setSplit(false);
    setWrites(0);
    setLog(["Reset: five followers in term 0."]);
  }

  return (
    <div>
      <div className="sql-presets" aria-label="Node">
        {IDS.map((id) => (
          <button key={id} className={id === pick ? "active" : ""} onClick={() => setPick(id)}>
            Node {id}
          </button>
        ))}
      </div>
      <div className="sql-presets" aria-label="Actions">
        <button onClick={timeout}>Node {pick}: election timeout</button>
        <button onClick={write}>Client write</button>
        <button onClick={heartbeat}>Heartbeat</button>
        <button onClick={toggleUp}>{nodes[pick - 1].up ? `Crash node ${pick}` : `Restart node ${pick}`}</button>
        <button onClick={toggleSplit}>{split ? "Heal the partition" : "Partition 1-2 | 3-5"}</button>
        <button onClick={reset}>Reset</button>
      </div>
      <div className="raft-nodes">
        {nodes.map((n) => (
          <div key={n.id} className={`dbw-box raft-node raft-${n.up ? n.role : "down"}${split && n.id <= 2 ? " raft-cut" : ""}`}>
            <strong>
              Node {n.id} {n.up ? n.role : "down"}
            </strong>
            <span className="gate-note">
              term {n.term}
              {n.votedFor !== null ? `, voted ${n.votedFor}` : ""}
            </span>
            <ol className="raft-log">
              {n.log.map((e, i) => (
                <li key={i} className={i < n.commit ? "raft-committed" : ""}>
                  t{e.term} {e.cmd}
                </li>
              ))}
              {n.log.length === 0 && <li className="gate-note">empty log</li>}
            </ol>
          </div>
        ))}
      </div>
      <p className="gate-note">{split ? "Partitioned: nodes 1 and 2 (dashed) are cut off from 3, 4 and 5. " : ""}Committed entries are solid; uncommitted ones are dashed.</p>
      <ol className="dbw-steps raft-events" reversed>
        {log.map((l, i) => (
          <li key={log.length - i}>{l}</li>
        ))}
      </ol>
    </div>
  );
}

// ---- Lamport and vector clocks ---------------------------------------------------------

interface Ev {
  name: string;
  proc: number;
  kind: string;
  lamport: number;
  vector: number[];
}

const P = 3;

function compare(a: Ev, b: Ev): string {
  const le = a.vector.every((x, i) => x <= b.vector[i]);
  const ge = a.vector.every((x, i) => x >= b.vector[i]);
  if (le && !ge) return `${a.name} happened before ${b.name}: every entry of ${a.name}'s vector is <= ${b.name}'s.`;
  if (ge && !le) return `${b.name} happened before ${a.name}: every entry of ${b.name}'s vector is <= ${a.name}'s.`;
  if (le && ge) return "That is the same event.";
  return `${a.name} and ${b.name} are concurrent: each vector is bigger somewhere. Neither could have caused the other, ${a.lamport === b.lamport ? "and their Lamport times are equal" : `even though Lamport says ${a.lamport < b.lamport ? a.name : b.name} came first`}.`;
}

export function LogicalClocks() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [lamport, setLamport] = useState([0, 0, 0]);
  const [vectors, setVectors] = useState<number[][]>([
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ]);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(1);
  const [sel, setSel] = useState<string[]>([]);

  const name = (i: number) => String.fromCharCode(97 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : "");

  function local(p: number) {
    const L = [...lamport];
    const V = vectors.map((v) => [...v]);
    L[p] += 1;
    V[p][p] += 1;
    setLamport(L);
    setVectors(V);
    setEvents((es) => [...es, { name: name(es.length), proc: p, kind: "local", lamport: L[p], vector: [...V[p]] }]);
  }

  function send() {
    if (from === to) return;
    const L = [...lamport];
    const V = vectors.map((v) => [...v]);
    L[from] += 1;
    V[from][from] += 1;
    const sendEv = { proc: from, kind: `send to P${to + 1}`, lamport: L[from], vector: [...V[from]] };
    L[to] = Math.max(L[to], L[from]) + 1;
    V[to] = V[to].map((x, i) => Math.max(x, V[from][i]));
    V[to][to] += 1;
    const recvEv = { proc: to, kind: `receive from P${from + 1}`, lamport: L[to], vector: [...V[to]] };
    setLamport(L);
    setVectors(V);
    setEvents((es) => [...es, { name: name(es.length), ...sendEv }, { name: name(es.length + 1), ...recvEv }]);
  }

  function toggle(n: string) {
    setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n].slice(-2)));
  }

  const chosen = sel.map((n) => events.find((e) => e.name === n)!).filter(Boolean);
  return (
    <div>
      <div className="sql-presets" aria-label="Local events">
        {[0, 1, 2].map((p) => (
          <button key={p} onClick={() => local(p)}>
            Local event on P{p + 1}
          </button>
        ))}
      </div>
      <div className="sec-row">
        <label>
          Message from{" "}
          <select value={from} onChange={(ev) => setFrom(Number(ev.target.value))}>
            {[0, 1, 2].map((p) => (
              <option key={p} value={p}>
                P{p + 1}
              </option>
            ))}
          </select>
        </label>
        <label>
          to{" "}
          <select value={to} onChange={(ev) => setTo(Number(ev.target.value))}>
            {[0, 1, 2].map((p) => (
              <option key={p} value={p}>
                P{p + 1}
              </option>
            ))}
          </select>
        </label>
        <button onClick={send} disabled={from === to}>
          Send
        </button>
        <button
          onClick={() => {
            setEvents([]);
            setLamport([0, 0, 0]);
            setVectors([
              [0, 0, 0],
              [0, 0, 0],
              [0, 0, 0],
            ]);
            setSel([]);
          }}
        >
          Reset
        </button>
      </div>
      <div className="clock-lanes">
        {Array.from({ length: P }, (_, p) => (
          <div key={p} className="dbw-box">
            <strong>P{p + 1}</strong>
            <ul className="dbw-entries">
              {events
                .filter((e) => e.proc === p)
                .map((e) => (
                  <li key={e.name}>
                    <button className={`clock-ev${sel.includes(e.name) ? " active" : ""}`} onClick={() => toggle(e.name)}>
                      <strong>{e.name}</strong> {e.kind}: L={e.lamport}, V=[{e.vector.join(", ")}]
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="lt-p">
        {events.length === 0
          ? "Make some local events and send messages between processes."
          : chosen.length === 2
            ? compare(chosen[0], chosen[1])
            : "Click two events to compare them."}
      </p>
    </div>
  );
}
