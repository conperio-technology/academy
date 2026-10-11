import { useState } from "react";
import { DesignChoice, type DesignPair } from "./apiShared";
import { LessonLink, Quiz, type QuizItem } from "./netSecShared";

// Part 1 is a tiny in-memory orders API: pick a request, send it, send it again (a retry), and
// compare the server's state after each send. Part 2 is a status code quiz, part 3 "pick the
// better endpoint design". Everything is local and deterministic.

interface Order {
  item: string;
  qty: number;
  status: string;
  version: number;
}

interface Server {
  orders: Record<number, Order>;
  nextId: number;
}

const freshServer = (): Server => ({ orders: { 41: { item: "mug", qty: 1, status: "open", version: 1 } }, nextId: 42 });

interface Req {
  id: string;
  line: string;
  body?: string;
  safe: boolean;
  // What the METHOD promises (RFC 9110). Clients and proxies decide retries from this alone.
  idempotent: boolean;
  // PATCH only: whether this particular body happens to be safe to repeat.
  bodyRepeatSafe?: boolean;
  note: string;
  run: (s: Server) => { s: Server; status: string; res: string };
}

const withOrder = (s: Server, id: number, o: Order): Server => ({ ...s, orders: { ...s.orders, [id]: o } });

const REQUESTS: Req[] = [
  {
    id: "get",
    line: "GET /orders/41",
    safe: true,
    idempotent: true,
    note: "Safe and idempotent: reads never change state, so caches, prefetchers and retries can call it freely.",
    run: (s) => {
      const o = s.orders[41];
      return o
        ? { s, status: "200 OK", res: JSON.stringify({ id: 41, item: o.item, qty: o.qty, status: o.status }) }
        : { s, status: "404 Not Found", res: "" };
    },
  },
  {
    id: "post",
    line: "POST /orders",
    body: '{"item": "lamp", "qty": 1}',
    safe: false,
    idempotent: false,
    note: "Neither safe nor idempotent: every POST to a collection creates another resource. A retry after a lost response makes a duplicate order.",
    run: (s) => {
      const id = s.nextId;
      return {
        s: { ...withOrder(s, id, { item: "lamp", qty: 1, status: "open", version: 1 }), nextId: id + 1 },
        status: "201 Created",
        res: `Location: /orders/${id}`,
      };
    },
  },
  {
    id: "put",
    line: "PUT /orders/41",
    body: '{"item": "mug", "qty": 2, "status": "open"}',
    safe: false,
    idempotent: true,
    note: "Idempotent: PUT replaces the whole resource with the body, so the second send writes the same values again.",
    run: (s) => {
      const o = s.orders[41];
      const same = o && o.item === "mug" && o.qty === 2 && o.status === "open";
      const next = { item: "mug", qty: 2, status: "open", version: o ? (same ? o.version : o.version + 1) : 1 };
      return { s: withOrder(s, 41, next), status: o ? "200 OK" : "201 Created", res: JSON.stringify({ id: 41, item: "mug", qty: 2, status: "open" }) };
    },
  },
  {
    id: "patchSet",
    line: "PATCH /orders/41",
    body: '{"qty": 3}',
    safe: false,
    idempotent: false,
    bodyRepeatSafe: true,
    note: "This PATCH body sets a value, so repeating it happens to be harmless. PATCH as a method is still not idempotent (RFC 5789), so clients and proxies can't assume it and won't auto-retry it; only your API docs can promise it for a given body.",
    run: (s) => {
      const o = s.orders[41];
      if (!o) return { s, status: "404 Not Found", res: "" };
      const changed = o.qty !== 3;
      return { s: withOrder(s, 41, { ...o, qty: 3, version: changed ? o.version + 1 : o.version }), status: "200 OK", res: JSON.stringify({ id: 41, qty: 3 }) };
    },
  },
  {
    id: "patchInc",
    line: "PATCH /orders/41",
    body: '{"op": "increment", "path": "/qty", "by": 1}',
    safe: false,
    idempotent: false,
    bodyRepeatSafe: false,
    note: "This PATCH changes the value relative to what is there, so each retry adds one more: not idempotent.",
    run: (s) => {
      const o = s.orders[41];
      if (!o) return { s, status: "404 Not Found", res: "" };
      return { s: withOrder(s, 41, { ...o, qty: o.qty + 1, version: o.version + 1 }), status: "200 OK", res: JSON.stringify({ id: 41, qty: o.qty + 1 }) };
    },
  },
  {
    id: "delete",
    line: "DELETE /orders/41",
    safe: false,
    idempotent: true,
    note: "Idempotent: the second DELETE may answer 404 (or 204 again), but the state is the same, the order is gone either way. Idempotency is about state, not the response.",
    run: (s) => {
      if (!s.orders[41]) return { s, status: "404 Not Found", res: "" };
      const orders = { ...s.orders };
      delete orders[41];
      return { s: { ...s, orders }, status: "204 No Content", res: "" };
    },
  },
];

