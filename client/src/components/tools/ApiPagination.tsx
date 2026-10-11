import { useState } from "react";
import { LessonLink } from "./netSecShared";

// Part 1: two clients scroll the same newest-first feed, one with offset pagination and one with
// a cursor. Between pages you change the data (new posts at the top, a seen post deleted) and
// compare what each client was shown. Posts made in the same second share a timestamp, so the
// "created_at only" cursor can show the tie bug. Part 2: rows read per page at any depth.

interface Post {
  id: number;
  t: number; // seconds since 09:00:00; every three posts share one
}

const PAGE = 5;
const START = 30;

const timeOf = (id: number) => Math.floor((id + 2) / 3) * 7;
const makePost = (id: number): Post => ({ id, t: timeOf(id) });
const fmt = (t: number) => `09:${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

// Newest first: higher time first, then higher id.
const before = (a: Post, b: Post) => a.t > b.t || (a.t === b.t && a.id > b.id);
const sortFeed = (posts: Post[]) => [...posts].sort((a, b) => (before(a, b) ? -1 : 1));

type CursorKey = "tieBreak" | "timeOnly";

interface Client {
  pages: number[][];
  offset: number;
  cursor: Post | null;
}

interface World {
  feed: Post[];
  nextId: number;
  offsetClient: Client;
  cursorClient: Client;
  topAtStart: Post | null;
  events: string[];
}

const fresh = (): World => ({
  feed: sortFeed(Array.from({ length: START }, (_, i) => makePost(i + 1))),
  nextId: START + 1,
  offsetClient: { pages: [], offset: 0, cursor: null },
  cursorClient: { pages: [], offset: 0, cursor: null },
  topAtStart: null,
  events: [],
});

function cursorPage(feed: Post[], cursor: Post | null, key: CursorKey) {
  const rest = cursor === null ? feed : feed.filter((p) => (key === "tieBreak" ? before(cursor, p) : p.t < cursor.t));
  return rest.slice(0, PAGE);
}

const encode = (p: Post, key: CursorKey) => {
  const json = key === "tieBreak" ? JSON.stringify({ t: fmt(p.t), id: p.id }) : JSON.stringify({ t: fmt(p.t) });
  return btoa(json).replace(/=+$/, "");
};

function stats(c: Client, world: World) {
  const shown = c.pages.flat();
  const counts = new Map<number, number>();
  shown.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
  const dups = [...counts.values()].reduce((n, k) => n + k - 1, 0);
  // Posts that still exist, were in the feed when scrolling began (at or below the first
  // post shown), and sit at or above the deepest post shown, but were never shown.
  const byId = new Map(world.feed.map((p) => [p.id, p]));
  const shownPosts = shown.map((id) => byId.get(id) ?? makePost(id));
  const deepest = shownPosts.reduce<Post | null>((d, p) => (d === null || before(d, p) ? p : d), null);
  const top = world.topAtStart;
  const missed =
    top && deepest
      ? world.feed.filter((p) => !counts.has(p.id) && !before(p, top) && (before(p, deepest) || p.id === deepest.id)).map((p) => p.id)
      : [];
  return { dups, missed, counts };
}

function Feed() {
  const [w, setW] = useState<World>(fresh);
  const [key, setKey] = useState<CursorKey>("tieBreak");

  const fetchNext = () =>
    setW((prev) => {
      const op = prev.feed.slice(prev.offsetClient.offset, prev.offsetClient.offset + PAGE);
      const cp = cursorPage(prev.feed, prev.cursorClient.cursor, key);
      const n = prev.offsetClient.pages.length + 1;
      return {
        ...prev,
        topAtStart: prev.topAtStart ?? prev.feed[0],
        offsetClient: { ...prev.offsetClient, pages: [...prev.offsetClient.pages, op.map((p) => p.id)], offset: prev.offsetClient.offset + PAGE },
        cursorClient: { ...prev.cursorClient, pages: [...prev.cursorClient.pages, cp.map((p) => p.id)], cursor: cp[cp.length - 1] ?? prev.cursorClient.cursor },
        events: [...prev.events, `Both clients fetched page ${n}`],
      };
    });

  const addPosts = () =>
    setW((prev) => {
      const fresh3 = [0, 1, 2].map((i) => makePost(prev.nextId + i));
      return { ...prev, feed: sortFeed([...prev.feed, ...fresh3]), nextId: prev.nextId + 3, events: [...prev.events, `3 new posts arrived at the top (#${prev.nextId} to #${prev.nextId + 2})`] };
    });

  const deleteSeen = () =>
    setW((prev) => {
      const seen = new Set(prev.cursorClient.pages.flat());
      const victim = prev.feed.find((p) => seen.has(p.id));
      if (!victim) return { ...prev, events: [...prev.events, "Fetch a page first, then delete a post from it"] };
      return { ...prev, feed: prev.feed.filter((p) => p.id !== victim.id), events: [...prev.events, `Post #${victim.id}, already seen, was deleted`] };
    });

  const o = stats(w.offsetClient, w);
  const c = stats(w.cursorClient, w);
  const lastCursor = w.cursorClient.cursor;
  const pagesFetched = w.offsetClient.pages.length;

  const column = (title: string, client: Client, st: ReturnType<typeof stats>, sql: string) => (
    <div className="as-partition">
      <div className="as-partition-head">
        <strong>{title}</strong>
        <span className={st.dups + st.missed.length > 0 ? "constraint-fail" : "constraint-ok"}>
          {st.dups} duplicate{st.dups === 1 ? "" : "s"}, {st.missed.length} missed
        </span>
      </div>
      <code className="api-sql">{sql}</code>
      {client.pages.length === 0 && <span className="cache-small">nothing fetched yet</span>}
      {client.pages.map((ids, i) => {
        const earlier = new Set(client.pages.slice(0, i).flat());
        return (
          <div key={i} className="api-page">
            <span className="cache-small">page {i + 1}</span>
            <div className="as-log">
              {ids.length === 0 && <span className="cache-small">empty</span>}
              {ids.map((id) => (
                <span key={id} className={earlier.has(id) ? "as-msg api-dup" : "as-msg"} title={earlier.has(id) ? "already shown on an earlier page" : ""}>
                  #{id}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      {st.missed.length > 0 && (
        <span className="cache-small api-missed-line">
          never shown: {st.missed.map((id) => `#${id}`).join(", ")}
        </span>
      )}
    </div>
  );

  return (
    <div className="crypto-section">
      <h3>Part 1: two clients scroll the same feed</h3>
      <p className="gate-note">
        The feed is newest first, {PAGE} posts a page. Fetch page 1, change the data, then fetch the next page and compare. Posts made in the same
        second share a timestamp.
      </p>
      <div className="cdn-row">
        <span className="cdn-row-label">Cursor sort key (resets)</span>
        <div className="sql-presets">
          <button className={key === "tieBreak" ? "active" : ""} onClick={() => { setKey("tieBreak"); setW(fresh()); }}>
            (created_at, id)
          </button>
          <button className={key === "timeOnly" ? "active" : ""} onClick={() => { setKey("timeOnly"); setW(fresh()); }}>
            created_at only (has a bug)
          </button>
        </div>
      </div>
      <div className="darr-actions">
        <button onClick={fetchNext}>Fetch {pagesFetched === 0 ? "page 1" : `page ${pagesFetched + 1}`}</button>
        <button onClick={addPosts}>3 new posts arrive</button>
        <button onClick={deleteSeen}>Delete a post already seen</button>
        <button onClick={() => setW(fresh())}>Reset</button>
      </div>
      <div className="api-feed">
        <span className="readout-label">The feed right now (top {Math.min(w.feed.length, 20)})</span>
        <div className="as-log">
          {w.feed.slice(0, 20).map((p) => (
            <span key={p.id} className={w.topAtStart && before(p, w.topAtStart) ? "as-msg api-new" : "as-msg as-msg-done"} title={fmt(p.t)}>
              #{p.id}
              <span className="as-offset"> {fmt(p.t).slice(3)}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="as-partitions">
        {column("Offset client", w.offsetClient, o, `... ORDER BY created_at DESC, id DESC LIMIT ${PAGE} OFFSET ${w.offsetClient.offset}`)}
        {column(
          "Cursor client",
          w.cursorClient,
          c,
          lastCursor
            ? key === "tieBreak"
              ? `... WHERE (created_at, id) < ('${fmt(lastCursor.t)}', ${lastCursor.id}) ORDER BY created_at DESC, id DESC LIMIT ${PAGE}`
              : `... WHERE created_at < '${fmt(lastCursor.t)}' ORDER BY created_at DESC LIMIT ${PAGE}`
            : `... ORDER BY created_at DESC, id DESC LIMIT ${PAGE}`,
        )}
      </div>
      {lastCursor && (
        <p className="cache-small api-cursor">
          next_cursor sent to the client: <code>{encode(lastCursor, key)}</code> (base64 of the last post&apos;s{" "}
          {key === "tieBreak" ? "timestamp and id" : "timestamp"})
        </p>
      )}
      <ul className="as-events">
        {w.events.slice(-5).map((e, i) => (
          <li key={i} className="as-ev as-ev-info">
            {e}
          </li>
        ))}
      </ul>
      <p className={o.dups + o.missed.length + c.dups + c.missed.length > 0 ? "constraint-fail" : "gate-note"}>
        {pagesFetched === 0
          ? "Fetch page 1 to start."
          : c.missed.length > 0 && key === "timeOnly"
            ? "The cursor client skipped posts: page 1 ended part-way through a group of posts with the same timestamp, and created_at < last skips the rest of that group forever. Add the id as a tie-breaker."
            : o.dups > 0
              ? "New posts pushed everything down, so the offset client's next page started with posts it had already shown. The cursor client asked for \"posts after #" +
                (lastCursor?.id ?? "") +
                "\", which new posts at the top don't affect."
              : o.missed.length > 0
                ? "A deleted post moved every later post up one place, so the offset skipped a post the client never saw. The cursor client is unaffected."
                : "So far both clients agree. Make 3 new posts arrive, or delete a seen post, then fetch the next page."}
      </p>
    </div>
  );
}

function DeepPages() {
  const [page, setPage] = useState(50);
  const size = 20;
  const offsetRows = (page - 1) * size + size;
  const keysetRows = size;
  const total = 10000; // pages in the table, 200,000 rows
  const scrapeOffset = (size * total * (total + 1)) / 2;
  const scrapeKeyset = size * total;
  const ms = (rows: number) => (rows * 0.0005).toFixed(rows * 0.0005 < 10 ? 2 : 0); // ~2 million index rows a second
  return (
    <div className="crypto-section">
      <h3>Part 2: the cost of page {page.toLocaleString()}</h3>
      <label className="api-slider">
        Page number: <strong>{page.toLocaleString()}</strong>
        <input type="range" min={1} max={10000} value={page} onChange={(e) => setPage(Number(e.target.value))} />
      </label>
      <table className="bigo-table api-table">
        <thead>
          <tr>
            <th></th>
            <th>Offset</th>
            <th>Cursor (keyset)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rows read for this page of {size}</td>
            <td className="mono">{offsetRows.toLocaleString()}</td>
            <td className="mono">{keysetRows}</td>
          </tr>
          <tr>
            <td>Rough time at 2M index rows/s</td>
            <td className="mono">{ms(offsetRows)} ms</td>
            <td className="mono">{ms(keysetRows)} ms</td>
          </tr>
          <tr>
            <td>Rows read to walk all {total.toLocaleString()} pages</td>
            <td className="mono">{scrapeOffset.toExponential(1)}</td>
            <td className="mono">{scrapeKeyset.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <p className="gate-note">
        OFFSET can&apos;t jump to a position: the database walks the index and throws away every skipped row, so the cost grows with the page number
        and walking every page costs roughly n squared over 2 rows. A cursor seeks straight to the last key in the index and reads one page, at any
        depth. That needs an index whose columns match the ORDER BY, here (created_at, id).
      </p>
    </div>
  );
}

export function ApiPagination() {
  return (
    <div className="tool-widget">
      <Feed />
      <DeepPages />
      <p className="gate-note">
        Related: <LessonLink id="sql-indexes">SQL Indexes</LessonLink> · <LessonLink id="sd-interview-news-feed">Design a News Feed</LessonLink>
      </p>
    </div>
  );
}
