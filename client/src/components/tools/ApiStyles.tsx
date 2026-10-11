import { useState } from "react";
import { LessonLink, Quiz, type QuizItem } from "./netSecShared";

// Part 1 fetches one profile screen (a user, their last N posts, each post's comment count) in
// six API styles and compares requests, sequential round trips, bytes and database queries. The
// sizes and timings are round, made-up numbers chosen to show the shape of each trade-off, not
// benchmarks. Part 2 is a "which style fits?" quiz.

type StyleId = "rest" | "restFields" | "bff" | "gql" | "gqlLoader" | "grpc";

const NETWORKS = [
  { id: "4g", label: "Phone on 4G (120 ms round trip)", rtt: 120 },
  { id: "wifi", label: "Home Wi-Fi (30 ms)", rtt: 30 },
  { id: "dc", label: "Inside the datacenter (1 ms)", rtt: 1 },
];

const DB_MS = 2; // per database query, run one after another
const INTERNAL_RTT = 1; // a call between services in the same datacenter

interface Result {
  requests: number;
  trips: number; // sequential round trips over the client's network
  kb: number; // bytes downloaded by the client
  usedKb: number; // bytes the screen actually needs
  db: number;
  extraMs: number; // server-side time on top of the round trips
  calls: string[];
  note: string;
}

function run(style: StyleId, n: number): Result {
  const used = 0.1 + n * 0.15;
  switch (style) {
    case "rest":
      return {
        requests: 2 + n,
        trips: 2,
        kb: 1.8 + n * 1.2 + n * 0.6,
        usedKb: used,
        db: 2 + n,
        extraMs: 2 * DB_MS,
        calls: ["GET /users/7", `GET /users/7/posts?limit=${n}`, ...Array.from({ length: Math.min(n, 3) }, (_, i) => `GET /posts/${901 + i}/comments?limit=1`), ...(n > 3 ? [`... ${n - 3} more comment calls`] : [])],
        note: "Plain resources: the post ids are only known after the posts call, so the comment counts are a second round of requests, and every response carries whole objects the screen doesn't use (overfetching).",
      };
    case "restFields":
      return {
        requests: 2,
        trips: 1,
        kb: used + 0.05,
        usedKb: used,
        db: 2,
        extraMs: DB_MS,
        calls: ["GET /users/7?fields=name,avatar_url", `GET /users/7/posts?limit=${n}&fields=id,caption,thumb_url,comment_count`],
        note: "Field selection and a comment_count field computed in one query (a JOIN with GROUP BY, or a stored counter) fix most of it, but each new screen tends to need a new parameter.",
      };
    case "bff":
      return {
        requests: 1,
        trips: 1,
        kb: used,
        usedKb: used,
        db: 2 + n,
        extraMs: 2 * INTERNAL_RTT + 2 * DB_MS,
        calls: ["GET /mobile/profile-screen/7", `(inside the datacenter: GET /users/7, GET /users/7/posts, ${n} comment-count calls)`],
        note: "A backend for frontend makes the chatty calls where round trips cost 1 ms instead of 120 ms and returns exactly what this screen needs. The cost is one more service per client type to build and run.",
      };
    case "gql":
      return {
        requests: 1,
        trips: 1,
        kb: used + 0.05,
        usedKb: used,
        db: 2 + n,
        extraMs: (2 + n) * DB_MS,
        calls: [`POST /graphql  { user(id: 7) { name avatarUrl posts(first: ${n}) { id caption thumbUrl commentCount } } }`],
        note: "One request, exactly the fields asked for. But a naive commentCount resolver runs once per post: the N+1 query problem. Raise the post count and watch the database queries and server time grow.",
      };
    case "gqlLoader":
      return {
        requests: 1,
        trips: 1,
        kb: used + 0.05,
        usedKb: used,
        db: 3,
        extraMs: 3 * DB_MS,
        calls: [`POST /graphql  (same query)`, `(server: DataLoader batches the ${n} post ids into one query: ... WHERE post_id IN (...) GROUP BY post_id)`],
        note: "DataLoader collects every commentCount request made while resolving the query and fetches them in one batched query, so the database work stays flat however many posts there are.",
      };
    case "grpc":
      return {
        requests: 2,
        trips: 1,
        kb: used * 0.4,
        usedKb: used,
        db: 2,
        extraMs: DB_MS,
        calls: ["UserService.GetUser({ id: 7, read_mask: \"name,avatar_url\" })", `PostService.ListPosts({ user_id: 7, page_size: ${n}, include_counts: true })`],
        note: "Typed, generated clients and compact binary messages over one HTTP/2 connection: the smallest bytes here. From a phone app that works natively; from a browser it needs gRPC-Web and a proxy. It is most at home between internal services.",
      };
  }
}

const STYLES: { id: StyleId; label: string }[] = [
  { id: "rest", label: "REST, plain resources" },
  { id: "restFields", label: "REST + field selection" },
  { id: "bff", label: "REST via a BFF" },
  { id: "gql", label: "GraphQL, naive resolvers" },
  { id: "gqlLoader", label: "GraphQL + DataLoader" },
  { id: "grpc", label: "gRPC" },
];