const snapshot = (s: Server) => JSON.stringify(Object.entries(s.orders).map(([id, o]) => [id, o.item, o.qty, o.status]));

function SendTwice() {
  const [reqId, setReqId] = useState("post");
  const [server, setServer] = useState<Server>(freshServer);
  const [snaps, setSnaps] = useState<string[]>([]);
  const [log, setLog] = useState<{ text: string; kind: "ok" | "dup" | "info" }[]>([]);
  const req = REQUESTS.find((r) => r.id === reqId)!;

  const choose = (id: string) => {
    setReqId(id);
    setServer(freshServer());
    setSnaps([]);
    setLog([]);
  };

  const send = () => {
    const out = req.run(server);
    const snap = snapshot(out.s);
    const changedAgain = snaps.length > 0 && snap !== snaps[snaps.length - 1];
    setServer(out.s);
    setSnaps([...snaps, snap]);
    setLog([
      {
        text: `#${snaps.length + 1} ${req.line}${req.body ? " " + req.body : ""}  ->  ${out.status}${out.res ? "  " + out.res : ""}`,
        kind: (changedAgain ? "dup" : "ok") as "ok" | "dup",
      },
      ...log,
    ].slice(0, 8));
  };

  const sends = snaps.length;
  const idempotentSeen = sends >= 2 && snaps[sends - 1] === snaps[sends - 2];

  return (
    <div className="crypto-section">
      <h3>Part 1: send it, then send it again</h3>
      <p className="gate-note">
        The server starts with one order. Pick a request, send it once, then send it again as a client would after a lost response.
        Idempotent means the second send leaves the same state as the first.
      </p>
      <div className="sql-presets">
        {REQUESTS.map((r) => (
          <button key={r.id} className={r.id === reqId ? "active" : ""} onClick={() => choose(r.id)}>
            {r.line}
            {r.id === "patchSet" ? " (set)" : r.id === "patchInc" ? " (increment)" : ""}
          </button>
        ))}
      </div>
      <pre className="algo-code api-http">
        {req.line} HTTP/1.1{"\n"}Host: api.example.com{req.body ? `\nContent-Type: application/json\n\n${req.body}` : ""}
      </pre>
      <div className="darr-actions">
        <button onClick={send}>{sends === 0 ? "Send" : "Send again (retry)"}</button>
        <button onClick={() => choose(reqId)}>Reset</button>
      </div>
      <div className="api-cols">
        <div>
          <span className="readout-label">Orders on the server</span>
          <table className="bigo-table api-table">
            <thead>
              <tr>
                <th>id</th>
                <th>item</th>
                <th>qty</th>
                <th>status</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(server.orders).length === 0 && (
                <tr>
                  <td colSpan={4}>no orders</td>
                </tr>
              )}
              {Object.entries(server.orders).map(([id, o]) => (
                <tr key={id}>
                  <td className="mono">{id}</td>
                  <td>{o.item}</td>
                  <td className="mono">{o.qty}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <span className="readout-label">What the method promises</span>
          <table className="bigo-table api-table">
            <tbody>
              <tr>
                <td>Safe (changes nothing)</td>
                <td className={req.safe ? "api-yes" : "api-no"}>{req.safe ? "yes" : "no"}</td>
              </tr>
              <tr>
                <td>Idempotent (repeat = once)</td>
                <td className={req.idempotent ? "api-yes" : "api-no"}>{req.idempotent ? "yes" : "no"}</td>
              </tr>
              <tr>
                <td>Auto-retried by proxies and clients</td>
                <td className={req.idempotent ? "api-yes" : "api-no"}>{req.idempotent ? "usually" : "no"}</td>
              </tr>
              {req.bodyRepeatSafe !== undefined && (
                <tr>
                  <td>This particular body is safe to repeat</td>
                  <td className={req.bodyRepeatSafe ? "api-yes" : "api-no"}>{req.bodyRepeatSafe ? "yes" : "no"}</td>
                </tr>
              )}
              <tr>
                <td>Cacheable response</td>
                <td className={req.id === "get" ? "api-yes" : "api-no"}>{req.id === "get" ? "yes" : "no"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <ul className="as-events">
        {log.map((l, i) => (
          <li key={i} className={`as-ev as-ev-${l.kind}`}>
            {l.text}
          </li>
        ))}
      </ul>
      <p className={sends >= 2 && !idempotentSeen ? "constraint-fail" : "gate-note"}>
        {sends === 0
          ? "Send the request once."
          : sends === 1
            ? "Now send it again, as a retry would."
            : idempotentSeen
              ? `The repeat left the state unchanged. ${req.note}`
              : `The repeat changed the state again. ${req.note}`}
      </p>
    </div>
  );
}

const STATUS_QUIZ: QuizItem[] = [
  {
    q: "POST /orders succeeded and the new order lives at /orders/97.",
    options: ["200 OK", "201 Created", "202 Accepted", "204 No Content"],
    answer: 1,
    why: "201 says a resource was created; put its URL in the Location header and usually the new order in the body.",
  },
  {
    q: "POST /videos/12/transcodes was accepted; the transcode will take about ten minutes.",
    options: ["201 Created", "200 OK", "202 Accepted", "503 Service Unavailable"],
    answer: 2,
    why: "202 means \"accepted for processing, not done yet\". Return a status URL (or a job resource) the client can poll, or notify it with a webhook.",
  },
  {
    q: "The request has no Authorization header at all.",
    options: ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"],
    answer: 1,
    why: "401 is about authentication: we don't know who you are. Send a WWW-Authenticate header saying how to authenticate.",
  },
  {
    q: "A valid user asks for an invoice that belongs to another company, and you don't want to reveal that invoice 5521 exists.",
    options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "400 Bad Request"],
    answer: 2,
    why: "403 would confirm the invoice exists. Answering 404 for objects the caller may not see stops attackers enumerating ids. Use 403 when existence isn't secret (a non-admin calling an admin endpoint).",
  },
  {
    q: "The JSON is well formed, but quantity is -3.",
    options: ["422 Unprocessable Content", "409 Conflict", "500 Internal Server Error", "200 OK"],
    answer: 0,
    why: "The client must fix the input, so it's a 4xx. 422 is the specific code for valid syntax that breaks a rule; plain 400 is also common and acceptable if used consistently.",
  },
  {
    q: "POST /users with an email address that is already registered.",
    options: ["400 Bad Request", "409 Conflict", "422 Unprocessable Content", "500 Internal Server Error"],
    answer: 1,
    why: "The request is fine on its own; it conflicts with the current state of the server. 409 tells the client that retrying the same thing won't help until the state changes.",
  },
  {
    q: "PUT /orders/41 with If-Match: \"v7\", but the order is now at version \"v8\" because someone else edited it.",
    options: ["409 Conflict", "412 Precondition Failed", "304 Not Modified", "400 Bad Request"],
    answer: 1,
    why: "412 is the answer to a failed If-Match: the client's copy is stale. It should re-read the order, merge, and try again. This is optimistic concurrency over HTTP.",
  },
  {
    q: "Your server called the payment provider and gave up after 5 seconds without an answer.",
    options: ["500 Internal Server Error", "502 Bad Gateway", "504 Gateway Timeout", "408 Request Timeout"],
    answer: 2,
    why: "504 says an upstream server didn't answer in time; 502 is for an upstream that answered with garbage. 408 means the client was too slow sending its request, which isn't the case here.",
  },
  {
    q: "The client has already made 100 requests in the last minute (limit 100) and sends another.",
    options: ["403 Forbidden", "429 Too Many Requests", "503 Service Unavailable", "400 Bad Request"],
    answer: 1,
    why: "429 with a Retry-After header tells a well-behaved client exactly how long to wait. 503 is for the whole service being overloaded, not one client being over its limit.",
  },
  {
    q: "An unhandled NullReferenceException in your handler.",
    options: ["400 Bad Request", "500 Internal Server Error", "503 Service Unavailable", "200 OK with {\"error\": true}"],
    answer: 1,
    why: "A bug on the server is a 500. Never 200 with an error in the body: clients, proxies, retries and dashboards all decide by status code, and they would count this as a success.",
  },
];

const DESIGNS: DesignPair[] = [
  {
    q: "Cancelling an order.",
    a: "GET /cancelOrder?id=42",
    b: "POST /orders/42/cancellations\n(or PATCH /orders/42 {\"status\": \"cancelled\"})",
    better: "b",
    why: "GET must be safe. Link prefetchers, crawlers and caches call GET URLs on their own, so a GET that cancels will one day cancel orders nobody meant to cancel. The verb belongs in the method; the URL names a resource.",
  },
  {
    q: "Listing one user's open orders.",
    a: "GET /users/7/orders?status=open&limit=20",
    b: "POST /getOrders\n{\"userId\": 7, \"status\": \"open\"}",
    better: "a",
    why: "A read is a GET on a collection with filters in the query string: cacheable, bookmarkable, safe to retry, and visible in logs. POST for reads throws all of that away.",
  },
  {
    q: "Reporting a validation error.",
    a: "200 OK\n{\"success\": false, \"msg\": \"bad qty\"}",
    b: "422 Unprocessable Content\n{\"type\": \".../errors/validation\",\n \"errors\": [{\"field\": \"qty\", \"code\": \"must_be_positive\"}]}",
    better: "b",
    why: "The status code tells every layer what happened; the body tells the program which field and why, with a code it can branch on. A 200 with an error inside is counted as a success everywhere.",
  },
  {
    q: "Responding to a successful create.",
    a: "201 Created\nLocation: /orders/97\n{\"id\": 97, \"item\": \"lamp\", ...}",
    b: "200 OK\n{\"id\": 97}",
    better: "a",
    why: "201 plus Location says exactly what happened and where the new resource lives, and returning the full object saves the client an extra GET.",
  },
  {
    q: "Reading one review of an item in an order.",
    a: "GET /users/7/orders/42/items/3/reviews/9",
    b: "GET /reviews/9\n(and GET /items/3/reviews to list them)",
    better: "b",
    why: "Nest one level to show ownership, no deeper. A review has its own id, so it can be its own resource; deep paths force the client to know every ancestor and break when the hierarchy changes.",
  },
  {
    q: "Changing only a user's email address.",
    a: "PUT /users/7\n{\"email\": \"ana@example.com\"}",
    b: "PATCH /users/7\n{\"email\": \"ana@example.com\"}",
    better: "b",
    why: "PUT replaces the whole resource, so a PUT with only the email would, by its definition, clear every other field. PATCH is the method for a partial update.",
  },
];

export function ApiRestHttp() {
  return (
    <div className="tool-widget">
      <SendTwice />
      <Quiz title="Part 2: which status code?" items={STATUS_QUIZ} />
      <DesignChoice title="Part 3: pick the better design" items={DESIGNS} />
      <p className="gate-note">
        Related: <LessonLink id="dns-and-http">DNS and HTTP</LessonLink> · <LessonLink id="sd-api-idempotency">Idempotency Keys and Safe Retries</LessonLink>{" "}
        · <LessonLink id="sd-caching">Caching</LessonLink>
      </p>
    </div>
  );
}