function ProfileScreen() {
  const [net, setNet] = useState(NETWORKS[0]);
  const [n, setN] = useState(3);
  const [sel, setSel] = useState<StyleId>("rest");
  const rows = STYLES.map((s) => ({ ...s, r: run(s.id, n) }));
  const latency = (r: Result) => Math.round(r.trips * net.rtt + r.extraMs);
  const best = Math.min(...rows.map((x) => latency(x.r)));
  const cur = run(sel, n);

  return (
    <div className="crypto-section">
      <h3>Part 1: load one profile screen six ways</h3>
      <p className="gate-note">
        The screen shows a user&apos;s name and avatar, their latest posts, and each post&apos;s comment count. Change the network and the number of
        posts, then pick a style to see the calls it makes.
      </p>
      <div className="cdn-row">
        <span className="cdn-row-label">Client network</span>
        <div className="sql-presets">
          {NETWORKS.map((x) => (
            <button key={x.id} className={x.id === net.id ? "active" : ""} onClick={() => setNet(x)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>
      <div className="cdn-row">
        <span className="cdn-row-label">Posts on the screen</span>
        <div className="sql-presets">
          {[3, 10, 25, 50].map((k) => (
            <button key={k} className={k === n ? "active" : ""} onClick={() => setN(k)}>
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="api-scroll">
        <table className="bigo-table api-table api-compare">
          <thead>
            <tr>
              <th>Style</th>
              <th>Requests</th>
              <th>Round trips</th>
              <th>KB down</th>
              <th>DB queries</th>
              <th>About</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, label, r }) => (
              <tr key={id} className={id === sel ? "api-row-on" : ""} onClick={() => setSel(id)}>
                <td>
                  <button className="link-button" onClick={() => setSel(id)}>
                    {label}
                  </button>
                </td>
                <td className="mono">{r.requests}</td>
                <td className="mono">{r.trips}</td>
                <td className="mono">{r.kb.toFixed(1)}</td>
                <td className="mono">{r.db}</td>
                <td className={`mono ${latency(r) === best ? "api-yes" : ""}`}>{latency(r)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="readout-label">Calls made by: {STYLES.find((s) => s.id === sel)!.label}</span>
      <pre className="algo-code api-http">{cur.calls.join("\n")}</pre>
      <div className="tool-readout">
        <div className="readout-cell">
          <span className="readout-label">Bytes the screen uses</span>
          <span className="readout-value">{Math.round((cur.usedKb / cur.kb) * 100)}%</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Time on the network</span>
          <span className="readout-value">{cur.trips * net.rtt} ms</span>
        </div>
        <div className="readout-cell">
          <span className="readout-label">Server time</span>
          <span className="readout-value">{cur.extraMs} ms</span>
        </div>
      </div>
      <p className="gate-note">
        {cur.note}{" "}
        {net.rtt === 1 && sel === "rest"
          ? "Inside the datacenter the extra round trip barely matters, which is why chatty calls between services are tolerable and chatty calls from phones are not."
          : ""}
      </p>
    </div>
  );
}

const FIT_QUIZ: QuizItem[] = [
  {
    q: "A public API that thousands of unknown developers will call from every language, with many cacheable reads.",
    options: ["REST", "gRPC", "GraphQL", "WebSockets"],
    answer: 0,
    why: "Reach and simplicity win: anyone can call it with curl, OpenAPI generates docs and SDKs, and CDNs cache GETs without extra work.",
  },
  {
    q: "Forty internal microservices calling each other tens of thousands of times a second, owned by teams that change contracts often.",
    options: ["REST with JSON", "gRPC", "GraphQL", "Webhooks"],
    answer: 1,
    why: "A shared .proto contract with generated, typed clients catches breaking changes at build time, and binary messages over HTTP/2 cut CPU and latency at that volume. Deadlines propagate with each call.",
  },
  {
    q: "Your own iOS, Android and web apps, with dozens of screens that each need a different mix of the same data, and a frontend team that wants to ship screens without waiting for backend changes.",
    options: ["gRPC", "Webhooks", "GraphQL", "Server-sent events"],
    answer: 2,
    why: "Each screen asks for exactly its fields in one round trip. Budget for the server side: DataLoader for N+1, query depth and cost limits, and persisted queries. A REST backend for frontend is the main alternative.",
  },
  {
    q: "A partner needs to know within seconds when a payment you process settles, without asking every few seconds.",
    options: ["Polling a REST endpoint", "Webhooks", "GraphQL queries", "gRPC unary calls"],
    answer: 1,
    why: "A webhook pushes an HTTP POST to the partner's URL when the event happens. Sign each delivery with an HMAC, retry with backoff, and include an event id so the partner can drop duplicates.",
  },
  {
    q: "A browser dashboard that shows a live stream of prices from the server; the browser never sends anything back.",
    options: ["Server-sent events", "Webhooks", "REST polling every 100 ms", "gRPC bidirectional streaming"],
    answer: 0,
    why: "SSE is one-way server-to-browser streaming over plain HTTP, with automatic reconnects. Use WebSockets if the browser also needs to send messages; browsers can't do native gRPC streaming.",
  },
  {
    q: "A mobile app on a slow network calls six REST endpoints to draw its home screen and it takes two seconds.",
    options: ["Switch every service to gRPC", "Add a backend for frontend that returns the screen in one call", "Cache everything on the phone forever", "Add more servers"],
    answer: 1,
    why: "The time is in sequential round trips over a slow network, not in the servers. A BFF (or GraphQL) moves the six calls into the datacenter, where each costs about a millisecond, and returns one response.",
  },
];

export function ApiStyles() {
  return (
    <div className="tool-widget">
      <ProfileScreen />
      <Quiz title="Part 2: which style fits?" items={FIT_QUIZ} />
      <p className="gate-note">
        Related: <LessonLink id="sd-api-rest-http">REST Resources and HTTP Semantics</LessonLink> ·{" "}
        <LessonLink id="sd-tail-latency">Tail Latency and Request Hedging</LessonLink> · <LessonLink id="sd-resilience">Timeouts, Retries, Circuit Breakers</LessonLink>
      </p>
    </div>
  );
}
