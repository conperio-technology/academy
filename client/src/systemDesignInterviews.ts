// Content for the guided system design interview walk-throughs (DesignInterview.tsx).
// Each interview follows the standard 45-minute flow: requirements, estimation, API,
// data model, high-level design, deep dives, wrap-up. Model answers are written the way a
// strong candidate would say them out loud: decisions plus the trade-off behind each one.
//
// Model answer lines: a line starting with "- " renders as a bullet; anything else is a
// paragraph. Consecutive bullets are grouped into one list. Lines between two lines starting
// with ``` render as one code block (used by the OOD walk-throughs in oodInterviews.ts).
//
// The object-oriented design walk-throughs live in oodInterviews.ts with their own stage list
// and are merged into DESIGN_INTERVIEWS below, so the same component renders both kinds.

import { OOD_INTERVIEWS } from "./oodInterviews";
import type { OodId } from "./oodInterviews";

export type SystemDesignId =
  | "urlShortener"
  | "newsFeed"
  | "chat"
  | "rateLimiter"
  | "keyValueStore"
  | "webCrawler"
  | "notificationSystem"
  | "videoStreaming"
  | "rideSharing"
  | "jobScheduler"
  | "paymentSystem"
  | "apiPhotoSharing";

export type DesignId = SystemDesignId | OodId;

// A box in the high-level diagram (or, for OOD, a class or interface in the class diagram). `col` is the left-to-right column (0 = client side);
// boxes in the same column stack top to bottom in the order they're listed. Edges are
// straight lines, so keep every edge between adjacent columns (or within one column).
export interface DiagramNode {
  id: string;
  label: string;
  col: number;
  sub?: string; // optional second line, e.g. the technology
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface DesignStage {
  id: string;
  name: string;
  minutes: number; // suggested time in a 45-minute interview
  instruction: string;
  points: string[]; // what a strong answer covers, one line each
  model: string[]; // model answer, paragraphs and "- " bullets
  diagram?: Diagram; // only on the high-level design (or class diagram) stage
}

export interface DesignInterview {
  id: DesignId;
  title: string;
  prompt: string;
  stages: DesignStage[];
  reviewTip?: string; // summary advice when coverage is low; the system design default otherwise
}

const urlShortener: DesignInterview = {
  id: "urlShortener",
  title: "Design a URL Shortener",
  prompt:
    "\"Design a URL shortening service like bit.ly or TinyURL. Users paste a long URL and get back a short " +
    "link such as https://sho.rt/aZ3kQ9x; anyone who opens the short link is redirected to the original URL.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Ask clarifying questions before designing anything. Split what you hear into functional requirements " +
        "(what the system does) and non-functional ones (scale, latency, availability), and say out loud what " +
        "you're leaving out. Spend about 5 minutes.",
      points: [
        "Core features: create a short link, redirect to the long URL",
        "Asks about custom aliases, expiration, editing or deleting links",
        "Asks whether click analytics are needed and how fresh they must be",
        "States the read/write ratio is heavily read-skewed (about 100:1)",
        "Sets a redirect latency target (p99 under ~50 ms server-side) and high availability for redirects",
        "Notes short codes must be unique, never reused, and preferably not guessable in sequence",
        "Explicitly scopes out things like user accounts UI, billing, link previews",
      ],
      model: [
        "Questions I'd ask: How many new links per day? How short must the code be? Do users want custom aliases? Do links expire? Can a link be edited or deleted after creation? Do we need click analytics, and is a few minutes of delay acceptable? Is it public or only for logged-in users?",
        "Assume the answers: 100 million new links per day, codes as short as possible, custom aliases optional, default expiry never but supported, analytics wanted with a few minutes of delay.",
        "Functional:",
        "- Create a short link for a long URL, optionally with a custom alias and an expiry date.",
        "- Opening the short link redirects to the long URL (or 404/410 if unknown or expired).",
        "- The owner can see click counts by day, country and referrer.",
        "Non-functional:",
        "- Read-heavy: roughly 100 redirects for every link created.",
        "- Redirects are the product: p99 under ~50 ms inside our servers and 99.99% availability. Creation can be slower and less available.",
        "- A code, once issued, always points to the same URL and is never reused for another one.",
        "- Codes shouldn't be enumerable in order, so people can't scrape every link that exists.",
        "Out of scope: account management, billing, link-in-bio pages. I'll mention abuse (spam, malware links) at the end.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Turn the requirements into numbers: requests per second (average and peak), storage over the system's " +
        "lifetime, cache size, and how many characters the code needs. Round aggressively and say the result's " +
        "consequence for the design. About 4 minutes.",
      points: [
        "Writes: 100M/day is about 1,200 per second, peak ~3x",
        "Reads: 10B/day is about 115,000 per second, peak ~300k",
        "Storage: ~365B links over 10 years at ~500 bytes is ~180 TB",
        "Code length from the key space: 62^7 is about 3.5 trillion, so 7 base62 characters",
        "Cache sized from the hot set, not the whole dataset",
        "Draws a conclusion: reads dominate, so caching and a key-value lookup path matter most",
      ],
      model: [
        "Writes: 100M links/day / ~86,400 s ≈ 1,160 per second. Peak at ~3x: about 3,500 per second.",
        "Reads at 100:1: 10B redirects/day ≈ 116,000 per second, peak around 300,000 per second.",
        "Storage: 100M/day × 365 × 10 years ≈ 365 billion links. Each row is a code (7 bytes), a long URL (average ~100-200 bytes, up to 2 KB), owner id, timestamps, plus index and replication overhead. Call it 500 bytes: 365B × 500 B ≈ 180 TB before replication. That's too big for one database, so we shard from day one.",
        "Code length: base62 (a-z, A-Z, 0-9) gives 62^6 ≈ 57 billion (not enough for 365B) and 62^7 ≈ 3.5 trillion (about 10x headroom). So 7 characters.",
        "Cache: link popularity is extremely skewed, so a small hot set serves most redirects. If ~20% of the links clicked each day take 80% of the traffic, and a day touches maybe 1B distinct links, caching 200M of them × 500 B ≈ 100 GB. A small Redis cluster holds that with replicas.",
        "Bandwidth is small: a redirect response is a few hundred bytes, so 116k/s × ~500 B ≈ 60 MB/s outbound.",
        "Conclusion: this is a read-dominated key-value lookup. The design should make the redirect path a cache hit in almost all cases and keep the write path simple.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "Define the external API: endpoints, request and response fields, status codes, and how callers " +
        "authenticate. Keep it short and concrete. About 4 minutes.",
      points: [
        "POST to create with long_url, optional custom_alias and expires_at",
        "GET /{code} returns a redirect with a Location header",
        "Names the redirect status (301 vs 302) and defers the trade-off to the deep dive",
        "Error cases: 404 unknown, 410 expired, 409 alias taken, 400 invalid URL",
        "API keys and per-key rate limits on creation",
        "A stats endpoint for analytics",
      ],
      model: [
        "- POST /api/v1/links  body { long_url, custom_alias?, expires_at? }  ->  201 { code, short_url, expires_at }. 400 for an invalid or blocked URL, 409 if the alias is taken.",
        "- GET /{code}  ->  302 with Location: <long_url>. 404 if the code doesn't exist, 410 Gone if it expired.",
        "- GET /api/v1/links/{code}/stats?from=&to=&group_by=day|country|referrer  ->  click counts.",
        "- DELETE /api/v1/links/{code}  ->  204 (owner only).",
        "Creation requires an API key (or a logged-in session) and is rate limited per key, for example 100 links per minute, because the main abuse vector is bulk-creating spam links. Redirects are anonymous and not rate limited per user, only protected at the edge against floods.",
        "I'm not deduplicating by default: two users shortening the same URL get different codes, so each has their own analytics. A single user can opt into getting their existing code back.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Describe the main entities, their key fields, the access patterns, and pick a storage technology " +
        "that fits those patterns. Say why, and what you're giving up. About 5 minutes.",
      points: [
        "Links table keyed by code: code, long_url, owner_id, created_at, expires_at",
        "Identifies the dominant access pattern: point lookup by code, no joins",
        "Chooses a horizontally scalable key-value or wide-column store (DynamoDB, Cassandra) or sharded SQL, and justifies it",
        "Shards by hash of the code so load spreads evenly",
        "Secondary index on owner_id for \"my links\"",
        "Analytics events stored separately in a columnar/OLAP store, not in the links table",
      ],
      model: [
        "Links: code (primary key, 7 chars), long_url, owner_id, created_at, expires_at. Users and API keys live in a small relational database; they're tiny and benefit from transactions.",
        "The hot access pattern is \"given a code, return the long URL\": a single-key read with no joins, at 100k+ per second, over ~180 TB. That fits a distributed key-value or wide-column store such as DynamoDB or Cassandra: horizontal scaling by partition key, predictable single-digit-millisecond reads, built-in replication. Sharded MySQL or Postgres would also work (it's what many real shorteners started with), but you then own the resharding.",
        "Partition by hash of code so traffic spreads evenly; never by created_at, which would put all new (hot) links on one shard.",
        "\"List my links\" needs owner_id -> codes. In DynamoDB that's a global secondary index on (owner_id, created_at); in Cassandra, a second table keyed by owner_id. It's a low-traffic path, so eventual consistency is fine.",
        "Custom aliases share the same keyspace as generated codes, so creating one is a conditional write (put-if-absent) to avoid two users claiming the same alias.",
        "Click events don't go in the links table. They go to a log (Kafka) and then into a columnar store like ClickHouse or BigQuery, which is built for \"count clicks by day and country\" scans.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw the boxes and arrows: the path of a redirect and the path of a create, end to end. Name each " +
        "component's job. Walk through one request of each kind. About 8 minutes.",
      points: [
        "Separates the read path (redirect) from the write path (create) so they scale independently",
        "Redirect path: load balancer -> stateless redirect service -> cache -> database on miss",
        "Create path: validate URL, get a unique ID, conditional write to the database",
        "An ID generation component, so app servers never coordinate on every write",
        "Click events sent asynchronously to a queue, never blocking the redirect",
        "Stateless services behind load balancers, multiple availability zones",
      ],
      model: [
        "Redirect: the client hits a CDN/load balancer, which forwards to a stateless redirect service. It looks the code up in Redis; on a hit (well over 90% of requests) it returns 302 immediately. On a miss it reads the database, fills the cache, and returns. It then drops a click event onto Kafka without waiting.",
        "Create: the client calls the write API, which validates the URL (format, length, a safe-browsing check), gets a fresh ID from its locally leased ID range, base62-encodes it, and does a conditional insert into the links database. It doesn't need to populate the cache; the first redirect will.",
        "Analytics: a stream processor (Flink or a Kafka consumer group) reads click events, enriches them (country from IP, device from user agent), and writes pre-aggregated per-minute counts into ClickHouse. The stats endpoint queries ClickHouse.",
        "Everything stateless runs in at least three availability zones behind load balancers. The redirect fleet and write fleet are separate deployments, so a spike in creates can't slow down redirects.",
      ],
      diagram: {
        nodes: [
          { id: "client", label: "Client", col: 0, sub: "browser / app" },
          { id: "lb", label: "CDN + LB", col: 1 },
          { id: "redirect", label: "Redirect service", col: 2, sub: "stateless" },
          { id: "write", label: "Write API", col: 2, sub: "stateless" },
          { id: "cache", label: "Cache", col: 3, sub: "Redis" },
          { id: "kafka", label: "Click log", col: 3, sub: "Kafka" },
          { id: "db", label: "Links DB", col: 3, sub: "DynamoDB / Cassandra" },
          { id: "idgen", label: "ID ranges", col: 3, sub: "etcd / DB row" },
          { id: "olap", label: "Analytics", col: 4, sub: "ClickHouse" },
        ],
        edges: [
          { from: "client", to: "lb" },
          { from: "lb", to: "redirect", label: "GET /code" },
          { from: "lb", to: "write", label: "POST" },
          { from: "redirect", to: "cache", label: "1. lookup" },
          { from: "redirect", to: "kafka", label: "click" },
          { from: "redirect", to: "db", label: "2. on miss" },
          { from: "write", to: "db", label: "insert" },
          { from: "write", to: "idgen", label: "lease" },
          { from: "kafka", to: "olap", label: "aggregate" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "Go deep on the 2-3 parts that make this problem hard. Compare at least two options for each and pick " +
        "one with a reason. Expect the interviewer to steer you here. About 15 minutes.",
      points: [
        "Compares hashing, a counter with base62, and a key-generation service / range leasing for IDs",
        "Handles collisions (hash approach) and enumerability (counter approach)",
        "301 vs 302: browser caching and lower load vs accurate analytics and editable links",
        "Caching hot links: cache-aside, LRU, negative caching of misses, hot-key handling",
        "Analytics written asynchronously through a log, aggregated, approximate uniques with HyperLogLog",
        "Mentions abuse: malicious URLs, creation rate limits",
      ],
      model: [
        "1. Generating the code. Three common options:",
        "- Hash the long URL (MD5/SHA-256), base62-encode, keep 7 characters. Same URL gives the same code, but truncating creates collisions: with hundreds of billions of codes in a 3.5-trillion space, collisions become common, so every write needs \"insert if absent, else re-hash with a salt and retry\". That's an extra round trip and gets worse as the space fills.",
        "- A global counter, base62-encoded. Never collides and codes stay short, but one counter is a bottleneck and single point of failure, and sequential codes (aZ3kQ9x, aZ3kQ9y...) let anyone enumerate every link.",
        "- Range leasing (a key-generation service). Each write server leases a block of, say, 1 million IDs from a coordinator (an etcd/ZooKeeper key or a single DB row updated atomically) and hands them out from memory. The coordinator is touched once per million writes; a crashed server just wastes the rest of its block, which the 3.5T space easily absorbs. To fix enumerability, pass the counter through a reversible scramble (for example a small block cipher / format-preserving encryption over the 62^7 range) before encoding: still unique, no longer sequential.",
        "I'd pick range leasing plus scrambling. Pre-generating random keys into a table and handing them out is a valid variant of the same idea. Snowflake-style 64-bit IDs are unique without coordination but encode to 11 base62 characters, too long for this product.",
        "2. 301 vs 302. A 301 (permanent) is cached by browsers, so repeat clicks never reach us: less load, but we lose those clicks from analytics, and we can't change or expire the link for anyone who has it cached. A 302 (or 307) is not cached by default, so every click is counted and links stay editable, at the cost of serving every click. Because analytics and expiry are requirements, I'd use 302 and let the CDN cache the redirect for a short time (Cache-Control: s-maxage=60) for viral links, logging clicks at the edge.",
        "3. Caching hot links. Cache-aside in Redis with LRU eviction: the redirect service reads Redis, falls back to the DB, then writes the result back with a TTL. Cache misses too (\"code not found\" for a minute) so scanners trying random codes don't hammer the database. A single viral link can overload one Redis shard, so keep a tiny in-process LRU (a few thousand entries, a few seconds TTL) on each redirect server; that absorbs the hottest keys. On deletes or edits, delete the cache key after writing the DB.",
        "4. Analytics. The redirect never waits on analytics: it appends an event to an in-memory buffer that's flushed to Kafka. Losing a few clicks during a crash is acceptable; slowing redirects isn't. A stream job aggregates counts per code per minute into ClickHouse. Unique visitors use HyperLogLog sketches (about 12 KB each, ~1% error) instead of storing every visitor ID.",
        "Abuse: check new URLs against a malware/phishing list (such as Google Safe Browsing) on create and periodically after, and rate limit creation per API key and per IP.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction:
        "Step back: where does this design break first, what happens when each component fails, and what would " +
        "you put on the dashboard. Finish on time. About 4 minutes.",
      points: [
        "Bottleneck: hot keys on one cache shard, handled with a local cache or key replication",
        "Cache cluster failure causes a database stampede; needs request coalescing and load shedding",
        "ID coordinator outage doesn't stop writes while servers still hold leased blocks",
        "Analytics pipeline outage degrades stats only; redirects keep working",
        "Multi-region reads for redirects, with writes going to one home region or a global table",
        "Metrics: redirect p99 latency, 5xx and 404 rates, cache hit ratio, Kafka consumer lag, creation rate per key",
      ],
      model: [
        "Bottlenecks: the first thing to break is a hot key (a link shared during the Super Bowl) concentrating on one cache shard; the local in-process cache and CDN caching handle it. Next is database resharding as data grows past the initial partition count; a store with consistent hashing (Cassandra, DynamoDB) does this online.",
        "Failure modes:",
        "- Redis cluster down: every redirect falls through to the database at 100k+/s. Mitigate with request coalescing (one DB read per code at a time), a circuit breaker, and shedding load rather than taking the DB down too.",
        "- ID coordinator down: write servers keep using their leased blocks; with 1M-ID blocks at ~100 writes/s per server, that's hours of runway.",
        "- Kafka or ClickHouse down: stats go stale; redirects are unaffected. Buffers drop events once full, by design.",
        "- A region down: redirects are served from other regions with replicated data (DynamoDB global tables or multi-DC Cassandra). Creates can fail over too, since codes come from disjoint ID ranges and can't collide.",
        "Monitoring: redirect p50/p99 latency, 5xx rate, 404 rate (a spike means a scanner or a broken integration), cache hit ratio, DB read latency, Kafka consumer lag, ID block consumption rate, and creates per API key to catch spam bursts.",
        "If I had more time: per-link geo-routing, link previews, and a bulk-create API.",
      ],
    },
  ],
};

const newsFeed: DesignInterview = {
  id: "newsFeed",
  title: "Design a News Feed",
  prompt:
    "\"Design the home timeline for a social network like Twitter/X or Facebook. Users publish posts and follow " +
    "other users; when they open the app they see a feed of recent posts from the people they follow.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Clarify the scope before designing. The answers to \"ranked or chronological?\" and \"how many followers " +
        "can one account have?\" change the whole design, so ask them early. About 5 minutes.",
      points: [
        "Core features: publish a post, follow/unfollow, read the home feed with pagination",
        "Asks chronological vs ranked feed",
        "Asks about the follower distribution, especially accounts with millions of followers",
        "Feed load latency target (p99 under ~300 ms) and high availability",
        "Accepts eventual consistency: a new post may take a few seconds to appear in followers' feeds",
        "Scopes out search, notifications, DMs, ads",
      ],
      model: [
        "Questions I'd ask: How many daily active users? Is the feed chronological or ranked? Text only, or images and video? What's the largest follower count an account can have? How fresh must the feed be after someone posts? How far back can users scroll?",
        "Assume: 300M DAU, a ranked feed (chronological as a fallback), posts with optional images, celebrity accounts with up to 100M followers, new posts visible to followers within ~5 seconds.",
        "Functional:",
        "- Publish a post (text plus optional media).",
        "- Follow and unfollow users.",
        "- Load the home feed: posts from followed accounts, newest or best first, with infinite scroll.",
        "Non-functional:",
        "- Feed load p99 under ~300 ms; the feed is the first screen of the app.",
        "- Highly available: showing a slightly stale feed is far better than an error.",
        "- Eventually consistent: a few seconds of delay between posting and appearing in followers' feeds is fine.",
        "- Read-heavy: many more feed loads than posts.",
        "Out of scope: search, notifications, DMs, ads, and the details of the ML models (I'll describe the ranking pipeline, not train it).",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Compute feed reads per second, posts per second, and, most importantly, how many feed writes fan-out " +
        "would create. Size the feed cache. About 4 minutes.",
      points: [
        "Feed reads: 300M DAU × 10 opens = 3B/day, about 35k/s, peak ~100k/s",
        "Posts: ~200M/day, about 2,300/s",
        "Fan-out cost: posts × average followers (~200) = ~40B feed inserts/day, ~460k/s",
        "One celebrity post with 100M followers = 100M inserts on its own",
        "Feed cache: ~800 post IDs per active user, a few TB of RAM in total",
        "Media in object storage plus CDN, sized separately from post metadata",
      ],
      model: [
        "Feed reads: 300M DAU × ~10 feed loads/day = 3B/day ≈ 35,000 per second, peak ~100,000 per second.",
        "Posts: say 200M posts/day ≈ 2,300 per second, peak ~7,000.",
        "Fan-out: if each post is copied into every follower's feed and the average account has ~200 followers, that's 200M × 200 = 40B feed inserts per day ≈ 460,000 per second. This is the number that drives the design. And it's skewed: one post from a 100M-follower account is 100M inserts by itself.",
        "Post storage: ~1 KB per post (text, ids, timestamps) × 200M/day = 200 GB/day ≈ 73 TB/year before replication. If 10% of posts carry a ~500 KB image: 10 TB/day of media, which goes to object storage behind a CDN.",
        "Feed cache: store only post IDs, not posts. 800 IDs × ~16 bytes (id + score) ≈ 13 KB per user, × 300M active users ≈ 4 TB of RAM. A Redis cluster of a few hundred nodes, plus replicas.",
        "Conclusion: reads must be served from precomputed data, but naive fan-out on write is unaffordable for the biggest accounts.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction: "Define the endpoints for posting, following and reading the feed, including pagination. About 4 minutes.",
      points: [
        "POST /posts returning a time-sortable post_id",
        "GET /feed with cursor-based pagination, not offset",
        "Follow and unfollow endpoints",
        "Media uploaded separately via pre-signed URLs to object storage",
        "Feed response contains hydrated posts (author, text, media URLs, counts)",
      ],
      model: [
        "- POST /v1/posts  { text, media_ids[] }  ->  201 { post_id, created_at }",
        "- POST /v1/media  ->  { media_id, upload_url }: the client uploads the file straight to object storage with a pre-signed URL, so large files never pass through our API servers.",
        "- GET /v1/feed?limit=20&cursor=<opaque>  ->  { posts: [...], next_cursor }",
        "- PUT /v1/users/{id}/follow and DELETE /v1/users/{id}/follow",
        "Pagination is cursor-based. With offsets, new posts arriving at the top shift everything down while you scroll, so you see duplicates; a cursor encodes \"items after this score and post_id\" and is stable.",
        "Each feed item is hydrated: author name and avatar, text, media CDN URLs, like and reply counts, and whether the viewer liked it.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Lay out the posts, the social graph and the precomputed feed, with the key each one is looked up by " +
        "and a store that fits. About 5 minutes.",
      points: [
        "Posts keyed by post_id; author timeline keyed by author_id with post_ids newest first",
        "Time-sortable 64-bit IDs (Snowflake-style) so sorting by ID sorts by time",
        "Social graph stored in both directions: followers_of and following_of",
        "Feed cache per user: a capped sorted set of post_ids in Redis",
        "Feed stores IDs only; posts are hydrated from a post cache at read time",
        "Media in object storage plus CDN",
      ],
      model: [
        "Posts: post_id, author_id, text, media refs, created_at. Post IDs are Snowflake-style 64-bit integers (41 bits of millisecond timestamp, 10 bits of machine, 12 bits of sequence), so they're unique without coordination and sort by time. Stored in a wide-column store (Cassandra) or sharded MySQL keyed by post_id.",
        "Author timelines: author_id -> post_ids newest first (a Cassandra partition per author, clustered by post_id descending). This is what pull-based reads and new-follower backfills use.",
        "Social graph: two tables, followers(user_id, follower_id) and following(user_id, followee_id), each partitioned by its first column, because fan-out needs \"who follows X\" and feed reads need \"whom does X follow\". Writes to both happen together; a short window where they disagree is acceptable.",
        "Feed cache: Redis sorted set feed:{user_id} of post_ids scored by time (or rank), trimmed to ~800 entries. The database is the source of truth; the feed cache can always be rebuilt.",
        "Post cache: post_id -> post object in Memcached/Redis, used to hydrate IDs into posts. Because feeds hold only IDs, edits and deletes show up everywhere after one cache update.",
        "Media: object storage (S3) behind a CDN, referenced by URL.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw the write path (post -> followers' feeds) and the read path (open app -> ranked feed). Walk through " +
        "both. About 8 minutes.",
      points: [
        "Post service writes the post durably, then publishes an event to a queue",
        "Fan-out workers consume events, look up followers, and push post_ids into feed caches",
        "Feed service reads the feed cache, merges in celebrity posts, ranks, and hydrates",
        "Asynchronous fan-out so posting returns quickly",
        "Media served from a CDN, never through the feed service",
      ],
      model: [
        "Write path: the client posts to the post service, which stores the post and appends it to the author's timeline, then publishes \"post created\" to Kafka and returns. Fan-out workers consume the event, fetch the author's followers from the graph service in pages, and ZADD the post_id into each active follower's feed cache, trimming to 800.",
        "Read path: the feed service reads the viewer's feed:{user_id} from Redis, adds recent posts from any celebrities the viewer follows (pulled from their author timelines), sends the candidates to the ranking service, hydrates the top 20 from the post cache, and returns them with a cursor.",
        "Kafka between posting and fan-out means a celebrity post or a traffic spike just builds a backlog; it never slows down the post request itself.",
      ],
      diagram: {
        nodes: [
          { id: "client", label: "Client", col: 0 },
          { id: "gw", label: "API gateway", col: 1, sub: "LB + auth" },
          { id: "post", label: "Post service", col: 2 },
          { id: "feed", label: "Feed service", col: 2 },
          { id: "kafka", label: "Post events", col: 3, sub: "Kafka" },
          { id: "postdb", label: "Posts DB + cache", col: 3, sub: "Cassandra + Memcached" },
          { id: "feedcache", label: "Feed cache", col: 3, sub: "Redis sorted sets" },
          { id: "rank", label: "Ranking", col: 3, sub: "ML scoring" },
          { id: "fanout", label: "Fan-out workers", col: 4 },
          { id: "graph", label: "Graph service", col: 5, sub: "followers" },
        ],
        edges: [
          { from: "client", to: "gw" },
          { from: "gw", to: "post", label: "publish" },
          { from: "gw", to: "feed", label: "load feed" },
          { from: "post", to: "kafka", label: "event" },
          { from: "post", to: "postdb", label: "store" },
          { from: "kafka", to: "fanout" },
          { from: "fanout", to: "graph", label: "followers" },
          { from: "fanout", to: "feedcache", label: "push ids" },
          { from: "feed", to: "rank", label: "rank" },
          { from: "feed", to: "feedcache", label: "read ids" },
          { from: "feed", to: "postdb", label: "hydrate" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "The interviewer will almost certainly ask about fan-out and the celebrity problem. Be ready for ranking " +
        "and the feed cache too. Compare options and commit to one. About 15 minutes.",
      points: [
        "Fan-out on write: cheap reads, expensive and slow writes for big accounts",
        "Fan-out on read: cheap writes, expensive reads (one lookup per followee)",
        "Hybrid: push for normal accounts, pull for celebrities above a follower threshold",
        "Skip fan-out to inactive users; rebuild their feed on demand",
        "Ranking as stages: candidate generation, light ranker, heavy ranker, filters",
        "Deletes, unfollows and blocks handled by filtering at read time",
        "Cursor pagination over a capped feed with a cold-start rebuild path",
      ],
      model: [
        "1. Fan-out on write vs on read.",
        "- Fan-out on write (push): when someone posts, insert the post_id into every follower's feed. Reading a feed is one Redis read, which is what we want at 100k reads/s. But writes multiply by follower count, and for a 100M-follower account that's 100M inserts: minutes of lag and a huge burst of work, much of it for users who won't open the app today.",
        "- Fan-out on read (pull): store posts only in the author's timeline; at read time, fetch the recent posts of everyone the viewer follows and merge them. Posting is cheap, but a user following 1,000 accounts needs 1,000 lookups per feed load, which blows the latency budget.",
        "- Hybrid (what Twitter described doing): push for ordinary accounts, pull for accounts above a threshold (say 100k followers). At read time the feed service merges the precomputed feed with the latest posts from the handful of celebrities the viewer follows; those celebrity timelines are tiny and very hot, so they sit in cache. Also skip pushing to users inactive for 30+ days and rebuild their feed with the pull path when they return.",
        "2. Ranking. A ranked feed runs in stages so the expensive model sees few items: candidate generation (~1,000 posts from the feed cache, celebrity pulls, and optionally recommended out-of-network posts) -> a light model to cut to a few hundred -> a heavy model that predicts engagement probabilities (like, reply, repost, dwell, hide) combined into one score -> filters and heuristics (remove blocked or muted authors, already-seen posts, limit consecutive posts per author, mix in diversity). The ranked page is cached for a few minutes so scrolling and refreshes don't re-run the models. If ranking times out, fall back to reverse-chronological from the same candidates.",
        "3. Feed cache details. Cap each feed at ~800 IDs; nobody scrolls further, and older history comes from the pull path. Pagination uses a cursor of (score, post_id). Deletes don't touch millions of feeds: the post is tombstoned, and hydration drops it. Unfollows and blocks are filtered at read time, and new follows backfill the followee's latest ~20 posts into the feed.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction: "Name the bottlenecks, what happens when parts fail, and what you'd monitor. About 4 minutes.",
      points: [
        "Fan-out backlog during big events; the queue absorbs it and lag is the metric",
        "Hot posts overload one post-cache shard; replicate hot keys or cache locally",
        "Feed cache node loss: rebuild via the pull path, slower but correct",
        "Ranking failure falls back to chronological rather than an error",
        "Metrics: post-to-visible lag, feed load p99, cache hit ratio, Kafka lag, empty-feed rate, ranking fallback rate",
      ],
      model: [
        "Bottlenecks: fan-out throughput during global events (a World Cup final), which shows up as Kafka consumer lag; add workers and prioritize fan-out to recently active users first. Viral posts make hot keys in the post cache; replicate them across shards or cache them in-process on feed servers.",
        "Failure modes:",
        "- A Redis feed-cache node dies: its users' feeds are rebuilt from the pull path (author timelines plus the graph). Slower, but correct, and it fills back in.",
        "- Ranking service slow or down: serve reverse-chronological. A stale or unranked feed beats an error screen.",
        "- Fan-out workers behind: posts appear late, nothing is lost, because Kafka retains the events.",
        "Monitoring: post-to-visible-in-feed lag (p50/p99), feed load p99, feed cache hit ratio, Kafka consumer lag, the share of feed loads that return empty or tiny feeds (a correctness alarm), and the ranking fallback rate.",
      ],
    },
  ],
};

const chat: DesignInterview = {
  id: "chat",
  title: "Design a Chat App",
  prompt:
    "\"Design a messaging service like WhatsApp or Messenger: one-to-one and group chats on mobile, with " +
    "delivery and read receipts, online status, and messages delivered to people who were offline.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Pin down the features and especially the guarantees: ordering, durability, and delivery semantics. " +
        "About 5 minutes.",
      points: [
        "1:1 and group chat, with a group size limit",
        "Sent, delivered and read receipts; online/last-seen presence",
        "Offline users get messages later plus a push notification",
        "Multi-device: history syncs to a new or reconnecting device",
        "Guarantees: no message loss once acknowledged, per-conversation ordering, delivery under ~500 ms when both online",
        "Scopes out calls and the details of end-to-end encryption",
      ],
      model: [
        "Questions I'd ask: How many daily users? Maximum group size? Do we need multiple devices per user? Is history stored on the server or only on devices? Do we need end-to-end encryption? Media messages?",
        "Assume: 500M DAU, groups up to 1,000 members, multiple devices per user, server-side history, images via upload. End-to-end encryption is desired but I'll treat message bodies as opaque bytes, which is how E2E systems look to the server anyway.",
        "Functional:",
        "- Send and receive 1:1 and group messages (text, images).",
        "- Receipts: sent (server has it), delivered (recipient device has it), read.",
        "- Presence: online, or last seen at a time.",
        "- Offline delivery with a push notification; history sync on reconnect or on a new device.",
        "Non-functional:",
        "- Once the server acknowledges a message, it is never lost.",
        "- Messages in a conversation appear in the same order for everyone.",
        "- Under ~500 ms end to end when both users are online; high availability.",
        "Out of scope: voice and video calls, stories, the encryption protocol itself.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Estimate message throughput, storage, and the number most candidates forget: concurrent open " +
        "connections. About 4 minutes.",
      points: [
        "Messages: 500M DAU × 40 = 20B/day, about 230k/s, peak ~700k/s",
        "Storage: ~200 bytes per message is ~4 TB/day, ~1.5 PB/year before replication",
        "Concurrent connections: ~150M at peak",
        "Connections per server (100k-1M) gives the size of the gateway fleet",
        "Presence heartbeat traffic is large and must ride the existing connection",
      ],
      model: [
        "Messages: 500M DAU × 40 messages/day = 20B/day ≈ 230,000 per second, peak ~700,000 per second.",
        "Storage: ~100 bytes of body plus ids, timestamps and metadata ≈ 200 bytes/message: 20B × 200 B = 4 TB/day ≈ 1.5 PB/year, about 4.5 PB with 3x replication. Media is far larger and goes to object storage.",
        "Concurrent connections: if ~30% of DAU are online at peak, that's 150M open WebSocket connections. A tuned gateway holds a few hundred thousand to a million idle connections (WhatsApp famously ran ~2M per Erlang server); planning for 200k per server gives ~750 gateway servers, plus headroom for a zone failure.",
        "Heartbeats: 150M connections × one ping every 30 s = 5M small frames per second. That's why heartbeats are handled inside the gateways and presence changes are published sparingly.",
        "Conclusion: the hard parts are millions of long-lived stateful connections and a write-heavy, append-only message store, not raw bandwidth.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "Real-time messaging needs a persistent connection plus a few REST endpoints. Define the frames each " +
        "way and the REST calls. About 4 minutes.",
      points: [
        "Persistent WebSocket over TLS, authenticated with a token on connect",
        "Client send frame carries a client-generated message id for idempotent retries",
        "Server acks with the assigned message id / sequence number",
        "Frames for delivered and read receipts, typing, and presence",
        "REST for history (cursor by sequence), creating groups, and media upload URLs",
      ],
      model: [
        "Connection: wss://chat.example.com/v1/connect with an auth token. One connection per device.",
        "Client -> server frames:",
        "- send { client_msg_id, conversation_id, body, media_ids? }",
        "- delivered { conversation_id, up_to_seq } and read { conversation_id, up_to_seq }",
        "- typing { conversation_id }, ping",
        "Server -> client frames:",
        "- ack { client_msg_id, message_id, seq, server_ts }: \"sent\", stored durably.",
        "- message { conversation_id, message_id, seq, sender_id, body, server_ts }",
        "- receipt { conversation_id, user_id, type: delivered|read, up_to_seq }, presence { user_id, status, last_seen }",
        "REST: GET /v1/conversations/{id}/messages?before_seq=&limit=50 for history, GET /v1/sync?since=<cursor> for catch-up after reconnecting, POST /v1/conversations to create a group, POST /v1/media for a pre-signed upload URL.",
        "The client_msg_id makes retries safe: if the ack is lost and the client resends, the server sees the same id and returns the original ack instead of storing a duplicate.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Design the message table around how it's read (\"latest messages in this conversation\"), plus " +
        "membership, read state and where online sessions are tracked. About 5 minutes.",
      points: [
        "Messages partitioned by conversation_id, clustered by sequence/message_id",
        "Wide-column store (Cassandra/ScyllaDB, HBase) for write-heavy append-only data",
        "Membership with per-member last_delivered_seq and last_read_seq instead of per-message receipt rows",
        "Session registry: user/device -> gateway server, in Redis with a TTL",
        "Bucket very large or old conversations by time to bound partition size",
      ],
      model: [
        "Messages: partition key conversation_id, clustering key seq (descending), columns message_id, sender_id, body (opaque bytes), media refs, server_ts. Reading \"the last 50 messages of this chat\" is one partition, one contiguous slice. This is a write-heavy, append-only, time-ordered workload, which is what Cassandra/ScyllaDB and HBase are good at (Discord stores trillions of messages in ScyllaDB; Messenger used HBase). For huge or long-lived groups, add a time bucket to the partition key so no partition grows without bound.",
        "Conversations and members: conversation(id, type, title, created_at) and member(conversation_id, user_id, role, last_delivered_seq, last_read_seq). Storing \"read up to seq N\" per member replaces a row per message per recipient: one update covers any number of messages.",
        "Per-user inbox index: user_id -> conversations ordered by last activity, for the chat list screen.",
        "Session registry: (user_id, device_id) -> gateway server id, in Redis with a ~60 s TTL refreshed by heartbeats. Presence (online, last_seen) also lives in Redis.",
        "Media: object storage plus CDN; the message carries only a reference (and, with E2E, the decryption key is inside the encrypted body).",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw how a message travels from sender to recipient, both when the recipient is online and when they're " +
        "offline. About 8 minutes.",
      points: [
        "Stateful WebSocket gateways behind an L4 load balancer, separate from stateless chat logic",
        "Chat service persists the message before acking the sender",
        "Session registry lookup to find which gateway holds the recipient's connection",
        "Offline path: message waits in storage, push notification via APNs/FCM",
        "Presence service fed by gateway connect/disconnect and heartbeat events",
      ],
      model: [
        "Online path: the sender's device holds a WebSocket to a gateway. The gateway forwards the send frame to the chat service, which assigns the next seq for the conversation, writes the message to the message store, and acks the sender (one check). It then looks up each recipient's devices in the session registry and forwards the message to the gateway that holds each connection, which pushes it down the socket. The recipient device acks, and the chat service relays a delivered receipt to the sender (two checks).",
        "Offline path: no session in the registry, so the chat service hands the message to the push service, which sends a notification through APNs (iOS) or FCM (Android). The message is already in the store; when the app reconnects it syncs everything after its last seen seq.",
        "Gateways only hold connections and relay frames; all logic lives in the stateless chat service. That way gateways can be very lean (memory per connection) and the chat service can be deployed often without dropping millions of connections.",
      ],
      diagram: {
        nodes: [
          { id: "client", label: "Mobile clients", col: 0 },
          { id: "lb", label: "L4 load balancer", col: 1 },
          { id: "gw", label: "WebSocket gateways", col: 2, sub: "stateful" },
          { id: "chat", label: "Chat service", col: 3, sub: "stateless" },
          { id: "presence", label: "Presence service", col: 3 },
          { id: "store", label: "Message store", col: 4, sub: "Cassandra / ScyllaDB" },
          { id: "registry", label: "Session registry", col: 4, sub: "Redis + TTL" },
          { id: "push", label: "Push service", col: 4 },
          { id: "apns", label: "APNs / FCM", col: 5 },
        ],
        edges: [
          { from: "client", to: "lb", label: "WSS" },
          { from: "lb", to: "gw" },
          { from: "gw", to: "chat", label: "frames" },
          { from: "gw", to: "presence", label: "heartbeats" },
          { from: "chat", to: "store", label: "persist" },
          { from: "chat", to: "registry", label: "find gateway" },
          { from: "chat", to: "push", label: "if offline" },
          { from: "presence", to: "registry" },
          { from: "push", to: "apns" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "Pick the 2-3 areas the interviewer cares about: connections, ordering, delivery guarantees and offline " +
        "sync, group fan-out, presence. Explain the mechanism and the trade-off for each. About 15 minutes.",
      points: [
        "WebSockets vs long polling; heartbeats; reconnect with exponential backoff and jitter",
        "Per-conversation sequence numbers from a single writer, not device clocks",
        "At-least-once delivery plus client-side dedupe by message id",
        "Receipts as \"up to seq N\" watermarks; sync from last seen seq on reconnect",
        "Group fan-out: write once, deliver per member; large channels switch to pull",
        "Presence: TTL heartbeats, debounce flapping, publish only to users who are looking",
      ],
      model: [
        "1. Connections. WebSockets give a full-duplex channel with a few bytes of framing per message; long polling works through hostile proxies but pays an HTTP request per message and adds latency, so keep it only as a fallback. Clients ping every ~30 s to detect dead connections and keep mobile NAT mappings alive. When a gateway restarts, hundreds of thousands of clients reconnect at once, so they must back off exponentially with random jitter; deploys drain gateways gradually instead of killing them.",
        "2. Ordering and IDs. Device clocks can't be trusted, and Snowflake-style IDs from different servers can be out of order by clock skew. Instead, give each conversation a single writer: route all sends for a conversation to one chat-service partition (hash of conversation_id, or a Kafka partition keyed by it), which assigns seq = previous + 1. Everyone sorts by seq. A gap (seq 41 then 43) tells the client to fetch 42.",
        "3. Delivery guarantees and offline sync. The server persists before acking, so an acked message survives any crash. Delivery is at-least-once: the server retries until the device acks, and the client drops duplicates by message_id, so the user sees each message exactly once. Receipts are watermarks: \"delivered up to seq 57\", \"read up to seq 55\", one small update for any number of messages. On reconnect, the device sends its last seq per conversation (or one per-user sync cursor) and pulls everything after it, which also handles a brand new device. Push notifications are a hint that wakes the app; they're best-effort, so correctness never depends on them.",
        "4. Group fan-out. Store the message once in the conversation partition, then deliver to each member's online devices: 1,000 members means up to 1,000 sends, fine at this scale. Read state is per member (last_read_seq), and \"read by everyone\" is the minimum across members. For channels with 100k+ members, stop pushing every message: members pull when they open the channel, and receipts are turned off.",
        "5. Presence. A user is online while their heartbeat keeps a Redis key alive (TTL ~60 s). Telling every contact about every status change multiplies traffic by contact count, so presence is published only to users who currently have that chat or contact list open, and changes are debounced (offline only after ~30-60 s without a heartbeat) so a train going through a tunnel doesn't flap.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction: "Bottlenecks, failure modes and monitoring for a system with millions of open connections. About 4 minutes.",
      points: [
        "Reconnect storms after a gateway or zone failure; backoff with jitter and spare capacity",
        "Gateway crash loses no messages because they were persisted before the ack",
        "Lost ack causes a retry, deduped by client_msg_id",
        "Hot groups and celebrity-scale channels move to a pull model",
        "Metrics: send-to-delivered p99, connections per gateway, reconnect rate, undelivered backlog, push success rate, store write latency",
      ],
      model: [
        "Bottlenecks: gateway memory per connection (aim for tens of KB), reconnect storms, and message store write throughput (~700k writes/s at peak, ×3 replicas). Very active groups create hot partitions in both the chat service and the store.",
        "Failure modes:",
        "- A gateway crashes: its clients reconnect to other gateways, their registry entries expire by TTL, and nothing is lost because every message was stored before it was acked. Clients sync from their last seq.",
        "- The chat service crashes after storing but before acking: the client times out and resends with the same client_msg_id; the server returns the original ack.",
        "- APNs/FCM throttle or fail: users see messages when they next open the app, because push is only a wake-up.",
        "- A whole zone fails: ~1/3 of connections reconnect elsewhere, so keep that much spare gateway capacity.",
        "Monitoring: send-to-delivered latency p50/p99, open connections per gateway, reconnect rate, messages stored but undelivered for more than a minute, push success rate, message store write latency, and the duplicate-send rate (a spike means acks are being lost).",
      ],
    },
  ],
};

const rateLimiter: DesignInterview = {
  id: "rateLimiter",
  title: "Design a Rate Limiter",
  prompt:
    "\"Design a rate limiter for a public API platform, like the one in front of Stripe's API or built into an " +
    "API gateway. It should cap how many requests each client can make across a whole fleet of servers, and tell " +
    "clients clearly when they are over the limit.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Find out what is being limited, by which key, and how strict the limit has to be. \"Is it fine to let " +
        "through 5% too many?\" and \"what happens if the limiter is down?\" shape the whole design, so ask them " +
        "now. About 5 minutes.",
      points: [
        "Limits by several keys at once: API key, user, IP address, endpoint",
        "Rules configurable per customer tier, changeable without a deploy",
        "Over-limit requests get 429 with Retry-After and remaining-quota headers",
        "Latency budget for the check itself (about 1 ms p50, under 5 ms p99)",
        "Asks how exact the limit must be; accepts a small overshoot for speed",
        "Asks what happens when the limiter fails, and that it must never take the API down",
        "Scopes out DDoS protection at the network layer and billing by usage",
      ],
      model: [
        "Questions I'd ask: Is this a separate service, or middleware inside our gateway? What do we limit by: API key, user, IP, endpoint? Are limits per second, per minute, per day? Do customers on different plans get different limits? Is it one region or several? How exact must the limit be? If the limiter itself breaks, should the API keep serving?",
        "Assume: middleware in our API gateway in front of all public APIs, 3 regions, limits such as \"100 requests per second per API key, with bursts up to 200\" and \"20 login attempts per minute per IP\", and a small overshoot (a few percent) is acceptable.",
        "Functional:",
        "- Apply several rules to each request (per API key, per key and endpoint, per IP for anonymous traffic) and reject it if any rule is exceeded.",
        "- Rules and per-customer overrides are data, editable at runtime, including a shadow mode that logs but doesn't block.",
        "- Rejected requests get 429 Too Many Requests with Retry-After; every response carries the client's limit and remaining quota.",
        "Non-functional:",
        "- The check adds about 1 ms at p50 and under 5 ms at p99; it sits on every API call.",
        "- Highly available, and more importantly harmless when broken: a limiter outage must not become an API outage.",
        "- Accurate enough: allowing 102 requests against a limit of 100 is fine, allowing 300 is not.",
        "Out of scope: volumetric DDoS (handled by the CDN and network layer), usage-based billing, and bot detection. I'll mention concurrency limits briefly.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Size the counter traffic, not just the API traffic: every request turns into one or more counter " +
        "updates. Then check memory and the latency budget. About 4 minutes.",
      points: [
        "API traffic: 30B requests/day is about 350k/s, peak ~1M/s",
        "About 3 rules per request, so ~3M counter checks/s at peak",
        "Redis throughput (~100k scripts/s per primary) sets the shard count, roughly 40 primaries",
        "Memory is tiny: ~10M live counters × ~200 bytes ≈ 2 GB",
        "100 gateway instances means per-instance counters would multiply the limit",
        "Cross-region round trips (~70 ms) rule out one global synchronous counter",
      ],
      model: [
        "API traffic: 30B requests/day / ~86,400 s ≈ 350,000 per second, peak around 1M per second.",
        "Counter operations: each request is checked against ~3 rules (per key, per key and endpoint, per IP). Per-key rules can share one Redis slot, so it's about 2 round trips per request: ~2M small Lua scripts per second at peak, ~3M counter updates.",
        "Redis sizing: a single-threaded Redis primary runs on the order of 100,000 short scripts per second. 2M / 100k = 20 primaries at full load; with 2x headroom, ~40 primaries plus a replica each. Throughput, not memory, sets the shard count.",
        "Memory: 1M active API keys × ~5 live counters, plus ~5M active IPs, is ~10M counters. A token bucket is a small hash (tokens, last refill time) at ~200 bytes with Redis overhead: ~2 GB in total. A sliding log would be very different: a key allowed 100 req/s over a 1-minute window stores up to 6,000 timestamps (~360 KB), and 100k busy keys is ~36 GB plus a sorted-set update per request. That rules out the log for high limits.",
        "Gateways: at ~10k requests/s per instance, peak needs ~100 gateway instances. If each one counted locally, a client spread across them could get up to 100x its limit. Counters must be shared.",
        "Latency: a Redis round trip inside one zone is ~0.3 ms, which fits the 1 ms budget. A cross-region round trip is ~70 ms, which doesn't. So counters live per region.",
        "Rules: a few thousand rules plus ~100k customer overrides is a few MB, small enough for every gateway to hold in memory.",
        "Conclusion: a sharded in-memory counter store close to the gateways, about one round trip per request, and per-region counting.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "There are three interfaces: the internal check the gateway calls, the admin API for rules, and what " +
        "the API client sees in responses. Define all three briefly. About 4 minutes.",
      points: [
        "Internal check: descriptors in, allowed/remaining/reset out",
        "Cost parameter so expensive calls can consume more than one unit",
        "429 Too Many Requests with Retry-After in seconds",
        "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset on every response",
        "Admin API for rules and per-customer overrides, with a shadow mode",
        "Distinguishes 429 (this client is over its limit) from 503 (we are overloaded)",
      ],
      model: [
        "Internal check (a library call inside the gateway, or gRPC if it's a separate service):",
        "- check({ descriptors: [{ api_key: \"k_123\" }, { api_key: \"k_123\", endpoint: \"POST /charges\" }, { ip: \"203.0.113.7\" }], cost: 1 })  ->  { allowed, rule_id, limit, remaining, reset_at, retry_after_ms }",
        "Cost defaults to 1; an expensive endpoint (a bulk export) can cost 10, so one limit covers both.",
        "Client-facing behaviour:",
        "- Allowed: the request passes through, and the response carries X-RateLimit-Limit: 100, X-RateLimit-Remaining: 37, X-RateLimit-Reset: <unix seconds>. (The IETF draft RateLimit and RateLimit-Policy headers carry the same information.)",
        "- Rejected: 429 Too Many Requests, Retry-After: 2, the same X-RateLimit headers, and a JSON body naming which limit was hit, so a developer can tell \"per-endpoint limit\" from \"account limit\".",
        "- When the platform itself is overloaded and shedding load, that's 503 with Retry-After, not 429: the client did nothing wrong.",
        "Admin API:",
        "- PUT /v1/rate-limit-rules/{rule_id}  { match, key_by, rate, burst, algorithm, mode: enforce|shadow }",
        "- PUT /v1/customers/{id}/limits  { rule_id, rate, burst }  for plan-based or negotiated overrides.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Two kinds of data with very different needs: rules (small, read constantly, changed rarely) and " +
        "counters (tiny, updated on every request, disposable). Pick a store for each. About 5 minutes.",
      points: [
        "Rules: match, key_by, rate, burst, algorithm, mode; stored in a small SQL database",
        "Rules cached in memory on every gateway and refreshed by push or polling",
        "Counter state per (rule, key): a few fields in Redis",
        "Every counter key has a TTL, so idle clients cost nothing",
        "Redis Cluster sharded by key, with hash tags to keep one client's counters in one slot",
        "Counters are not durable data: losing them briefly resets limits, which is acceptable",
      ],
      model: [
        "Rules: rule_id, match (path pattern, method), key_by (api_key, user_id, ip, or a combination), rate and period, burst, algorithm, mode (enforce or shadow), priority. Customer overrides: (customer_id, rule_id) -> rate, burst. This is a few MB that changes a few times a day, so a small Postgres database is the source of truth. Each gateway loads all rules into memory at startup and refreshes them every ~10 seconds (or gets a push), so a rule lookup is a hash map lookup.",
        "Counters: Redis Cluster. For a token bucket, key rl:{k_123}:charges -> hash { tokens: 37.5, ts: 1718000000123 }, with a TTL of about the time it takes to refill a full bucket. Once a client goes quiet, its keys expire and disappear.",
        "For a sliding window counter: two plain integers per (rule, key), one for the current window and one for the previous, rl:{k_123}:login:<window_start>, each with a TTL of two windows.",
        "The braces are a Redis Cluster hash tag: only k_123 is hashed, so all of one client's counters land in the same slot and one Lua script can check several of them atomically.",
        "Counters don't need durability. If a Redis shard fails over and loses the last second of increments, a few clients get a little extra quota for one window. So no persistence (or relaxed AOF), and asynchronous replicas are fine.",
        "Decisions (allowed or rejected, which rule) go to a log (Kafka) for dashboards and abuse analysis, never to the counter store.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw where the limiter sits in the request path, where counters and rules live, and walk one request " +
        "through an allowed and a rejected case. About 8 minutes.",
      points: [
        "Limiter runs as middleware in the API gateway, before any backend work",
        "One atomic round trip to Redis per request (or per key slot)",
        "Rules served from local memory, synced from a rules service",
        "Rejected requests return immediately and never reach the backends",
        "Decisions logged asynchronously for monitoring and shadow-mode analysis",
        "Mentions the alternative: a central rate-limit service called over gRPC",
      ],
      model: [
        "Request path: the client's request reaches the load balancer, then a gateway instance. The gateway authenticates it (so it knows the API key), finds the matching rules in its in-memory rule table, and runs one Lua script against the Redis shard that owns that key. The script refills and takes tokens for every matching rule and returns allowed or rejected with the remaining count. Allowed: forward to the backend and add the X-RateLimit headers to the response. Rejected: answer 429 straight away; the backend never sees it.",
        "Rules path: operators and the billing system edit rules through the rules service, which stores them in Postgres. Gateways poll it every few seconds (or subscribe to changes) and swap their in-memory table atomically.",
        "Logging: each gateway buffers decisions and ships them to Kafka in batches, so logging never adds latency. Dashboards show who is being limited, and shadow-mode rules show what they would have blocked before anyone enables them.",
        "Why middleware and not a separate service: the separate rate-limit service (Envoy's global rate limiting works this way) centralises the logic and lets non-gateway callers use it, but it adds a network hop on every request. Putting the logic in the gateway as a library that talks to Redis directly saves that hop. I'd start with the library and move to a service only if many different proxies need it.",
      ],
      diagram: {
        nodes: [
          { id: "client", label: "API clients", col: 0 },
          { id: "lb", label: "Load balancer", col: 1 },
          { id: "gw", label: "API gateway", col: 2, sub: "limiter middleware" },
          { id: "redis", label: "Counters", col: 3, sub: "Redis Cluster" },
          { id: "backend", label: "Backend APIs", col: 3 },
          { id: "rules", label: "Rules service", col: 3 },
          { id: "log", label: "Decision log", col: 3, sub: "Kafka" },
          { id: "rulesdb", label: "Rules DB", col: 4, sub: "Postgres" },
          { id: "dash", label: "Dashboards", col: 4, sub: "abuse, shadow mode" },
        ],
        edges: [
          { from: "client", to: "lb" },
          { from: "lb", to: "gw" },
          { from: "gw", to: "redis", label: "Lua check" },
          { from: "gw", to: "backend", label: "if allowed" },
          { from: "gw", to: "rules", label: "sync rules" },
          { from: "gw", to: "log", label: "decisions" },
          { from: "rules", to: "rulesdb" },
          { from: "log", to: "dash" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "Expect questions on the algorithm choice, on keeping counters correct when many gateways update them at " +
        "once, and on what happens when Redis is slow or down. Compare options and commit. About 15 minutes.",
      points: [
        "Compares fixed window, sliding log, sliding window counter, token bucket and leaky bucket",
        "Picks token bucket for API keys (bursts allowed) and says why",
        "Read-then-write races and the INCR + EXPIRE gap; fixes both with one Lua script",
        "Uses Redis server time or a single clock source, not each gateway's clock",
        "Local vs global counting: accuracy against latency, with local token leases as a middle ground",
        "Fail open with a conservative local fallback; fail closed only for abuse-sensitive limits",
        "Hot keys and multi-region limits",
      ],
      model: [
        "1. Algorithms.",
        "- Fixed window: one counter per key per clock minute, INCR and compare. One integer, trivially cheap, but a client can send the full limit at 12:00:59 and again at 12:01:00, which is twice the limit in two seconds.",
        "- Sliding window log: a sorted set of request timestamps; drop entries older than the window, count the rest. Exact, but memory grows with the limit (the 36 GB from the estimate) and every request costs several sorted-set operations.",
        "- Sliding window counter: keep the current and previous fixed-window counts and estimate count = current + previous × (fraction of the previous window still inside the sliding window). Two integers, no boundary burst, and Cloudflare measured it within a fraction of a percent of exact on real traffic.",
        "- Token bucket: capacity B tokens, refilled at rate r; each request takes cost tokens. Two numbers, and it enforces an average rate while allowing a burst of B, which is how real clients behave (a page load fires 20 calls at once). Refill is computed lazily: tokens = min(B, tokens + (now - ts) × r).",
        "- Leaky bucket: requests join a queue that drains at a fixed rate. It smooths output instead of rejecting bursts, so it suits outgoing traffic to a fragile dependency (sending webhooks, calling a partner's API), not admission control where the caller wants a fast yes or no.",
        "I'd use a token bucket for per-key API limits (Stripe and most cloud APIs use one) and a sliding window counter for long windows like \"1,000 per day\" or \"20 login attempts per minute per IP\". For long-running calls, add a separate concurrency limit (in-flight requests per key), because a rate limit doesn't stop 100 slow requests piling up.",
        "2. Atomicity in Redis. The naive version is GET the count, compare in the gateway, then SET. Two gateways read 99 at the same moment, both allow, and the limit is broken; with 100 gateways this happens constantly for busy keys. For fixed windows, INCR is atomic and returns the new value, so compare after incrementing. But INCR followed by a separate EXPIRE has a gap: if the gateway dies between them, the key never expires and that client is blocked forever. The fix for all of it is one Lua script per check: read the bucket, refill, compare, decrement, set the TTL, return the result. Redis runs a script atomically, and it's one round trip. Use the Redis server's TIME inside the script so gateway clock skew doesn't hand out tokens. In Redis Cluster a script can only touch keys in one slot, which is what the {api_key} hash tag guarantees.",
        "3. Local vs global counting. A global counter in Redis is accurate but costs a round trip on every request. Purely local counters (each gateway allows limit / number_of_gateways) cost nothing but are wrong whenever traffic isn't spread evenly, and they change every time the fleet autoscales. The middle ground for very high limits: each gateway leases a batch of tokens from Redis (say 10% of the bucket) and spends them locally, going back to Redis only when the lease runs out. That cuts Redis traffic by 10x or more for heavy keys, at the cost of overshooting by up to the unspent leases. For small limits (5 per minute) always go to Redis, because a lease would be a large share of the limit.",
        "4. Failure mode. If Redis is slow or down, the gateway gives up after a short timeout (~5 ms) and a circuit breaker stops it trying for a few seconds. For general API limits I'd fail open, but not to unlimited: fall back to a local in-memory token bucket per key sized at limit / number_of_gateways, which still stops a runaway client. Failing closed would turn a cache outage into a full API outage. For limits that protect against abuse or cost, such as login attempts, password resets or SMS sending, fail closed, because letting an attacker through is worse than a short error for real users.",
        "5. Hot keys and regions. One huge customer at 50k req/s makes its Redis shard hot; the local lease approach above takes most of that load off. Across regions, I'd keep counters per region and give each region a share of the global limit (say limit / 3, rebalanced every few seconds from observed traffic) rather than synchronously coordinating at ~70 ms per check. A customer can then briefly exceed the global limit by moving traffic between regions, which is acceptable at a few percent.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction:
        "Where does it break first, what does each failure look like to a customer, and how do you know the " +
        "limits are right? About 4 minutes.",
      points: [
        "Hot shard from one large customer, handled with local leases or a dedicated shard",
        "Redis outage: fail open to local buckets, alarm, no API outage",
        "Bad rule pushed: shadow mode first, staged rollout, fast rollback",
        "Retry storms from rejected clients; Retry-After with jitter in SDKs",
        "Metrics: check latency p99, Redis errors and timeouts, fail-open rate, 429 rate per rule and per customer",
      ],
      model: [
        "Bottlenecks: the first thing to break is a single very large customer making one Redis shard hot; local token leases fix most of it, and the biggest customers can get their own shard. Next is Redis CPU as traffic grows, which is fixed by adding shards, because the counter keyspace splits cleanly by key.",
        "Failure modes:",
        "- A Redis shard fails over: a second or two of timeouts, gateways fall back to local buckets, and some clients get a little extra quota. No customer sees an error.",
        "- All of Redis is unreachable: the same fallback for every key, plus a page to on-call. Abuse-sensitive limits fail closed and those endpoints return 503.",
        "- A bad rule (a typo that limits everyone to 1 request per minute) is the most dangerous failure, because the limiter works perfectly and blocks real traffic. Every new rule runs in shadow mode first, rules roll out to a few gateways before all of them, and a rollback is one click.",
        "- Rejected clients retrying in a tight loop add load. Retry-After plus jittered backoff in our SDKs keeps them polite; clients that ignore it get stricter IP-level limits.",
        "Monitoring: limiter check latency p50/p99, Redis timeouts and errors, the fail-open rate (it should be zero), 429s per rule and per customer (a sudden jump means a bad rule or a customer's broken integration), shadow-mode would-block counts, and Redis CPU per shard to spot hot keys.",
        "If I had more time: per-customer usage dashboards so customers can see their own limits, and adaptive limits that tighten automatically when a backend is overloaded.",
      ],
    },
  ],
};

const keyValueStore: DesignInterview = {
  id: "keyValueStore",
  title: "Design a Distributed Key-Value Store",
  prompt:
    "\"Design a distributed key-value store in the style of Amazon's Dynamo or Apache Cassandra. Clients put and " +
    "get values by key; the data is far too big for one machine, and the store must stay available when servers " +
    "fail.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Pin down the operations and, above all, the consistency and availability promises. \"Must a write be " +
        "accepted while some replicas are unreachable?\" decides most of the design, so ask it early. About 5 minutes.",
      points: [
        "Core operations: get, put, delete by key; values are opaque bytes with a size limit",
        "Asks about value size, key count, read/write ratio, and whether range scans or transactions are needed",
        "Chooses availability over strong consistency for writes (\"always writable\") and says so",
        "Tunable consistency per request instead of one fixed level",
        "Latency target (p99 under ~10 ms in one region) and durability (an acknowledged write survives a node loss)",
        "Incremental scaling: add or remove nodes without downtime or a full reshuffle",
        "Scopes out secondary indexes, multi-key transactions and range queries",
      ],
      model: [
        "Questions I'd ask: How much data and how many keys? Typical and maximum value size? Read/write ratio? Do we need range scans, secondary indexes or transactions? When replicas disagree or are unreachable, is it worse to reject a write or to return stale data? One region or several?",
        "Assume: ~50 billion keys, values around 1 KB (up to 1 MB), roughly 2 reads per write, single-key operations only, one region with three availability zones (multi-region at the end). The workload is like Dynamo's shopping cart: rejecting a write loses the customer, so writes must be accepted even during failures.",
        "Functional:",
        "- put(key, value), get(key), delete(key), with an optional TTL.",
        "- Per-request consistency level: ONE, QUORUM or ALL.",
        "- Concurrent conflicting writes are detected and resolved, not silently corrupted.",
        "Non-functional:",
        "- p99 under ~10 ms for reads and writes inside a region.",
        "- Always writable: a write succeeds as long as some nodes are reachable.",
        "- Durable: an acknowledged write survives the loss of any single node (and of any one zone).",
        "- Scales horizontally: adding a node moves only a small slice of data, with no downtime.",
        "- No single point of failure and no special master node.",
        "Out of scope: secondary indexes, range queries, multi-key transactions. I'll mention compare-and-set briefly.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Size total storage with replication, then work out whether disk, throughput or memory decides the node " +
        "count. Also estimate how long it takes to rebuild a failed node. About 4 minutes.",
      points: [
        "Data: 50B keys × ~1 KB ≈ 50 TB, × 3 replicas ≈ 150 TB",
        "Nodes: ~2 TB usable per 4 TB NVMe (compaction headroom) gives ~75, plan ~100",
        "Throughput: 400k reads/s and 200k writes/s at peak is under 10k replica ops/s per node",
        "Conclusion: storage, not throughput, sets the node count",
        "Bloom filters: ~1.5B keys per node × 10 bits ≈ 2 GB of RAM per node",
        "Node rebuild time: minutes to an hour with virtual nodes, hours without",
      ],
      model: [
        "Storage: 50B keys × (~1 KB value + key and metadata) ≈ 50 TB. With replication factor 3: ~150 TB.",
        "Nodes: a node with a 4 TB NVMe drive should hold about 2 TB, because compaction needs free space to write new files before deleting old ones, and we need room to grow. 150 TB / 2 TB ≈ 75 nodes; plan ~100 for growth and so losing a zone doesn't fill the rest.",
        "Traffic: say 200k reads/s and 100k writes/s on average, peak 400k reads and 200k writes. Each write goes to 3 replicas: 600k replica writes/s, about 6k per node. Each quorum read touches 2 replicas: 800k replica reads/s, about 8k per node. An LSM-based node handles tens of thousands of each, so throughput isn't the constraint.",
        "Bandwidth: 200k writes × 1 KB = 200 MB/s into the cluster, ×3 for replication = 600 MB/s, ~6 MB/s per node. Compaction rewrites data several times (leveled compaction is ~10x), so ~60 MB/s of disk writes per node. Comfortable on NVMe.",
        "Memory: each node holds 150 TB / 100 / 1 KB ≈ 1.5B keys. A bloom filter at 10 bits per key (about 1% false positives) is ~1.9 GB per node, plus memtables and page cache. 64-128 GB of RAM per node.",
        "Rebuild: a dead node's 1.5 TB has to be copied to a replacement. If only its two ring neighbours can stream it at ~100 MB/s each, that's about 2 hours, during which those keys have one fewer replica. With virtual nodes the data comes from dozens of peers in parallel and the new node's disk or network (~500 MB/s) becomes the limit: under an hour.",
        "Conclusion: ~100 nodes sized by disk, with virtual nodes so recovery is spread across the cluster, and enough RAM to keep bloom filters in memory so most reads touch disk once.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "Define the client operations, including the consistency level and the version context that makes " +
        "conflict handling possible. About 4 minutes.",
      points: [
        "get(key, consistency) returns the value(s) plus an opaque version context",
        "put(key, value, context, consistency, ttl?) passes back the context it read",
        "get can return several sibling values when writes conflicted",
        "delete writes a tombstone rather than removing data immediately",
        "Consistency levels ONE, QUORUM, ALL per request",
        "Clear error when the requested consistency level can't be met",
      ],
      model: [
        "- get(key, consistency = QUORUM)  ->  { values: [bytes...], context }. Usually one value; several \"siblings\" if concurrent writes conflicted and the store keeps both.",
        "- put(key, value, context?, consistency = QUORUM, ttl_seconds?)  ->  ok. The context is the opaque version from a previous get; it tells the store which version this write replaces.",
        "- delete(key, context?, consistency = QUORUM)  ->  ok. Internally a write of a tombstone.",
        "Over the wire this is gRPC or a simple binary protocol, with an HTTP form for debugging: GET /v1/kv/{key}, PUT /v1/kv/{key} with the context in a header, DELETE /v1/kv/{key}.",
        "Errors: \"unavailable\" when fewer than the required replicas responded in time (the caller may retry at a lower level), and \"timeout\" when the write may or may not have been applied, which is why puts must be safe to retry.",
        "The client library is token-aware: it knows the ring and sends each request straight to a node that holds the key, saving a hop.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Describe what a stored record looks like, how keys map to nodes, and what each node keeps on disk and " +
        "in memory. About 5 minutes.",
      points: [
        "Record: key, value bytes, version (timestamp or vector clock), tombstone flag, expiry",
        "Key -> token by hashing (Murmur3/MD5) onto a ring",
        "Each node owns many virtual-node tokens; N replicas on the next distinct nodes in different zones",
        "Per node: write-ahead log, memtable, immutable SSTables with indexes and bloom filters",
        "Cluster membership and ring ownership spread by gossip, no central master",
        "Hints and Merkle trees as supporting metadata",
      ],
      model: [
        "A record is key (up to a few hundred bytes), value (opaque bytes, up to 1 MB), version, a tombstone flag for deletes, and an optional expiry time. The store never interprets the value.",
        "Partitioning: token = Murmur3(key), a 64-bit position on a ring. Each physical node takes ~256 random tokens (virtual nodes) and owns the ranges ending at them. The preference list for a key is the next N = 3 distinct physical nodes clockwise, skipping nodes in a zone already used, so the three copies sit in three zones.",
        "On each node, data is stored in an LSM tree: an append-only write-ahead log for durability, an in-memory sorted memtable, and immutable sorted files (SSTables) on disk, each with a sparse index and a bloom filter. RocksDB or a purpose-built engine like Cassandra's.",
        "Membership: every node keeps a table of (node id, tokens, zone, status, heartbeat generation and version), spread by gossip. There is no master: any node can coordinate any request because every node knows the ring. A few seed nodes help new nodes join.",
        "Hints: when a replica is down, another node keeps (target node, key, value, version) and replays it later. Merkle trees are built per token range during repair to find differences between replicas cheaply.",
        "Why not a sharded relational database: we need no joins or transactions, we want to add capacity one node at a time with no resharding project, and we want writes accepted in any zone without a single primary per shard.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw a read and a write going from the client to the replicas and back, including what happens when one " +
        "replica is down. Name the background processes too. About 8 minutes.",
      points: [
        "Any node can coordinate; the client library routes to a replica of the key",
        "Write: send to all N replicas, succeed after W acknowledgements",
        "Read: query replicas, wait for R, return the newest version or the siblings",
        "Down replica: write goes to the next healthy node with a hint (sloppy quorum)",
        "Read repair fixes stale replicas seen during reads",
        "Background: gossip, anti-entropy repair, compaction",
      ],
      model: [
        "Write: the client library hashes the key and sends the put to a node in its preference list, which acts as coordinator. The coordinator stamps the version, sends the write to all N = 3 replicas in parallel, and returns success once W = 2 have acknowledged. Each replica appends to its write-ahead log, inserts into its memtable and acks; it doesn't wait for disk compaction or flushing.",
        "Read: the coordinator asks the replicas (one for the full value, the others for a digest), waits for R = 2, and compares versions. If they agree it returns the value. If one is older, it returns the newest and writes it back to the stale replica in the background (read repair). If the versions are concurrent, it returns both as siblings.",
        "Failure: if replica C is down, the coordinator writes C's copy to the next healthy node on the ring with a hint saying \"this belongs to C\". The write still counts toward W (a sloppy quorum), so the put succeeds. When gossip reports C is back, the hint holder replays it.",
        "Background work on every node: gossip with a random peer every second, periodic anti-entropy repair against the other replicas of each range using Merkle trees, and compaction of SSTables.",
      ],
      diagram: {
        nodes: [
          { id: "client", label: "Client", col: 0, sub: "app" },
          { id: "router", label: "Client library", col: 1, sub: "token-aware" },
          { id: "coord", label: "Coordinator", col: 2, sub: "any node" },
          { id: "ring", label: "Ring + membership", col: 2, sub: "gossip state" },
          { id: "r1", label: "Replica A", col: 3, sub: "zone 1" },
          { id: "r2", label: "Replica B", col: 3, sub: "zone 2" },
          { id: "r3", label: "Replica C", col: 3, sub: "zone 3 (down)" },
          { id: "hint", label: "Hint holder", col: 3, sub: "next healthy node" },
          { id: "lsm", label: "Storage engine", col: 4, sub: "LSM: WAL, SSTables" },
        ],
        edges: [
          { from: "client", to: "router" },
          { from: "router", to: "coord", label: "get / put" },
          { from: "coord", to: "ring", label: "who owns key" },
          { from: "coord", to: "r1", label: "W=2 of N=3" },
          { from: "coord", to: "r2" },
          { from: "coord", to: "r3" },
          { from: "coord", to: "hint", label: "hinted write" },
          { from: "r1", to: "r2", label: "gossip" },
          { from: "hint", to: "r3", label: "replay" },
          { from: "r1", to: "lsm" },
          { from: "r2", to: "lsm" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "This problem is a tour of distributed-systems techniques, and the interviewer will pick a few: " +
        "partitioning, quorums and consistency, conflict resolution, repairing replicas, failure detection, or " +
        "the storage engine. For each, explain the mechanism and what it costs. About 15 minutes.",
      points: [
        "Consistent hashing with virtual nodes: small data movement on membership change, even load, fast rebuilds",
        "Quorums: R + W > N gives overlapping reads and writes; N=3, R=W=2 tolerates one node down",
        "CAP and PACELC: this design is available under partition and trades consistency for latency otherwise",
        "Conflicts: last-write-wins (simple, loses writes, clock skew) vs vector clocks with siblings",
        "Repair: hinted handoff for short outages, read repair for hot keys, Merkle-tree anti-entropy for the rest",
        "Gossip membership and phi accrual failure detection; transient vs permanent failures",
        "LSM tree: WAL, memtable, SSTables, bloom filters, compaction strategies and tombstones",
      ],
      model: [
        "1. Partitioning. With hash(key) mod number_of_nodes, adding one node moves almost every key. Consistent hashing places nodes and keys on the same ring, so adding a node only takes over the ranges next to its tokens: about 1/N of the data moves. With one token per node the ranges are uneven and a failed node's load lands entirely on its neighbour, so each node takes many virtual tokens (Cassandra 4 defaults to 16, older versions used 256): load evens out, bigger machines can take more tokens, and a rebuild streams from many peers at once (the under-an-hour figure from the estimate).",
        "2. Quorums. With N replicas, a write waits for W acks and a read waits for R replies. If R + W > N, every read set overlaps every write set, so a read reaches at least one replica with the latest acknowledged write (as long as the quorum is strict, not sloppy). That isn't linearizability: concurrent or partly failed writes and last-write-wins on skewed clocks can still return an older value, so anything that needs it, like a compare-and-set, uses lightweight transactions (Paxos), as Cassandra does. N = 3, R = W = 2 is the usual default: one node can be down for both reads and writes. W = 1, R = 1 is fastest but only eventually consistent; W = 3 makes every write fail when any replica is down. Because the level is per request, a cart read can use ONE and a balance check QUORUM.",
        "3. Consistency trade-offs. CAP: during a network partition we either reject requests on the minority side (consistent) or accept them on both sides and reconcile later (available). The requirement was \"always writable\", so this store chooses availability, with sloppy quorums letting writes land on whatever nodes are reachable. PACELC adds that even with no partition there's a trade-off between latency and consistency: waiting for 2 replicas instead of 1 costs the slower replica's latency on every request. Dynamo and Cassandra are \"PA/EL\". Even strict quorums aren't linearizable under concurrent writes and failures; for a true compare-and-set, Cassandra runs Paxos for that one operation (lightweight transactions), at about four round trips.",
        "4. Conflict resolution. Last-write-wins: each write carries a timestamp, the highest wins. Simple, no client involvement, and it's Cassandra's default, but two concurrent writes silently lose one, and a node with a fast clock can make an older write win. Vector clocks: each version carries a list of (node, counter) pairs. If one clock descends from the other, the newer simply replaces it; if neither does, the writes were concurrent and the store keeps both as siblings, returns both on get, and the client merges them (union of two carts) and writes back with the merged context. That never loses a write, but it pushes merge logic to the application and clocks grow, so they're truncated after ~10 entries. I'd default to last-write-wins with synchronised clocks (NTP, plus monotonic per-node timestamps) and offer vector clocks, or CRDT types such as counters and sets, for data where losing an update is unacceptable.",
        "5. Repairing replicas. Three layers. Hinted handoff covers short outages: hints are kept for a few hours and replayed when the node returns. Read repair fixes divergence on keys that are actually read. Anti-entropy covers everything else: for each token range, replicas build a Merkle tree (leaves hash a small sub-range of keys, parents hash their children) and compare roots. Equal roots mean the range is identical; otherwise they walk down only the differing branches and stream just those keys, so comparing 1.5 TB costs a few MB of hashes. Repair must run on every range more often than tombstones are purged (Cassandra's default is 10 days), or a replica that missed a delete will bring the deleted data back.",
        "6. Membership and failure detection. Every second each node exchanges its membership table with one random peer, merging by highest heartbeat version; news reaches all 100 nodes in about log2(100) ≈ 7 rounds, a few seconds. Instead of a fixed timeout, a phi accrual detector looks at the history of heartbeat arrival times from each peer and computes how suspicious the current silence is, so a slow network raises the threshold automatically. A node marked down is only routed around and gets hints; it's not removed from the ring, because most failures are restarts. Permanent removal or replacement is an explicit operator action, which avoids reshuffling data every time a node blips.",
        "7. Storage engine. A write appends to the write-ahead log (fsync batched every few milliseconds), then goes into the memtable, a sorted in-memory structure. At ~128 MB the memtable is flushed as an SSTable: an immutable sorted file with a block index and a bloom filter. A read checks the memtable, then SSTables from newest to oldest, using bloom filters to skip files that can't contain the key, so most reads touch one file. Compaction merges SSTables, keeping the newest version of each key and dropping expired tombstones. Size-tiered compaction (merge files of similar size) is cheap on writes but can need 2x disk space and leaves more files per read; leveled compaction keeps reads to about one file per level at ~10x write amplification. With 2 reads per write and NVMe, I'd use leveled. Compared with a B-tree, an LSM turns random writes into sequential ones, which is why it suits write-heavy stores.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction:
        "Bottlenecks, what each kind of failure does to reads and writes, scaling out and across regions, and " +
        "what you'd monitor. About 4 minutes.",
      points: [
        "Hot keys only spread across N replicas; cache or split them at the application layer",
        "Compaction falling behind raises read latency and fills disks",
        "Node and zone loss: quorum still met because replicas sit in different zones",
        "Multi-region: replicas per region, LOCAL_QUORUM, asynchronous cross-region replication",
        "Tombstone buildup and repair schedules as operational risks",
        "Metrics: p99 per operation and level, pending compactions, SSTables per read, hints pending, repair age, disk usage",
      ],
      model: [
        "Bottlenecks: a single hot key lives on only 3 nodes, so adding nodes doesn't help it; cache it in front of the store or split it into several keys at the application layer. Compaction is the other usual limit: if writes outpace it, SSTables pile up, reads touch more files, and disks fill. Throttle writes or add nodes before that happens.",
        "Failure modes:",
        "- One node down: R = W = 2 still succeed, hints build up, and the node catches up from hints and repair when it returns.",
        "- A whole zone down: every key still has 2 of its 3 replicas, so quorum reads and writes keep working. This is why placement must be zone-aware.",
        "- A network partition: both sides keep accepting writes at the levels they can meet; conflicts are resolved by last-write-wins or siblings afterwards.",
        "- Lots of deletes: tombstones make reads scan dead entries until compaction removes them, a common cause of mysterious latency.",
        "Scaling: add a node, it takes 256 tokens, and data streams to it from many peers while it serves nothing until it's done. Multi-region: keep N replicas per region, use LOCAL_QUORUM so requests never wait on another region, and replicate between regions asynchronously, accepting cross-region conflicts.",
        "Monitoring: read and write p99 per consistency level, unavailable and timeout errors, pending compactions, SSTables touched per read, tombstones scanned per read, hints pending, time since each range was last repaired, disk usage per node, and nodes marked down by the failure detector.",
      ],
    },
  ],
};

const webCrawler: DesignInterview = {
  id: "webCrawler",
  title: "Design a Web Crawler",
  prompt:
    "\"Design a web crawler for a search engine. Starting from a set of seed URLs, it should fetch about a billion " +
    "pages a month, extract their links, keep the pages it has already crawled reasonably fresh, and hand the " +
    "content to the indexing team.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Find out what the crawl is for, because that decides what \"done\" and \"fresh\" mean. Ask about content " +
        "types, JavaScript rendering, freshness and politeness before you design anything. About 5 minutes.",
      points: [
        "Purpose: feeding a search index, so HTML text and links matter, not images or video",
        "Scale: ~1B fetches/month, a mix of new discovery and recrawls of known pages",
        "Politeness is a hard requirement: obey robots.txt, never overload a site",
        "Freshness target: important pages recrawled within hours to a day, the long tail within weeks",
        "Robustness: malformed HTML, slow or hostile servers, crawler traps",
        "Avoid wasting the budget on duplicate URLs and duplicate content",
        "Scopes out JavaScript rendering, ranking and the index itself",
      ],
      model: [
        "Questions I'd ask: What is the crawl for (search index, archive, price monitoring)? Which content types: HTML only, or PDFs and images too? Do we have to execute JavaScript? Is the billion pages a month new pages, or including recrawls? How fresh must popular pages be? Do we store the raw pages, and for how long? Any sites or countries we must not crawl?",
        "Assume: a general web search index, HTML (PDFs later), no JavaScript rendering for now, 1B fetches a month including recrawls, raw pages kept for the indexer, and politeness treated as non-negotiable because a crawler that knocks sites over gets blocked and generates complaints.",
        "Functional:",
        "- Start from seed URLs, fetch pages, extract links, and add new URLs to the crawl.",
        "- Revisit known pages on a schedule that depends on how often they change and how important they are.",
        "- Store each fetched page and publish it (with metadata) to the indexing pipeline.",
        "Non-functional:",
        "- Polite: obey robots.txt, at most about one request per host every few seconds by default, back off when a site slows down.",
        "- Prioritised: the frontier will always hold far more URLs than we can fetch, so the important ones go first.",
        "- Robust: survive malformed HTML, huge pages, slow servers and pages that generate infinite URLs.",
        "- Horizontally scalable and restartable: losing a machine loses no crawl state.",
        "Out of scope: JavaScript rendering (I'll mention its cost at the end), the indexer, ranking and search serving.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Work out fetches per second, bandwidth, storage, how many links you have to deduplicate, and how many " +
        "connections are open at once. Say which of these actually limits the design. About 4 minutes.",
      points: [
        "Fetches: 1B/month is ~385/s; design for ~1,000/s to catch up after outages",
        "Bandwidth: ~100 KB per page is ~40 MB/s average, about 1 Gbit/s at 1,000/s",
        "Storage: ~100 TB/month raw, ~20 TB compressed, in batched files on object storage",
        "Links: ~50 per page is ~20k URL dedup checks/s, the hottest lookup in the system",
        "Seen-URL set of ~10B URLs: a Bloom filter at 1% false positives is ~12 GB",
        "Concurrency: ~1 s per fetch means ~400-1,000 requests in flight, so async I/O and a small fleet",
        "Politeness means throughput comes from many hosts at once, not from any single host",
      ],
      model: [
        "Fetch rate: 1B pages / 30 days / 86,400 s ≈ 385 pages per second. A crawler sets its own pace, so there's no traffic peak to survive, but I'd provision for ~1,000/s so we can catch up after an outage.",
        "Bandwidth: assume ~100 KB of HTML per page on average (the median is smaller; the tail of huge pages pulls the mean up). 385 × 100 KB ≈ 40 MB/s ≈ 300 Mbit/s, about 1 Gbit/s at 1,000/s. Accepting gzip roughly quarters what crosses the wire.",
        "Storage: 1B × 100 KB = 100 TB/month raw. HTML compresses ~5x, so ~20 TB/month, and keeping a year of versions is ~250 TB. That belongs in object storage, written as large batched files (WARC) rather than a billion tiny objects.",
        "Links: ~50 outlinks per page means 50B extracted links a month, about 20,000 per second, each needing \"have we seen this URL?\". That is the hottest lookup in the system. After a few months we'll know ~10B distinct URLs, far more than we can fetch in a month, so the frontier must be prioritised. A Bloom filter over 10B URLs at a 1% false positive rate needs ~9.6 bits each ≈ 12 GB, which splits easily across the crawler nodes' memory.",
        "URL metadata: 10B URLs × ~300 bytes (URL, timestamps, hashes, change history) ≈ 3 TB, a comfortable size for a wide-column store.",
        "Concurrency: by Little's law, ~400 fetches/s × ~1 s average fetch time (slow servers and timeouts included) ≈ 400 requests in flight, ~1,000+ at full speed. One machine with async I/O can hold thousands of connections. Parsing at ~20 ms of CPU per page is ~20 cores at 1,000/s. So a few dozen machines are plenty.",
        "Politeness: at one request per host every ~2 s, sustaining 385/s needs at least ~800 hosts being fetched at any moment, and in practice tens of thousands because many are slow or ask for longer delays. Even the biggest site gets at most ~2.6M fetches a month at 1/s.",
        "Conclusion: raw scale is modest. The design is driven by politeness (breadth across hosts), the 20k/s URL dedup path, and choosing which of the 10B known URLs deserve the 1B fetches.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "A crawler has no end users, so the interfaces are internal: how URLs get in, how operators control it, " +
        "and what it hands to the indexer. Also say how it presents itself to the websites it visits. About 4 minutes.",
      points: [
        "An endpoint to inject seed URLs with a priority",
        "Per-host policy overrides: rate cap, block, crawl budget",
        "A URL status lookup for debugging",
        "Output as an event stream (Kafka) with URL, status, content hash and a pointer to the stored page",
        "Identifies itself: a clear User-Agent with a contact page, conditional GETs with ETag / If-Modified-Since",
      ],
      model: [
        "- POST /v1/seeds  { urls[], priority }  ->  202. Used for the initial seeds, sitemaps and URLs other teams want crawled.",
        "- PUT /v1/hosts/{host}/policy  { max_qps?, crawl_budget?, blocked? }  ->  200. Operators use it when a site owner complains, or to give an important site more budget.",
        "- GET /v1/urls/{url_hash}  ->  { url, status, last_fetched, next_fetch_at, content_hash, last_error }. For debugging \"why isn't this page in the index?\".",
        "- Output: a Kafka topic page-fetched { url, final_url, http_status, fetched_at, content_hash, simhash, blob_ref, is_duplicate_of? }. The indexer consumes it at its own pace and fetches the body from object storage by blob_ref; we never push page bodies through the queue.",
        "Towards websites, the \"API\" is our behaviour: a User-Agent like ExampleBot/1.0 (+https://example.com/bot) so owners can identify us and opt out, robots.txt honoured for that agent name, conditional GETs (If-None-Match / If-Modified-Since) so an unchanged page costs a 304 instead of a full download, and Accept-Encoding: gzip.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Describe what the crawler remembers about URLs, hosts and content, and where the frontier itself lives. " +
        "Pick stores that match the access patterns. About 5 minutes.",
      points: [
        "URL table: normalised URL, host, last fetch, next fetch, content hash, change history, priority",
        "Host table: robots.txt cache, crawl delay, resolved IP and DNS expiry, error counts, budget",
        "Raw pages in object storage as batched WARC files, referenced by blob_ref",
        "Content fingerprints: exact checksum and 64-bit SimHash for duplicate detection",
        "Frontier as disk-backed queues on each crawler node, checkpointed, not a central database",
        "Keys chosen so all of a host's data sits on the node that crawls that host",
      ],
      model: [
        "URLs: url_hash (64-bit fingerprint of the normalised URL), url, host, discovered_at, last_fetched_at, last_changed_at, next_fetch_at, http_status, content_hash, simhash, priority, change_count / fetch_count. About 10B rows, ~3 TB, point reads and writes by key plus scans by next_fetch_at. A wide-column store (Bigtable, HBase or Cassandra) fits. Keying rows by reversed host plus path (com.example.www/news/1) keeps one host's URLs together, which is what both politeness and recrawl scans want.",
        "Hosts: host, robots_txt body and fetched_at (refetched after ~24 h), crawl_delay, ip and dns_expires_at, recent latency and error rates, current delay between requests, crawl_budget, quality score. Millions of rows, small, cached in memory on the node that owns the host.",
        "Content: raw responses go to object storage (S3, GCS or HDFS) in WARC files of ~1 GB, each holding thousands of pages; blob_ref is (file, offset, length). A content_hash -> canonical url_hash table supports exact dedup; a SimHash index supports near-duplicate lookups (deep dive).",
        "Seen URLs: a Bloom filter per crawler node over the URLs that node owns, rebuilt from the URL table on restart.",
        "Frontier: not a database table. Each node keeps its queues on local disk with small in-memory buffers at the head and tail (the Mercator design), checkpointed regularly so another node can take over. A central SQL queue doing 1,000 dequeues and 20,000 enqueues a second with per-host timing rules would be the bottleneck and the single point of failure.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw the crawl loop: frontier, fetch, store, parse, deduplicate, and back to the frontier, plus where " +
        "recrawls come from. Walk one URL all the way round. About 8 minutes.",
      points: [
        "A loop: frontier -> fetcher -> store -> parser -> URL filter -> frontier",
        "Fetchers check robots.txt and resolve DNS through local caches before every fetch",
        "Raw pages written to object storage; only metadata and references flow onward",
        "Parser extracts links; URLs are normalised and checked against the seen set before enqueueing",
        "Content dedup before handing pages to the indexer",
        "A recrawl scheduler feeds due URLs from the URL store back into the frontier",
        "The whole pipeline is partitioned by host hash across crawler nodes",
      ],
      model: [
        "One URL's trip: the frontier releases https://example.com/a only when example.com is allowed another request. A fetcher checks the cached robots.txt rules for the path, resolves the host through the local DNS cache, and issues an HTTP GET with a timeout (~30 s) and a size cap (~10 MB). It writes the raw response to the content store and records the outcome (status, time, hash) in the URL store.",
        "The parser extracts text and links. Each link is resolved against the page URL, normalised, filtered (wrong scheme, blocked extension, too long, trap patterns), and checked against the Bloom filter. New URLs are written to the URL store and enqueued in the frontier of the node that owns their host. Meanwhile content dedup compares the page's checksum and SimHash with what we already hold, and the page, marked unique or a duplicate of a canonical URL, is published to the indexer's Kafka topic.",
        "Recrawls: the scheduler scans the URL store for rows whose next_fetch_at has passed and feeds them into the same frontier, competing on priority with newly discovered URLs.",
        "Every component except the stores and the indexer topic runs on each crawler node for the hosts that node owns, so politeness, robots and DNS caches, and the seen-URL filter are all local. Links to hosts owned by another node are batched and sent to that node.",
      ],
      diagram: {
        nodes: [
          { id: "urlstore", label: "URL store", col: 0, sub: "Bigtable / HBase" },
          { id: "scheduler", label: "Recrawl scheduler", col: 0, sub: "next_fetch_at" },
          { id: "seeds", label: "Seed URLs", col: 0, sub: "admin API" },
          { id: "filter", label: "URL filter", col: 1, sub: "normalise + Bloom" },
          { id: "frontier", label: "URL frontier", col: 1, sub: "priority + host queues" },
          { id: "parser", label: "Parser", col: 2, sub: "links + text" },
          { id: "fetcher", label: "Fetchers", col: 2, sub: "async HTTP" },
          { id: "dedup", label: "Content dedup", col: 3, sub: "checksum + SimHash" },
          { id: "blobs", label: "Content store", col: 3, sub: "WARC files on S3" },
          { id: "web", label: "Web servers", col: 3, sub: "millions of hosts" },
          { id: "dns", label: "DNS cache", col: 3, sub: "local resolver" },
          { id: "robots", label: "Robots cache", col: 3, sub: "robots.txt, ~24 h" },
          { id: "indexer", label: "Indexer", col: 4, sub: "via Kafka" },
        ],
        edges: [
          { from: "scheduler", to: "urlstore", label: "scan" },
          { from: "scheduler", to: "frontier", label: "due URLs" },
          { from: "seeds", to: "frontier", label: "inject" },
          { from: "filter", to: "urlstore", label: "new URLs" },
          { from: "filter", to: "frontier", label: "enqueue" },
          { from: "frontier", to: "fetcher", label: "next URL" },
          { from: "fetcher", to: "parser", label: "page" },
          { from: "fetcher", to: "blobs", label: "raw page" },
          { from: "fetcher", to: "web", label: "GET" },
          { from: "fetcher", to: "dns", label: "resolve" },
          { from: "fetcher", to: "robots", label: "allowed?" },
          { from: "parser", to: "filter", label: "links" },
          { from: "parser", to: "dedup", label: "fingerprint" },
          { from: "dedup", to: "indexer", label: "pages" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "Expect questions on the frontier and politeness first, then deduplication, recrawl scheduling and " +
        "traps. Explain the mechanism and what it costs. About 15 minutes.",
      points: [
        "Frontier as front queues by priority and back queues by host, with a heap of next-allowed times (Mercator)",
        "robots.txt cached per host, crawl delay and adaptive backoff; DNS cached and resolved asynchronously",
        "URL normalisation plus a Bloom filter for seen URLs, with the false-positive trade-off stated",
        "Exact duplicates by checksum, near-duplicates by SimHash and Hamming distance",
        "Recrawl interval adapted to observed change rate and importance; conditional GETs make checks cheap",
        "Trap defences: URL length and depth limits, repeated segments, per-host budgets",
        "Work partitioned by host hash with consistent hashing, so politeness needs no coordination",
      ],
      model: [
        "1. The URL frontier. A single FIFO queue fails twice: it ignores importance, and since pages link mostly within their own site, the next hundred URLs are often from one host, so we'd either hammer it or sit idle. Mercator's frontier splits the two concerns:",
        "- Front queues handle priority. A prioritiser scores each URL (host quality or PageRank-like importance, link depth, whether it's a recrawl of a page that changes often) and puts it into one of, say, 10 priority queues.",
        "- Back queues handle politeness. Each back queue holds URLs from exactly one host, with a table host -> queue, and there are about 3x as many back queues as fetcher threads so there's always a host ready. A min-heap holds each back queue's earliest allowed fetch time.",
        "- A fetcher pops the heap, waits until that time if needed, takes the next URL from that host's queue, fetches it, and pushes the queue back with time = now + delay. When a back queue empties, it is refilled from the front queues, choosing high-priority queues more often but not exclusively so low-priority URLs still move.",
        "Queues live on disk with in-memory heads, because the frontier holds billions of URLs.",
        "2. Politeness: robots.txt, crawl delay, DNS. Before the first fetch from a host we fetch /robots.txt and cache the parsed rules for ~24 h. A 4xx means no restrictions; a 5xx or timeout means treat the site as disallowed for now and retry later (the rule in RFC 9309), because guessing wrong annoys the site owner. Crawl-delay is non-standard but we honour it, capped at something like 30 s. The default delay adapts: a multiple of the last response time (Mercator used 10x), increased on 429 or 503 and when latency rises, relaxed slowly when the site is healthy. We also limit per IP address, since one shared-hosting server may serve thousands of hostnames. DNS deserves its own mention: system resolver calls block, and 400+ lookups/s at 10-200 ms each would stall the fetchers, so each node runs a local caching resolver, resolves asynchronously, and prefetches DNS when a host's back queue is created. With partitioning by host, the cache hit rate is high.",
        "3. Deduplication.",
        "- URLs: normalise before checking: lowercase scheme and host, drop default ports and #fragments, resolve ./ and ../, decode needlessly percent-encoded characters, strip known tracking and session parameters (utm_*, sessionid), and honour rel=canonical. Then hash and test the Bloom filter. A false positive means we wrongly skip a new URL about 1% of the time; for a search crawl that's acceptable (0.1% costs ~18 GB instead of 12 GB). Checking the URL store for every one of 20,000 links a second is the alternative, at far more cost.",
        "- Content: roughly a quarter to a third of the web is duplicate or near-duplicate (mirrors, print versions, the same article with different ads). An exact checksum of the normalised body catches mirrors. For near-duplicates, compute a 64-bit SimHash from the page's weighted shingles: similar documents get fingerprints differing in a few bits, and Google's crawler treated a Hamming distance of 3 or less as a near-duplicate. To find matches quickly, split the 64 bits into 4 blocks of 16: two fingerprints within distance 3 must agree exactly on at least one block, so keep 4 tables keyed by each block and compare only the candidates. Duplicates are recorded against their canonical URL and not indexed separately, and their links aren't re-expanded.",
        "4. Recrawl scheduling. Each URL gets its own interval. If a refetch shows the page changed, shorten the interval (say halve it, down to an hour for news homepages); if not, lengthen it (x1.5, up to a few months). Multiply by importance so popular pages are checked more often than the long tail. Sitemaps' lastmod and RSS feeds are cheap hints, and conditional GETs turn an unchanged page into a tiny 304. Don't chase pages that change on every request (timestamps, ad slots): those changes are noise, so compare the extracted text, not raw bytes. The budget is fixed at 1B fetches, so recrawls and discovery compete; I'd reserve a share (for example 40%) for new URLs so the index doesn't stagnate.",
        "5. Crawler traps. Calendars with a \"next month\" link forever, session IDs that make every visit a new URL, relative links that build /a/b/a/b/a/b, and sites that generate pages for any URL. Defences: cap URL length (~2,000 characters) and path depth, reject URLs with repeated path segments or too many query parameters, cap pages per host by its quality (a new unknown host gets, say, 1,000 pages until its pages earn links from elsewhere), and watch for hosts whose discovered URL count explodes while content is near-duplicate. These limits also protect us from accidental traps, which are far more common than malicious ones.",
        "6. Distributing the work. Assign each host to a node by consistent hashing of the hostname. The node that owns a host owns its back queue, robots rules, DNS entries, delay state and the slice of the Bloom filter for its URLs, so politeness needs no cross-node locking. Extracted links for other hosts are batched and sent to their owner, for example through a Kafka topic partitioned by host hash. Adding a node moves ~1/N of hosts. Big hosts don't overload their node, because politeness caps each host at a request or so per second anyway.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction:
        "Say what limits the crawler first, what happens when a node or a dependency fails, and what you'd watch " +
        "on the dashboard, including the signals that you're being impolite. About 4 minutes.",
      points: [
        "Bottlenecks: frontier disk I/O, the link dedup path, parsing CPU, and the supply of polite-to-fetch hosts",
        "Node failure: its hosts move to other nodes, which reload the checkpointed frontier; a few pages get fetched twice",
        "robots.txt unavailable means don't crawl that host, never \"assume allowed\"",
        "Content store or indexer outage pauses or buffers the crawl instead of dropping pages",
        "Operational duty: honour opt-outs fast, publish a bot page and IP ranges",
        "Metrics: pages/s, status code mix, frontier size and age of oldest due URL, duplicate rate, DNS latency, robots denials, complaints",
      ],
      model: [
        "Bottlenecks: frontier disk throughput and the 20k/s link-dedup path come first; then parsing CPU, which grows a lot if we add JavaScript rendering (a headless browser costs one to two orders of magnitude more per page, so you'd render only pages that need it). At some point the limit is politeness itself: if too few hosts are ready to fetch, adding fetchers does nothing.",
        "Failure modes:",
        "- A crawler node dies: consistent hashing moves its hosts to the neighbouring nodes, which load its last frontier checkpoint and replay the link topic since then. Some URLs are fetched twice; that's harmless.",
        "- robots.txt can't be fetched: the host is treated as disallowed until it can. Never default to crawling.",
        "- Content store or Kafka down: fetchers stop pulling from the frontier rather than fetching pages they can't save; the frontier just waits.",
        "- DNS resolver down: cached entries keep working until they expire, and the fetchers slow down rather than fail.",
        "Operations: a public page explaining the bot, published IP ranges so sites can verify it, and fast handling of block requests through the host policy endpoint.",
        "Monitoring: pages fetched per second, status code mix (a jump in 429s or 503s means we're being impolite somewhere), frontier size and the age of the oldest due URL, exact and near-duplicate rates, DNS latency and cache hit ratio, robots-denied rate, hosts with exploding URL counts (traps), freshness measured by re-sampling indexed pages, and site owner complaints.",
      ],
    },
  ],
};

const notificationSystem: DesignInterview = {
  id: "notificationSystem",
  title: "Design a Notification System",
  prompt:
    "\"Design a notification platform that every product team in the company uses to reach users by mobile push " +
    "(APNs and FCM), SMS and email. It handles everything from one-time login codes to weekly marketing " +
    "campaigns, and users can choose what they receive.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Clarify who sends, through which channels, and what kinds of notification there are, because a login " +
        "code and a marketing email need very different guarantees. Ask about preferences and tracking too. " +
        "About 5 minutes.",
      points: [
        "Channels: push (APNs, FCM), SMS, email; callers are internal product teams, not end users",
        "Separates transactional (OTP, security, receipts) from marketing and bulk campaigns",
        "Latency target for urgent messages (OTP handed to the provider within ~1-2 s) vs hours for campaigns",
        "User preferences per category and channel, unsubscribe, quiet hours",
        "No duplicates and no silent loss: at-least-once with dedupe",
        "Delivery status tracking (sent, delivered, bounced, opened) visible to the sending team",
        "Scopes out the in-app inbox, A/B testing and building our own SMS or email infrastructure",
      ],
      model: [
        "Questions I'd ask: How many users and notifications a day? Which channels, and are we using third-party providers? Who calls us: backend services only, or a marketing UI as well? What kinds of notification are there, and how urgent is the most urgent? Can users opt out per category? Do we need scheduled sends and campaigns to millions of users? What delivery status do teams need back?",
        "Assume: 200M users, about 1B notifications a day, providers for every channel (APNs, FCM, an SMS gateway such as Twilio, an email service such as SES or SendGrid), backend callers plus a campaign tool, and categories ranging from login codes to weekly marketing.",
        "Functional:",
        "- Teams send a notification to a user by category and template; the platform picks channels from the category and the user's preferences.",
        "- Users manage preferences per category and channel, unsubscribe, and set quiet hours.",
        "- Scheduled sends and bulk campaigns to a user segment.",
        "- Per-notification status: accepted, sent, delivered, failed, bounced, opened where the channel reports it.",
        "Non-functional:",
        "- Urgent messages (OTP, security alerts) reach the provider within ~1-2 s, even while a campaign is running.",
        "- Once accepted, a notification is never silently lost; users should not get the same notification twice.",
        "- One team's bug or campaign must not degrade other teams' notifications.",
        "- Respect provider limits, user limits and the law (unsubscribe links, SMS consent and STOP).",
        "Out of scope: an in-app notification inbox, A/B testing of content, and running our own SMTP or SMS infrastructure.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Split the volume by channel, find the peak, and compare it with what the providers will accept. Size the " +
        "log, the preference lookups and the callback traffic. Note what SMS costs. About 4 minutes.",
      points: [
        "1B/day is ~11,600/s average; campaigns push the peak to ~50k/s",
        "Split by channel: ~800M push, ~195M email, ~5M SMS",
        "Provider limits are the real ceiling: FCM's default quota is ~600k/min, about 10k/s",
        "SMS at ~$0.01 or more each is ~$50k/day, so SMS only where needed and duplicates cost money",
        "Log: ~500 bytes × 1B = 500 GB/day, ~45 TB for 90 days",
        "Preference lookup on every send: up to 50k/s over ~200 GB, so it must be cached",
        "Callbacks: ~3 events per email, ~7k/s average with bursts after campaigns",
      ],
      model: [
        "Volume: 1B/day ≈ 11,600 per second on average. By channel, say 800M push, 195M email, 5M SMS.",
        "Peak: a campaign to 100M users paced over 2 hours adds ~14,000/s by itself, and campaigns overlap with morning traffic, so plan for ~50,000/s handed to providers at peak.",
        "Provider limits: if half of push goes to Android, FCM sees ~4,600/s on average and well over 10,000/s during campaigns. FCM's default quota is about 600,000 messages a minute per project (~10,000/s), and SMS and email providers set per-account sending rates too. So provider limits, not our servers, cap throughput, and the platform needs a global rate limiter per provider account and campaign pacing.",
        "SMS: 5M/day is only ~60/s on average (peaks ~300/s), but at roughly a cent each in the US and more abroad, that's ~$50k a day. SMS is for OTPs and critical alerts, and a duplicate is money as well as annoyance.",
        "Storage: a notification log row of ~500 bytes (ids, category, template version, per-channel status timeline) × 1B = 500 GB/day; 90 days of retention ≈ 45 TB, ~135 TB with 3x replication. Device tokens: 200M users × ~2 devices × ~200 bytes ≈ 80 GB. Preferences: ~1 KB per user ≈ 200 GB.",
        "Reads: every notification reads the user's preferences, contact details and rate-limit counters, up to 50,000/s at peak, so those sit in Redis.",
        "Callbacks: email providers send ~3 events per message (delivered, open, click, bounce), ~600M/day ≈ 7,000/s, with bursts of several times that just after a campaign.",
        "Conclusion: compute is small (a worker multiplexing HTTP/2 to APNs pushes thousands per second). The design is about queues that keep urgent traffic flowing, pacing to provider limits, and not sending things twice.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "Define the send API product teams call, plus preferences, devices, templates and campaigns. Say how " +
        "retries by callers stay safe. About 4 minutes.",
      points: [
        "POST /notifications with idempotency_key, user_id, category, template_id, params, optional send_at",
        "Returns 202 Accepted with a notification_id; delivery is asynchronous",
        "A repeated idempotency key returns the original notification, not a second send",
        "Preferences and quiet hours endpoints; device token registration",
        "Campaign endpoints: create, schedule, pause, cancel, progress",
        "Per-team credentials and quotas, with each team allowed only its own categories",
      ],
      model: [
        "- POST /v1/notifications  { idempotency_key, user_id, category, template_id, params, channels?, send_at?, expires_at? }  ->  202 { notification_id, status: \"accepted\" }. Repeating the same idempotency_key returns the same notification_id and doesn't send again. 400 for a missing template parameter, 403 if the team may not use that category, 429 when the team is over quota.",
        "- GET /v1/notifications/{id}  ->  { status per channel, provider ids, timestamps }.",
        "- GET / PUT /v1/users/{id}/preferences  { categories: { \"marketing.weekly\": { email: true, push: false } }, quiet_hours: { start: \"22:00\", end: \"08:00\", tz } }.",
        "- POST /v1/users/{id}/devices  { platform, app_id, token }  and DELETE /v1/users/{id}/devices/{device_id}.",
        "- POST /v1/templates (versioned, per channel and locale) and POST /v1/campaigns  { template_id, segment_id, send_at, max_rate, channels }  ->  202 { campaign_id }, with PATCH to pause or cancel and GET for progress.",
        "- POST /webhooks/{provider}: inbound delivery events, signature-checked.",
        "The category is the important field. It's registered once by the owning team and says whether the notification is transactional or marketing, its priority, default channels, and whether users can mute it (security alerts can't be muted). Callers don't pass a priority themselves, otherwise everything becomes urgent.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Lay out notifications and their per-channel deliveries, idempotency keys, users' contact points and " +
        "preferences, and templates. Note which data is on the hot path. About 5 minutes.",
      points: [
        "Notification and per-channel delivery records with a status state machine, in Cassandra or DynamoDB with a TTL",
        "Idempotency keys (team, key) -> notification_id with a conditional insert and a ~48 h expiry",
        "provider_message_id -> delivery lookup for callbacks",
        "Device tokens, verified phone and email per user; a suppression list for bounces, complaints and STOP",
        "Preferences and quiet hours per user, cached in Redis",
        "Templates versioned per channel and locale; categories registry",
      ],
      model: [
        "Notifications: notification_id, team, user_id, category, template_id and version, params, idempotency_key, created_at, send_at, expires_at. Deliveries: (notification_id, channel) -> provider, provider_message_id, status (queued, sent, delivered, failed, bounced, opened), attempts, timestamps. Write-heavy, read by key, kept for 90 days: Cassandra or DynamoDB with a TTL, partitioned by notification_id. A second table keyed by (user_id, created_at) answers \"what did we send this user?\" for support and debugging.",
        "Idempotency: (team, idempotency_key) -> notification_id, a conditional put-if-absent with a ~48 h TTL, in the same store or in Redis backed by it.",
        "Callback index: provider_message_id -> (notification_id, channel), so a webhook event finds its delivery in one read.",
        "Contact points: devices(user_id, device_id, platform, app_id, token, last_seen, valid), plus the user's verified email and phone. ~80 GB of tokens, cached. A global suppression list (hard-bounced addresses, spam complaints, numbers that replied STOP) is checked before every email and SMS, whatever the preferences say.",
        "Preferences: user_id -> per category, per channel opt-in or opt-out, quiet hours, timezone, locale. ~200 GB in a relational or key-value store, read through Redis on every send.",
        "Templates: (template_id, version, channel, locale) -> subject, body, required params. Small, relational, cached in worker memory. Categories: category -> owning team, transactional or marketing, priority class, default channels, mutable or not.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw the path of one notification from the calling service to the user's phone or inbox, and the path of " +
        "the delivery status coming back. Show where campaigns enter. About 8 minutes.",
      points: [
        "API validates, checks idempotency, persists, enqueues, and returns 202",
        "Queues by priority; campaigns enter through a scheduler into the low-priority queue",
        "A router applies preferences, quiet hours and per-user limits, picks channels and renders templates",
        "Separate queues and worker pools per channel (and priority), each talking to its providers",
        "Provider callbacks come in through a webhook ingest that updates delivery status",
        "Invalid tokens, bounces and STOP replies feed back into devices and the suppression list",
      ],
      model: [
        "Send path: a product service calls the notification API. The API authenticates the team, checks the category is theirs, validates the template parameters, does the idempotency check, writes the notification record and enqueues it on a Kafka topic for its priority class, then returns 202. Nothing slow (rendering, preferences, providers) happens inside the request.",
        "Routing: router workers consume the request topics, high priority first. For each notification they load the user's preferences, contact points and the category rules, drop channels the user muted, defer the notification if it's quiet hours for the user and the category allows waiting, check per-user rate limits, render the template for each remaining channel and locale, and publish one message per channel onto that channel's queue.",
        "Delivery: push, SMS and email each have their own queues (high and low priority) and worker pools. A worker takes a message, passes the provider rate limiter, calls the provider, and records the result. APNs and FCM answer synchronously (accepted, or an error such as an unregistered token); SMS and email providers accept the message and report delivery later.",
        "Status path: providers call our webhooks. The callback ingest verifies the signature, enqueues the event and returns 200 at once, then a consumer looks up the delivery by provider_message_id and advances its status. Bounces, complaints, STOP replies and dead tokens also update the suppression list and devices table.",
        "Campaigns and scheduled sends: the scheduler holds send_at notifications and campaign definitions, expands a campaign's segment in batches, and feeds them into the low-priority topic at the campaign's pace.",
      ],
      diagram: {
        nodes: [
          { id: "services", label: "Product services", col: 0, sub: "many teams" },
          { id: "scheduler", label: "Scheduler", col: 0, sub: "campaigns, send_at" },
          { id: "api", label: "Notification API", col: 1, sub: "auth + validate" },
          { id: "queue", label: "Request queues", col: 1, sub: "Kafka, by priority" },
          { id: "idem", label: "Dedupe store", col: 2, sub: "idempotency keys" },
          { id: "router", label: "Router", col: 2, sub: "prefs, limits, render" },
          { id: "prefs", label: "Prefs + templates", col: 2, sub: "Redis-cached" },
          { id: "push", label: "Push workers", col: 3, sub: "high + low queues" },
          { id: "sms", label: "SMS workers", col: 3, sub: "high + low queues" },
          { id: "log", label: "Notification log", col: 3, sub: "Cassandra, 90-day TTL" },
          { id: "email", label: "Email workers", col: 3, sub: "high + low queues" },
          { id: "apns", label: "APNs / FCM", col: 4 },
          { id: "smsp", label: "SMS providers", col: 4, sub: "Twilio etc." },
          { id: "callbacks", label: "Callback ingest", col: 4, sub: "signed webhooks" },
          { id: "emailp", label: "Email providers", col: 4, sub: "SES / SendGrid" },
        ],
        edges: [
          { from: "services", to: "api", label: "send" },
          { from: "api", to: "queue", label: "enqueue" },
          { from: "api", to: "idem", label: "dedupe" },
          { from: "scheduler", to: "queue", label: "paced" },
          { from: "queue", to: "router" },
          { from: "router", to: "prefs", label: "lookup" },
          { from: "router", to: "push" },
          { from: "router", to: "sms" },
          { from: "router", to: "email" },
          { from: "push", to: "apns" },
          { from: "sms", to: "smsp" },
          { from: "email", to: "emailp" },
          { from: "smsp", to: "callbacks", label: "DLRs" },
          { from: "emailp", to: "callbacks", label: "events" },
          { from: "callbacks", to: "log", label: "status" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "Interviewers usually push on priority and campaigns, provider failures and retries, and duplicates. " +
        "Be ready for preferences, templating and delivery tracking. Compare options and commit. About 15 minutes.",
      points: [
        "Separate queues and worker pools per channel and priority, so one provider or campaign can't block others",
        "Campaigns expanded lazily and paced, with provider capacity reserved for transactional traffic",
        "Provider rate limiter; retry only retryable errors, with exponential backoff, jitter and retry topics",
        "Permanent errors (dead token, hard bounce) stop retries and clean up data; circuit breaker and provider failover",
        "Idempotency at the API and a conditional state change before each provider call; exactly-once isn't possible across a provider",
        "Preferences, quiet hours in local time and per-user rate limits, with OTP and security alerts exempt",
        "Versioned templates per channel and locale; delivery status as a forward-only state machine fed by callbacks",
      ],
      model: [
        "1. Queues, priority and campaigns. One shared queue would let a slow SMS provider or a 100M-user campaign hold up a login code. So each channel gets its own topics and worker pool, and each channel has a high-priority and a low-priority topic. Kafka has no message priorities, so priority means separate topics with their own consumers and a reserved share of provider capacity: for example 30% of the SMS rate and a fixed slice of the FCM quota always held for transactional traffic, with marketing allowed to use whatever transactional isn't using. Urgent messages carry an expires_at; an OTP still queued after 5 minutes is dropped, because sending it late only confuses the user. Campaigns are never expanded all at once: the scheduler walks the segment with a cursor, a few thousand users per batch, at the campaign's max_rate (100M users over 2 hours is ~14k/s), so a campaign can be paused or cancelled halfway and never floods the queues. Sending at 9:00 in each user's own timezone spreads the load further.",
        "2. Provider limits and retries. Each provider account gets a token-bucket limiter (in Redis, or a quota split across workers and rebalanced every few seconds) set just under its limit, so we slow ourselves down instead of collecting 429s. Errors fall into two groups:",
        "- Retryable: timeouts, 5xx, 429. Retry with exponential backoff and jitter, honour Retry-After, and give up after a maximum age (minutes for an OTP, hours for a digest). Retries go to delay topics (1 min, 10 min, 1 h) rather than sleeping in a worker, then to a dead-letter queue.",
        "- Permanent: APNs 410 / FCM UNREGISTERED for a dead token, an invalid phone number, a hard bounce. Never retry: mark the token invalid or add the address to the suppression list.",
        "A circuit breaker per provider stops calls when its error rate spikes. For SMS and email we keep a second provider (often chosen per country for SMS) and fail over; for push there's no alternative to APNs and FCM, so messages wait in the queue. Keep HTTP/2 connections to APNs open and multiplex many requests on each.",
        "3. Idempotency and dedupe. Every step is at-least-once: callers retry, Kafka redelivers after a crash, workers retry providers. Without dedupe, users see doubles and we pay for duplicate SMS. Layers:",
        "- At the API, a conditional insert on (team, idempotency_key): a retried request gets the original notification_id.",
        "- At the worker, before calling the provider, change the delivery's status from queued to sending with a conditional write. A redelivered message that finds sending or sent skips the call. A crash between the provider call and the status write still leaves a small window, so exactly-once across a third party isn't possible; we make the window tiny. A delivery stuck in sending is checked with the provider before it's resent, where the provider supports that.",
        "- Content-level: a dedupe key such as like:{post_id}:{user_id} collapses repeats within a window, and push uses apns-collapse-id / FCM collapse_key so a newer notification replaces an older one on the device.",
        "4. Preferences, quiet hours, per-user limits. The router evaluates the category's rules: transactional categories (OTP, password reset, security alerts) skip preferences and quiet hours, while marketing needs an opt-in, always includes an unsubscribe link (a legal requirement for email) and respects SMS STOP. Quiet hours are computed in the user's timezone; a non-urgent push during them is deferred to the end of the window by the scheduler, or dropped if it would expire first. Per-user limits (for example at most 3 marketing pushes a day, at most 10 non-critical notifications an hour) are sliding-window counters in Redis keyed by user and channel; over the limit, a notification is dropped or folded into a digest. If Redis is unavailable, the limiter fails open for transactional and closed for marketing.",
        "5. Templating. Teams own templates, versioned and stored per channel and locale, using a logic-less engine (Mustache style) so a template can't run code or make network calls. The API validates required parameters at accept time, so a typo fails the caller instead of sending \"Hi {{name}}\". The request pins the template version, so editing a template doesn't change messages already in flight. Each channel has its own constraints: APNs payloads max out at 4 KB, an SMS segment is 160 GSM-7 characters (70 if any character falls outside GSM-7, such as most emoji or non-Latin scripts) and every segment is billed, and email needs HTML plus a plain-text part. Locales fall back to the default language.",
        "6. Delivery tracking. What \"delivered\" means differs by channel. APNs and FCM only confirm they accepted the message; real delivery or open is reported by our app. SMS delivery receipts arrive by webhook from the carrier, sometimes minutes later. Email gives delivered, bounce, complaint, open and click events, and opens are unreliable since mail apps preload images. Callbacks arrive out of order and sometimes before we've recorded \"sent\", so status is a forward-only state machine (a late \"sent\" never overwrites \"delivered\"), and an unknown provider_message_id is retried briefly before being parked.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction:
        "Say what limits the platform first, how it behaves when a provider or a dependency fails, and what you'd " +
        "watch, including sender reputation and cost. About 4 minutes.",
      points: [
        "First limit: provider quotas and sender reputation, not our own servers",
        "Provider outage: circuit breaker, failover for SMS and email, a queue backlog for push; OTPs expire rather than arrive late",
        "Redis or preference store down: fail open for transactional, closed for marketing",
        "A team's runaway loop is stopped by per-team quotas and per-user limits",
        "Callback floods after campaigns are absorbed by queueing webhooks",
        "Metrics: accept-to-provider p99 by priority, queue lag per topic, provider errors and throttling, delivery and bounce rates, complaint rate, SMS spend",
      ],
      model: [
        "Bottlenecks: provider quotas and sender reputation come before anything we run. A campaign that triggers many spam complaints can get our email domain throttled or blocked for everyone, including password resets, so marketing and transactional email should use separate sending domains or IP pools. Next, the preference and rate-limit lookups on the router's hot path (cached), and callback bursts after big campaigns (queued).",
        "Failure modes:",
        "- An SMS or email provider goes down: the circuit breaker opens and traffic moves to the secondary provider. APNs or FCM down: push queues build up and drain when it recovers; expired OTPs are dropped, and the login flow offers another channel.",
        "- A router or worker crashes mid-batch: Kafka redelivers, and the conditional status change prevents most duplicates.",
        "- A team ships a bug that sends in a loop: their per-team quota returns 429, per-user limits stop the user from being flooded, and the idempotency key catches identical retries.",
        "- The webhook endpoint is slow: providers retry callbacks, and since status changes only move forward, replays are harmless.",
        "Monitoring: accept-to-provider latency p50/p99 by priority (the OTP number is the one to page on), queue lag per topic, provider error and throttle rates, circuit breaker state, delivery rate per channel, hard bounce and spam complaint rates (keep complaints well under 0.1%), invalid-token rate, opt-out rate per category (a spike means a team is over-sending), and daily SMS spend.",
        "If I had more time: an in-app inbox as another channel, digests that batch low-priority notifications, and choosing the best send time per user.",
      ],
    },
  ],
};

const videoStreaming: DesignInterview = {
  id: "videoStreaming",
  title: "Design a Video Streaming Service",
  prompt:
    "\"Design a video platform like YouTube. Creators upload videos from a browser or phone; viewers watch them " +
    "on phones, laptops and TVs, over connections that range from fibre to a weak mobile signal.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Clarify the two halves of the product, uploading and watching, and the quality bar for each. Ask about " +
        "file sizes, devices and how quickly a new upload must be playable. About 5 minutes.",
      points: [
        "Core features: upload a video, watch it on any device, title/description/visibility, a view count",
        "Asks the maximum file size and length, and how soon after upload a video must be playable",
        "Asks which devices and network conditions viewers have (drives the set of resolutions and codecs)",
        "Playback quality as the main non-functional goal: start in under ~2 s, rarely rebuffer",
        "Uploads must survive flaky networks: a dropped connection resumes, it never restarts from zero",
        "Treats storage and bandwidth cost as a requirement, not an afterthought",
        "Scopes out recommendations, search, comments, live streaming, ads",
      ],
      model: [
        "Questions I'd ask: How many daily viewers, and how long do they watch? How many uploads a day, and how long is a typical video? What's the largest file we accept? How soon after upload must a video be watchable? Which devices: browsers, iOS, Android, smart TVs? Do we need live streaming? Are view counts shown publicly, and how fresh must they be?",
        "Assume: 500M daily viewers watching ~40 minutes each, 3M uploads a day averaging 10 minutes, files up to 20 GB or 12 hours, a typical video watchable within ~5 minutes of upload (HD can follow later), view counts public and a few minutes stale at most.",
        "Functional:",
        "- Upload a video with title, description and visibility (public, unlisted, private); see its processing status.",
        "- Watch a video with quality that adapts to the viewer's connection, and seek anywhere in it.",
        "- See a view count per video.",
        "Non-functional:",
        "- Playback: time to first frame under ~2 s and a rebuffering ratio well under 1%. This matters more than any API latency.",
        "- Uploads are resumable: a 4 GB upload that drops at 90% resumes at 90%.",
        "- Durability: an uploaded original is never lost; availability of playback matters more than of uploads.",
        "- Cost: bandwidth and storage are the dominant bills, so the design should make them visible and controllable.",
        "Out of scope: recommendations, search, comments, live streaming, ads and monetisation. I'll mention DRM and content moderation where they plug in.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Size uploads, storage, transcoding compute and, above all, viewing bandwidth. Each number should tell you " +
        "something about the design. About 4 minutes.",
      points: [
        "Upload volume: 3M videos × 10 min = 500k hours of video a day",
        "Raw ingest ~1.8 PB/day; with renditions ~4 PB/day, over an exabyte a year",
        "Transcoding: ~6 vCPU-hours per source hour, so ~125k vCPUs busy around the clock",
        "Viewing: 333M hours/day at ~2.5 Mbps is ~375 PB/day, ~35 Tbps average, ~70 Tbps peak",
        "~4B views/day (46k/s, peak ~150k/s) and ~3.5M segment requests per second",
        "Metadata is tiny (a few TB) compared with blobs (exabytes), so they live in different systems",
        "Concludes: egress needs a CDN at the edge; storage and transcoding need cost controls",
      ],
      model: [
        "Uploads: 3M videos/day × 10 minutes = 500,000 hours of new video per day, about 35 uploads per second (peak ~100/s).",
        "Raw storage: a 1080p source at ~8 Mbps is ~1 MB/s, or 3.6 GB per hour. 500k hours × 3.6 GB ≈ 1.8 PB/day of originals, arriving at ~170 Gbps on average.",
        "Renditions: an H.264 ladder of 240p to 1080p (roughly 0.3 + 0.7 + 1.2 + 2.5 + 5 ≈ 10 Mbps in total) adds about 1.2x the source size, ~2.2 PB/day. Together that's ~4 PB/day, ~1.5 EB/year before redundancy. At this size 3x replication is too expensive; we use erasure coding (~1.5x overhead) and move originals to cold storage after transcoding.",
        "Transcoding: a full H.264 ladder costs roughly 6 vCPU-hours per hour of source. 500k × 6 = 3M vCPU-hours/day ≈ 125,000 vCPUs busy all day, ~250k at peak. AV1 saves 30-50% bandwidth but costs ~10x more to encode, so we can't afford it for every upload: only for the small share of videos that get most of the views.",
        "Viewing: 500M × 40 min ≈ 333M hours watched per day. At an average delivered bitrate of ~2.5 Mbps (lots of mobile at 480p-720p), an hour is ~1.1 GB, so ~375 PB/day ≈ 35 Tbps on average and ~70 Tbps in the evening peak. No origin can serve that; it has to come from caches close to viewers, and even at a fraction of a cent per GB this is the largest line on the bill.",
        "Requests: ~8 views per viewer per day is 4B views/day ≈ 46,000/s (peak ~150k/s). With 4-second segments, 333M hours is ~300B segment requests/day ≈ 3.5M/s, nearly all of which the CDN must absorb.",
        "Metadata: ~2 KB per video × 3M/day ≈ 6 GB/day, a few TB for the whole catalogue. That fits a sharded relational store.",
        "Conclusion: each hour uploaded is watched ~670 hours on average (heavily skewed), so it pays to spend compute once at upload to make every view cheap. Blobs and bandwidth dominate everything; metadata is small.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "Define the upload API (it must be resumable), the metadata API, and how a player gets the video. " +
        "Playback is mostly static files from a CDN, not API calls. About 4 minutes.",
      points: [
        "Create an upload session that returns an upload_id, video_id and chunk size",
        "Upload chunks by index or byte offset, query which chunks arrived, then complete",
        "Per-chunk checksums so corrupt chunks are retried, not stitched in",
        "Video metadata endpoint returning status (processing / ready) and a signed manifest URL",
        "Playback is HLS/DASH manifests and segments fetched from the CDN, not through the API",
        "Batched playback events (view, heartbeat, quality switches) for counting and QoE metrics",
      ],
      model: [
        "- POST /v1/uploads  { filename, size_bytes, content_type, sha256? }  ->  201 { upload_id, video_id, chunk_size: 16 MB, expires_at }",
        "- PUT /v1/uploads/{upload_id}/chunks/{index}  body: raw bytes, header Content-MD5 or CRC32C  ->  200. Chunks can be sent in parallel and in any order; resending a chunk overwrites it.",
        "- GET /v1/uploads/{upload_id}  ->  { received: [0..41, 43], size_bytes }: the client calls this after reconnecting and sends only what's missing.",
        "- POST /v1/uploads/{upload_id}/complete  ->  202 { video_id, status: \"processing\" }",
        "- PATCH /v1/videos/{video_id}  { title, description, visibility }; GET /v1/videos/{video_id}  ->  { title, status, duration, view_count, thumbnails, manifest_url }",
        "- GET https://cdn.example.com/v/{video_id}/master.m3u8?token=...  then variant playlists and segments, all from the CDN. The token is a short-lived signature over the video_id, so private and unlisted videos can't be hot-linked forever.",
        "- POST /v1/playback-events  [{ session_id, video_id, type: start|heartbeat|quality_change|rebuffer|end, position_s, bitrate, ts }]: batched every ~30 s.",
        "Metadata can be filled in while the upload is still running. The video stays in status processing until the first renditions exist; the creator polls or gets a notification.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Separate the small, structured metadata from the huge, immutable video bytes, and say how each is stored " +
        "and laid out. Include upload sessions, renditions and view counts. About 5 minutes.",
      points: [
        "Videos table: video_id, owner_id, title, visibility, status, duration, created_at",
        "Metadata in a sharded relational store (MySQL/Vitess) keyed by video_id, index on owner_id",
        "Video bytes in object storage with a deterministic key layout per video, rendition and segment",
        "Renditions table: one row per codec and resolution, pointing at its playlist",
        "Upload sessions with received chunks and an expiry; abandoned uploads cleaned up",
        "Originals in a separate bucket that moves to cold storage after transcoding",
        "View counts as aggregated counters, raw events in a log and warehouse",
      ],
      model: [
        "Videos: video_id (random 64-bit, shown as an 11-character string), owner_id, title, description, visibility, status (uploading, processing, ready, failed, blocked), duration_s, created_at, original_key. A few TB in total with simple access patterns (by video_id, list by owner_id), so sharded MySQL via Vitess, keyed by video_id, with an owner_id index. A video row also gets heavily cached, because every watch page reads it.",
        "Renditions: (video_id, codec, height, bitrate, playlist_key, storage_tier, created_at). Lets us add AV1 later for a popular video, or delete 4K renditions nobody watches, without touching the video row.",
        "Upload sessions: upload_id, video_id, object-storage multipart upload id, size, chunk_size, received bitmap, expires_at (7 days). Small and hot while active, so Redis or a small table with a TTL.",
        "Blobs in object storage (S3/GCS), immutable and written once:",
        "- originals/{video_id}/source: the uploaded file, kept forever but moved to an archive tier after transcoding.",
        "- media/{video_id}/{codec}_{height}p/seg_00042.m4s plus a playlist per rendition and one master manifest. Deterministic keys make transcoding tasks idempotent: a retried task overwrites the same object.",
        "- Thumbnails and captions next to the renditions.",
        "Views: raw playback events go to Kafka and then a warehouse (BigQuery/Hive) for exact counts and analytics. The public count is a counter per video_id that a stream job increments in batches, stored in the metadata DB or a counter store and cached.",
        "Workflow state for transcoding (task status, attempts, output keys) lives in the workflow engine's own store, not in the videos table.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw the upload path (bytes in, processing, playable) and the watch path (player, CDN, origin). Walk " +
        "through one upload and one view. About 8 minutes.",
      points: [
        "Upload service accepts chunks and writes them to object storage as a multipart upload",
        "Upload completion publishes an event that starts the transcoding pipeline asynchronously",
        "Transcoding writes segments and manifests to object storage, then marks the video ready",
        "Watch path: metadata from the video service, then manifests and segments from the CDN",
        "CDN misses go to a shield tier and origin servers in front of object storage, never straight to the bucket",
        "Playback events flow through a collector and Kafka to the view counter",
      ],
      model: [
        "Upload: the client creates a session through the API gateway, then streams 16 MB chunks to the upload service, which writes each one as a part of an object-storage multipart upload and records it in the session. On complete, it finalises the object, verifies the checksum, and publishes \"video uploaded\" to Kafka. The transcoding orchestrator picks that up and runs the processing DAG on a worker fleet; workers write segments, playlists and thumbnails to object storage and finally set the video's status to ready.",
        "Watch: the player loads the watch page, which calls the video service for metadata (served from cache) and gets a signed manifest URL. It fetches the master manifest, picks a rendition, and pulls segments from the nearest CDN edge. On a miss the edge asks a regional shield cache; on a shield miss, origin servers read the object from storage. Popular videos never get past the edge.",
        "Views: the player sends batched playback events to the event collector, which writes them to Kafka. A stream job (Flink) aggregates them into view counts and quality-of-experience metrics.",
        "The upload path and the watch path share only object storage and the metadata DB, so an upload surge or a transcoding backlog never slows playback.",
      ],
      diagram: {
        nodes: [
          { id: "client", label: "Clients", col: 0, sub: "uploader / player" },
          { id: "cdn", label: "CDN", col: 1, sub: "edge + shield" },
          { id: "gw", label: "API gateway", col: 1 },
          { id: "origin", label: "Origin servers", col: 2 },
          { id: "upload", label: "Upload service", col: 2, sub: "resumable" },
          { id: "video", label: "Video service", col: 2, sub: "metadata API" },
          { id: "events", label: "Event collector", col: 2 },
          { id: "blob", label: "Object storage", col: 3, sub: "originals + segments" },
          { id: "kafka", label: "Event log", col: 3, sub: "Kafka" },
          { id: "meta", label: "Metadata DB", col: 3, sub: "Vitess + cache" },
          { id: "transcode", label: "Transcode DAG", col: 4, sub: "workers on spot VMs" },
          { id: "views", label: "View counter", col: 4, sub: "Flink" },
        ],
        edges: [
          { from: "client", to: "cdn", label: "segments" },
          { from: "client", to: "gw", label: "API" },
          { from: "cdn", to: "origin", label: "on miss" },
          { from: "gw", to: "upload", label: "chunks" },
          { from: "gw", to: "video", label: "metadata" },
          { from: "gw", to: "events", label: "views" },
          { from: "origin", to: "blob", label: "read" },
          { from: "upload", to: "blob", label: "parts" },
          { from: "upload", to: "kafka", label: "uploaded" },
          { from: "video", to: "meta" },
          { from: "events", to: "kafka" },
          { from: "kafka", to: "transcode", label: "job" },
          { from: "transcode", to: "blob", label: "renditions" },
          { from: "transcode", to: "meta", label: "ready" },
          { from: "kafka", to: "views" },
          { from: "views", to: "meta", label: "counts" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "Likely topics: resumable uploads, the transcoding pipeline, adaptive bitrate streaming, CDN strategy and " +
        "view counting. Pick the ones the interviewer pushes on, compare options, and keep cost in view throughout. " +
        "About 15 minutes.",
      points: [
        "Resumable chunked uploads: fixed-size chunks, per-chunk checksums, resume from the server's record",
        "Transcoding as a DAG: split at keyframes, encode segments × renditions in parallel, then package",
        "Idempotent, retryable tasks so the fleet can run on cheap preemptible VMs",
        "Adaptive bitrate: master manifest of renditions, aligned keyframes, player switches per segment",
        "CDN tiers: popular content at the edge or inside ISPs, long tail behind a shield, request collapsing",
        "View counting through a log with batched counter updates, not a row update per view",
        "Cost levers: codec choice by popularity, storage tiering, cache hit ratio by bytes",
      ],
      model: [
        "1. Resumable uploads. A single PUT of a 4 GB file from a phone fails often and restarts from zero. Instead the client splits the file into 16 MB chunks (a 2 GB video is 128 chunks), uploads a few in parallel, and sends a checksum with each one; the upload service rejects a chunk whose checksum doesn't match. The server's record of received chunks is the truth, so after any failure the client asks which chunks are missing and sends only those. Chunks map onto an object-storage multipart upload, so the upload service never buffers a whole file. Sessions expire after 7 days and a lifecycle rule deletes orphaned parts, which otherwise quietly cost money. Pre-signed URLs straight to object storage are a valid alternative that takes the upload service off the data path, at the cost of less control over validation and rate limits.",
        "2. Transcoding as a DAG. Encoding a 2-hour video into five resolutions on one machine takes hours. So the orchestrator (a workflow engine such as Temporal, or an in-house DAG scheduler) runs it as a graph of small tasks:",
        "- Probe and validate the file (codec, duration, corrupt streams), and start content moderation and thumbnail extraction as parallel branches.",
        "- Split the source into ~10 s pieces at keyframe (GOP) boundaries. A 10-minute video is 60 pieces.",
        "- Encode each piece into each rendition in parallel: 60 pieces × 5 renditions = 300 independent tasks, so the whole video finishes in roughly the time of the slowest single task plus scheduling, a few minutes.",
        "- Package each rendition into 4 s segments, write the playlists and the master manifest, and mark the video ready.",
        "Each task reads one input and writes to a deterministic output key, so a retry just overwrites the same object. That's what lets the fleet run on spot/preemptible VMs at a fraction of the price: a preempted task is simply retried. Low resolutions are scheduled first so a video is watchable at 360p-720p quickly and 1080p/4K appear later. Codec choice is a cost decision: H.264 for everything because every device plays it, VP9 or AV1 added only when a video crosses a view threshold, since the 30-50% bandwidth saving only beats the ~10x encoding cost on videos that are watched a lot.",
        "3. Adaptive bitrate streaming. The master manifest lists each rendition with its bandwidth, resolution and codec; each rendition's playlist lists its segments. The player measures throughput and buffer level and chooses the rendition for every next segment: it starts low for a fast first frame, climbs while the buffer grows, and drops before it runs dry. Switching is seamless only because keyframes are aligned across renditions at segment boundaries. Segment length is a trade-off: 2 s segments start and seek faster but mean more requests and slightly worse compression; 6-10 s are efficient but react slowly. 4 s is a common middle. HLS is required for Apple devices and DASH is common elsewhere; packaging as CMAF (fragmented MP4) lets both manifests point at the same segment files, so we store the bytes once.",
        "4. CDN strategy. 35-70 Tbps can only come from the edge. Popularity is a power law: a small fraction of videos takes most of the views. Popular videos are served from edge PoPs and from cache appliances inside ISPs (like Netflix Open Connect or Google Global Cache), and can be pushed there overnight when demand is predictable. The long tail would just churn edge caches, so it is served from fewer, larger regional caches. A shield tier between edge and origin means a region asks the origin for each segment at most once; request collapsing at the shield turns 10,000 simultaneous misses on a just-viral video into one origin read. The target metric is cache hit ratio by bytes (aim for 95%+), because every point of miss ratio is origin egress we pay for. Using more than one CDN gives price leverage and failover.",
        "5. View counting. 150k views/s at peak, and one viral video can take tens of thousands per second, so \"UPDATE videos SET views = views + 1\" would turn its row into a hot lock. Instead the player reports a view after ~30 s of playback; events go through Kafka to a Flink job that drops duplicates by session_id, filters obvious bots, and adds per-video deltas to the counter every few seconds. The public count is minutes stale, which is acceptable. Exact numbers for creators and payouts are recomputed in batch from the raw events in the warehouse. Sharded counters (N sub-counters per hot video, summed on read) are the alternative if you need fresher counts without a stream processor.",
        "Cost overall: put it on the dashboard as cost per hour watched. The levers are the cache hit ratio, the codec mix, archiving originals, deleting renditions with no views (they can be regenerated from the original), erasure coding over replication, and spot capacity for transcoding.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction:
        "Where does this design break first, what happens when the CDN, transcoding or storage fails, and what " +
        "would you watch? About 4 minutes.",
      points: [
        "Transcoding backlog during upload spikes: queue absorbs it, prioritise short and popular uploads",
        "Viral video miss storm: shield tier and request collapsing protect the origin",
        "Preempted or crashed workers lose one task, which is retried idempotently",
        "CDN PoP or provider outage: traffic steered to other PoPs or a second CDN",
        "Playback of cached videos survives a metadata DB outage if watch metadata is cached",
        "Metrics: time to first frame, rebuffer ratio, bitrate delivered, CDN hit ratio by bytes, upload-to-playable time, cost per hour watched",
      ],
      model: [
        "Bottlenecks: transcoding capacity during upload spikes, which shows up as a growing queue and longer upload-to-playable times; spot capacity can disappear at the same moment. Prioritise by video length and channel size, and fall back to on-demand VMs for the low-resolution tasks that make a video playable. On the watch side, the first bottleneck is a video going viral faster than caches warm, which the shield and request collapsing handle.",
        "Failure modes:",
        "- A transcode worker dies mid-task: the orchestrator times the task out and reruns it; outputs are overwritten, never duplicated.",
        "- A CDN PoP fails: DNS or anycast steers viewers to the next PoP; a whole CDN provider failing moves traffic to the second one, at higher origin load for a while.",
        "- Origin or a storage region fails: popular content keeps playing from caches; renditions are replicated to a second region so misses can be served there. Originals are erasure coded and copied across regions because they're the one thing we can't regenerate.",
        "- Metadata DB down: watch pages for cached videos still work from the metadata cache; uploads can continue into object storage and be registered once it's back.",
        "- Kafka or the view pipeline down: counts freeze, playback is unaffected.",
        "Monitoring: time to first frame and rebuffering ratio per region and ISP (the real user experience), average bitrate delivered, CDN hit ratio by bytes, origin egress, upload success and resume rates, upload-to-playable time p50/p99, transcode queue depth, and cost per hour watched.",
        "If I had more time: live streaming (a different latency problem), DRM for licensed content, and per-title encoding that picks a custom bitrate ladder for each video.",
      ],
    },
  ],
};

const rideSharing: DesignInterview = {
  id: "rideSharing",
  title: "Design a Ride-Sharing Service",
  prompt:
    "\"Design a ride-hailing service like Uber or Lyft. Riders request a ride from where they are; nearby drivers " +
    "get the request, one accepts, and both see each other on a map until the trip ends and the rider is charged.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Clarify the rider flow, the driver flow and the guarantees that matter: how fast a match happens, how " +
        "fresh locations are, and what must never go wrong. About 5 minutes.",
      points: [
        "Core features: fare estimate, request a ride, match a nearby driver, live tracking, trip lifecycle, payment",
        "Asks how often drivers report location and how fresh it must be",
        "Asks whether drivers can decline, and how long a rider will wait for a match",
        "Hard correctness rule: a driver is never assigned to two trips, a rider never gets two drivers",
        "Location data can be lossy and eventually consistent; trip state must be strongly consistent",
        "Availability per city: one region's failure shouldn't stop rides elsewhere",
        "Scopes out pooled rides, scheduled rides, driver onboarding, food delivery",
      ],
      model: [
        "Questions I'd ask: How many rides per day, and how many drivers are online at peak? How often does a driver's app send its location? Can drivers decline requests? Is the price shown up front, and does surge pricing exist? Is payment by card in the app? Do we need pooled rides or scheduled rides?",
        "Assume: 20M rides a day worldwide, 5M registered drivers with ~1M online at peak, location updates every 4 s, drivers can decline, upfront prices with surge, card payment charged after the trip. No pooling or scheduling.",
        "Functional:",
        "- Rider: get a fare estimate and pickup ETA, request a ride, see the driver approach, cancel, pay, rate.",
        "- Driver: go online and offline, receive ride offers and accept or decline, navigate, mark arrived, start and end the trip.",
        "- Both see the other's live position during pickup and the trip.",
        "Non-functional:",
        "- Match a rider to a driver within ~10 s in normal conditions; give up and say so after ~60 s.",
        "- Driver positions on the dispatch side no older than a few seconds.",
        "- A driver is never on two trips at once, and a request never produces two trips. This is the one place we need strong consistency.",
        "- Location updates can be dropped occasionally: the next one arrives 4 s later.",
        "- Highly available, and isolated per region so an outage in one area doesn't affect others.",
        "Out of scope: pooled rides, scheduled rides, driver onboarding and background checks, delivery, the details of fraud detection.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Estimate the location update rate, ride requests per second, read load on the location index, and storage. " +
        "Notice which number is surprisingly small. About 4 minutes.",
      points: [
        "Location updates: 1M online drivers every 4 s = 250k writes/s",
        "Latest positions: 1M × ~100 bytes = ~100 MB, small enough for memory",
        "Ride requests: 20M/day ≈ 230/s, peak ~1,500/s; fare estimates ~10x that",
        "Each request queries nearby drivers and computes ~10 road-network ETAs",
        "Riders watching cars on the map create far more geo reads than dispatch does",
        "Location history ~2 TB/day goes to a log and cold storage, not the hot path",
        "Concludes: the hard part is update and query rate on a small, fast-changing dataset",
      ],
      model: [
        "Location updates: 1M drivers online at peak, one update every 4 s = 250,000 updates per second. Each is ~100 bytes (driver_id, lat, lng, heading, speed, accuracy, timestamp), so 25 MB/s: the bandwidth is trivial, the write rate is not.",
        "Current positions: 1M × ~100 bytes ≈ 100 MB. The whole live map of the world fits in one server's memory. We still shard it, but by region for throughput and failure isolation, not for size. Writing every update to a disk-based database would be 250k writes/s of data that's overwritten 4 s later, so the live index stays in memory.",
        "Ride requests: 20M/day ≈ 230 per second on average. Demand is very peaky (Friday night, rain, a concert ending), so plan for ~1,500/s globally and much higher locally in one city. Fare estimates (riders opening the app and checking a price) run ~10x requests: ~15,000/s at peak.",
        "Dispatch work: each request looks up nearby available drivers and computes road-network ETAs for ~10 candidates: ~15,000 ETA computations/s at peak, plus one for every fare estimate. ETAs need their own scaled service.",
        "Map views: say 2M riders have the app open at peak, refreshing nearby cars every 5 s: ~400,000 geo queries/s, more than the update rate and far more than dispatch. These can be approximate and slightly stale, so they're served from a coarse per-cell snapshot, not the dispatch path.",
        "Storage: trips at ~2 KB × 20M/day = 40 GB/day, ~15 TB/year: a sharded relational store handles it. Location history at 250k/s × 100 B ≈ 2 TB/day goes through Kafka to cheap object storage, for routes on receipts, disputes and training ETA models.",
        "Conclusion: this isn't a big-data problem. It's a high-rate, small, constantly changing geospatial dataset, plus one small piece of state (who is assigned to which trip) that must be exactly right.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "Define the rider and driver APIs. Location updates and ride offers need a persistent connection; the rest " +
        "can be REST. Show how you prevent duplicate trips. About 4 minutes.",
      points: [
        "Persistent connection (WebSocket or gRPC stream) for driver locations and server pushes",
        "Fare estimate returns a quote_id that locks the price for a few minutes",
        "Ride request with an idempotency key, so a double tap never creates two trips",
        "Offer pushed to one driver with an expiry; accept and decline endpoints keyed by offer_id",
        "Trip transitions as explicit endpoints: arrived, start, complete, cancel",
        "Trip status and the driver's live position pushed to the rider",
      ],
      model: [
        "Driver connection: wss://api.example.com/v1/driver/connect with an auth token. Client -> server: location { lat, lng, heading, speed, accuracy, ts } every 4 s. Server -> client: offer { offer_id, trip_id, pickup, dropoff_area, pickup_eta_s, fare, expires_at }.",
        "- PUT /v1/drivers/me/status  { online | offline }",
        "- POST /v1/offers/{offer_id}/accept  ->  200 { trip } or 409 if the offer expired or the trip was cancelled; POST /v1/offers/{offer_id}/decline",
        "- POST /v1/trips/{trip_id}/arrived, /start, /complete { final_odometer? }: each returns the new trip state or 409 if the trip isn't in the expected state.",
        "Rider:",
        "- POST /v1/fare-estimates  { pickup, dropoff, product }  ->  { quote_id, price, surge_multiplier, pickup_eta_s, expires_at }",
        "- POST /v1/trips  { quote_id, pickup, dropoff, payment_method_id }  with header Idempotency-Key  ->  201 { trip_id, status: \"matching\" }",
        "- GET /v1/trips/{trip_id}; POST /v1/trips/{trip_id}/cancel",
        "- The rider app holds its own connection for trip updates: status changes and the driver's position every few seconds.",
        "The quote_id ties the request to the price the rider saw, so a surge change between estimate and request doesn't change what they pay. The Idempotency-Key means a retry after a timeout returns the original trip instead of creating a second one.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Split the data by how it behaves: fast-changing positions, strongly consistent trip and driver state, " +
        "and append-only history. Pick a store for each. About 5 minutes.",
      points: [
        "Live locations in an in-memory geospatial index, sharded by region, with a staleness TTL",
        "Driver state: status (offline, available, offered, on_trip), current trip, version",
        "Trips: rider, driver, status, pickup, dropoff, quote, fare, timestamps, version",
        "Trip and driver state in a strongly consistent store supporting conditional writes",
        "Quotes and surge multipliers as short-lived values in Redis",
        "Location history and trip events in Kafka, then object storage or a warehouse",
      ],
      model: [
        "Live location index (in memory, per region): driver_id -> { lat, lng, cell, ts, status } and cell_id -> set of available driver_ids. A driver with no update for ~30 s drops out, so a phone that lost signal stops getting offers. Rebuildable from the update stream within seconds, so it doesn't need to be durable.",
        "Driver state (durable): driver_id, status (offline, available, offered, on_trip), current_trip_id, current_offer_id, vehicle, product types, version. This row is what prevents double-booking, so it lives in a store with transactions or conditional writes.",
        "Trips: trip_id, rider_id, driver_id, status, pickup, dropoff, quote_id, fare, surge_multiplier, requested_at, accepted_at, started_at, completed_at, version. Sharded relational storage (Postgres/MySQL, or a distributed SQL store like Spanner or CockroachDB) partitioned by city, so a trip and the drivers that can serve it share a shard and one local transaction can update both. Secondary indexes by rider_id and driver_id serve trip history.",
        "Quotes: quote_id -> { price, multiplier, product, pickup, dropoff, expires_at } in Redis with a ~2-minute TTL.",
        "Surge: (H3 cell at resolution 7, product) -> multiplier, rewritten every minute, in Redis and cached by the pricing service.",
        "History: every location update and trip event goes to Kafka, then to object storage and a warehouse. The route of a finished trip is copied into the trip record for the receipt.",
        "Payments: a separate ledger database owned by the payments service, keyed by trip_id, with double-entry rows for rider charges and driver earnings.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw the location ingest path, the request-to-match path, and where pricing and payments plug in. Walk " +
        "through one ride from request to payment. About 8 minutes.",
      points: [
        "Connection gateways hold driver and rider sockets, separate from stateless services",
        "Location service updates the in-memory geo index and streams updates to Kafka",
        "Trip service owns the state machine; dispatch finds and offers drivers",
        "Dispatch queries the geo index for candidates and the ETA service for road-network ETAs",
        "Pricing reads precomputed surge multipliers; a stream job computes them from Kafka",
        "Payments consume a trip-completed event asynchronously",
      ],
      model: [
        "Location: every driver app streams its position to a WebSocket gateway, which forwards it to the location service for that driver's region. The location service updates the in-memory geo index (move the driver from the old cell to the new one) and publishes the update to Kafka for history, surge and live tracking.",
        "A ride: the rider gets a quote from the pricing service (base fare from the ETA service's route estimate × the cell's surge multiplier), then requests a trip. The trip service creates the trip in state matching and hands it to dispatch. Dispatch asks the geo index for available drivers near the pickup, gets road-network ETAs for the best ~10 from the ETA service, and offers the trip to the top driver through the gateway. When the driver accepts, the trip service does a conditional write that assigns the driver and moves the trip to accepted; the rider is told, and from now on gets the driver's position pushed.",
        "End of trip: the driver taps complete, the trip service moves the trip to completed and emits trip_completed to Kafka. The payments service consumes it, computes the final fare and charges the card. The surge job also consumes the location and request streams and writes multipliers per cell every minute.",
        "Everything is deployed per region (a set of cities), so a regional failure stays regional.",
      ],
      diagram: {
        nodes: [
          { id: "rider", label: "Rider app", col: 0 },
          { id: "driver", label: "Driver app", col: 0 },
          { id: "api", label: "API gateway", col: 1, sub: "REST" },
          { id: "ws", label: "WebSocket gateway", col: 1, sub: "GPS, offers, updates" },
          { id: "pricing", label: "Pricing service", col: 2 },
          { id: "trip", label: "Trip service", col: 2, sub: "state machine" },
          { id: "dispatch", label: "Dispatch", col: 2, sub: "matching" },
          { id: "location", label: "Location service", col: 2 },
          { id: "surge", label: "Surge table", col: 3, sub: "Redis" },
          { id: "eta", label: "ETA service", col: 3, sub: "road graph + traffic" },
          { id: "tripdb", label: "Trip DB", col: 3, sub: "conditional writes" },
          { id: "geo", label: "Geo index", col: 3, sub: "in memory, by region" },
          { id: "kafka", label: "Event log", col: 3, sub: "Kafka" },
          { id: "surgejob", label: "Surge job", col: 4, sub: "Flink, per cell" },
          { id: "payments", label: "Payments", col: 4, sub: "async, ledger" },
        ],
        edges: [
          { from: "rider", to: "api", label: "REST" },
          { from: "rider", to: "ws" },
          { from: "driver", to: "ws", label: "GPS" },
          { from: "api", to: "pricing", label: "quote" },
          { from: "api", to: "trip", label: "request" },
          { from: "ws", to: "location", label: "GPS" },
          { from: "dispatch", to: "ws", label: "offer" },
          { from: "trip", to: "dispatch" },
          { from: "pricing", to: "surge", label: "multiplier" },
          { from: "pricing", to: "eta" },
          { from: "dispatch", to: "eta", label: "ETAs" },
          { from: "dispatch", to: "geo", label: "nearby" },
          { from: "trip", to: "tripdb", label: "CAS" },
          { from: "location", to: "geo", label: "update" },
          { from: "location", to: "kafka" },
          { from: "trip", to: "kafka", label: "events" },
          { from: "kafka", to: "surgejob" },
          { from: "kafka", to: "payments", label: "completed" },
          { from: "surgejob", to: "surge", label: "write" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "Expect questions on the geospatial index, matching, and how you stop a driver being double-booked. Surge " +
        "and payments are common follow-ups. Compare options and commit. About 15 minutes.",
      points: [
        "Location ingest: in-memory updates partitioned by region, last write wins, lossy is fine",
        "Compares geohash, quadtree and H3; handles cell boundaries by querying neighbouring cells",
        "Matching ranks candidates by road-network ETA, not straight-line distance",
        "Offers go to one driver at a time with a ~15 s timeout, then the next candidate",
        "Trip state machine with conditional writes (or a transaction) so a driver can't be double-booked",
        "Surge as supply vs demand per cell, smoothed in time and space, with the price locked by a quote",
        "Payments charged asynchronously after the trip, idempotent by trip_id",
      ],
      model: [
        "1. Ingesting locations. 250k updates/s arrive over persistent connections. The gateway routes each update by the driver's current region to the location service shard that owns it; the shard updates its in-memory index and appends to Kafka. Nothing waits on a database. Updates carry the phone's timestamp and older ones are dropped, so reordering can't move a driver backwards. A lost update costs nothing because another arrives 4 s later; that's why we can skip durability here. The app can report less often when the driver is parked and offline, and positions are snapped to the road network before being used for ETAs.",
        "2. Geospatial index. The query is \"available drivers within ~2 km of this point\", against data that changes every few seconds.",
        "- Geohash: encode lat/lng into a string where a shared prefix means nearby (6 characters ≈ 1.2 × 0.6 km). Easy to store in any key-value store, and Redis GEO uses it. Two points across a cell edge can have different prefixes, so you query the cell plus its 8 neighbours. Cells are rectangles that distort with latitude, and the fixed grid ignores density.",
        "- Quadtree: split a cell into four when it holds more than N drivers. Adapts to density (central Manhattan vs suburbs), but with every driver moving every 4 s, keeping splits and merges up to date is constant churn and needs locking, and it's awkward to shard.",
        "- H3 (Uber's hexagonal grid): fixed resolutions (resolution 9 ≈ 0.1 km² per hexagon, resolution 7 ≈ 5 km²). Every neighbour of a hexagon is the same distance away, so \"cells within k rings\" approximates a circle well, and the same grid works for surge aggregation.",
        "I'd use H3 at resolution 9: a map from cell to available driver_ids plus driver_id -> cell, in memory, sharded by region. A nearby query takes the pickup's cell, collects drivers from rings 0..k, and widens k until there are enough candidates or we hit a radius limit. Each shard is replicated by having two instances consume the same update stream; a hot city can be split into sub-regions.",
        "3. Matching and dispatch. Straight-line distance is misleading: a driver 300 m away across a river or on the other side of a motorway can be 10 minutes out. So dispatch takes ~10 nearest candidates and asks the ETA service for road-network ETAs (a routing engine over the road graph with live traffic speeds, using precomputation such as contraction hierarchies to answer in milliseconds). It ranks by ETA, with adjustments for heading and drivers about to finish a nearby trip. The trip is offered to one driver at a time: the driver goes to state offered (so no other dispatch picks them), gets ~15 s to accept, and on decline or timeout goes back to available while the next candidate gets the offer. Offering to several drivers at once is faster but creates races and annoys the drivers who lose them. A refinement is batching: collect the requests and free drivers in an area over ~2 s and solve them together as an assignment problem, which lowers the average ETA across everyone at the cost of a short delay.",
        "4. Trip state and double-booking. The trip moves through matching -> accepted -> arrived -> in_progress -> completed, with cancelled reachable before in_progress. Every transition is a conditional write: UPDATE trips SET status = 'accepted', driver_id = ?, version = version + 1 WHERE trip_id = ? AND status = 'matching'. Accepting must also flip the driver: UPDATE drivers SET status = 'on_trip', current_trip_id = ? WHERE driver_id = ? AND status = 'offered' AND current_offer_id = ?. Because trips and drivers are partitioned by city, both updates run in one local transaction; if either condition fails, nothing changes and the caller gets 409. That handles the races: a rider cancelling as the driver accepts, a stale accept after the offer expired, two dispatchers picking the same driver. A distributed lock in Redis with a TTL also works, but a lock can expire while its holder is still working, so you need fencing tokens anyway; the database condition is simpler and is the source of truth.",
        "5. Surge pricing. Every minute, a stream job computes per H3 cell at resolution 7 (~5 km²): demand (requests and fare checks in the last few minutes) against supply (available drivers plus drivers finishing trips nearby). The ratio maps to a multiplier through a capped curve, smoothed over time and with neighbouring cells so prices don't flicker or jump at a cell border. The pricing service reads the multiplier when it creates a quote, and the quote locks the price for ~2 minutes.",
        "6. Payments. Charging a card is slow and can fail, so it's never on the path of ending a trip. At request time we place a pre-authorisation hold for the quoted amount. On completion the trip service writes the completed state and a trip_completed event in the same transaction (outbox pattern), so the event can't be lost. The payments service consumes it, charges with idempotency key = trip_id so retries never double-charge, and records it in the ledger. A failed charge leaves an outstanding balance that must be settled before the next ride. Driver payouts are batched daily or weekly.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction:
        "Bottlenecks, failure modes for a system that has to keep working in the middle of a trip, and what you'd " +
        "monitor. About 4 minutes.",
      points: [
        "Hot cities during events: split the region shard, scale ETA and dispatch for that area",
        "Location shard loss: rebuilt from the next few seconds of updates",
        "Trip DB failover: transitions retried with idempotency, conditional writes keep them safe",
        "Payment provider outage: charges queue and retry; rides continue",
        "In-progress trips survive a backend blip because the apps hold the current trip state",
        "Metrics: request-to-match time, match rate, offer acceptance and timeout rate, ETA accuracy, location age, double-assignments (must be zero)",
      ],
      model: [
        "Bottlenecks: one city at a big event (New Year's Eve, a stadium emptying) concentrates requests, map views and ETA calls on one region shard. Split the region into sub-regions, add read replicas of the geo index for map views, and cache ETAs between nearby cell pairs for estimates. The ETA service is usually the most expensive dependency per request.",
        "Failure modes:",
        "- A location shard dies: its replica takes over; if both are gone, a fresh instance rebuilds the index from the update stream within one or two update intervals. Dispatch in that region is blind for those seconds.",
        "- A gateway dies: its drivers reconnect elsewhere and miss a few updates; any offer in flight times out and goes to the next candidate.",
        "- Trip DB primary fails over: in-flight transitions fail and are retried; the conditional writes make retries safe. Riders see \"finding your driver\" a little longer.",
        "- Payment provider down: trip_completed events wait in Kafka and charges retry later; nobody is stuck in a car.",
        "- A region loses its backend mid-trip: both apps keep the current trip state locally, so the driver can still navigate and end the trip, and the apps sync when they reconnect. Trip state is replicated to another region so cities can be failed over.",
        "Monitoring: request-to-match time p50/p99, match rate (requests that get a driver), offer acceptance and timeout rates, predicted vs actual pickup ETA, age of the latest driver position, cancellation rate, surge multiplier distribution by city, payment failure rate, and a count of drivers assigned to two active trips, which must always be zero.",
      ],
    },
  ],
};

const jobScheduler: DesignInterview = {
  id: "jobScheduler",
  title: "Design a Distributed Job Scheduler",
  prompt:
    "\"Design a job scheduler that other teams use to run work at a given time or on a recurring schedule, across a " +
    "fleet of workers: send a reminder at 9:00 tomorrow, retry a failed webhook in 10 minutes, generate every " +
    "merchant's invoice at midnight on the 1st. Think of it as cron for the whole company.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Clarify what a job is, how precisely it must run on time, what happens if it fails, and the guarantees " +
        "callers expect. Separate deciding when a job is due from running it. About 5 minutes.",
      points: [
        "One-off jobs (run at a time or after a delay) and recurring jobs (cron expression plus time zone)",
        "A job is a handler name plus a payload delivered to the owning team's workers, or a callback",
        "Timing target: starts within a few seconds of the due time at p99",
        "Accepted jobs are never lost; execution is at least once, so handlers must be idempotent",
        "Retries with backoff and a maximum number of attempts, timeouts, cancel and reschedule",
        "Multi-tenant: quotas and fairness so one team can't starve others; status and history per job",
        "Scopes out workflow DAGs with dependencies between jobs (Airflow, Temporal) and data processing",
      ],
      model: [
        "Questions I'd ask: How many jobs a day, and how far ahead are they scheduled? How precise must start times be: seconds, or is a minute fine? How long do jobs run? Do we run the job's code, or notify the owning service that it's due? What should happen when a job fails, or the system was down when it was due? Do teams need exactly-once? Are there dependencies between jobs?",
        "Assume: 50M one-off jobs a day, scheduled from seconds to 30 days ahead; 5M recurring schedules; jobs run from milliseconds to an hour; we deliver each due job to the owning team's worker pool (their code, our queue), or call an HTTP endpoint.",
        "Functional:",
        "- Create a one-off job (run_at or delay) or a recurring job (cron expression and IANA time zone), with a payload, max attempts, timeout and priority.",
        "- Cancel, reschedule, pause and resume; see status and execution history.",
        "- Failed executions retry with backoff, then land in a failed state that alerts the owning team.",
        "Non-functional:",
        "- A job starts within ~2 s of its due time at p99 under normal load, and within a bounded delay during bursts.",
        "- Durable: once the API returns, the job will run, even if machines die.",
        "- At-least-once execution; we promise not to run the same firing twice in normal operation, and give handlers what they need to make duplicates harmless.",
        "- Isolation between tenants and priorities.",
        "Out of scope: dependencies between jobs (that is a workflow engine), and distributed data processing.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Work out executions per second on average and at the worst moments, how many jobs are pending at once, " +
        "storage, and how many worker slots that needs. About 4 minutes.",
      points: [
        "~70M executions/day is ~800/s on average",
        "Bursts at round times: millions of jobs due at 00:00, so plan for ~20k/s for a short time",
        "Pending jobs: ~100M at ~1 KB is ~100 GB, plus history",
        "Little's law: 800/s × 2 s average runtime is ~1,600 jobs running at once; 40k at a burst",
        "Conclusion: finding due jobs cheaply and absorbing bursts matter more than raw throughput",
      ],
      model: [
        "Executions: 50M one-off plus 5M recurring schedules firing ~4 times a day on average ≈ 70M executions a day ≈ 800 per second.",
        "Bursts: people schedule at round times. If 2M invoices and reports are all due at 00:00 UTC, that's 2M jobs in one second against an 800/s average. We can't start 2M jobs in a second and don't need to; the design must stay healthy, drain the burst within a minute or two, and run high-priority jobs first. Say ~20k/s sustained for a few minutes.",
        "Pending jobs: one-offs are scheduled about 2 days ahead on average, so ~100M pending at any time. At ~1 KB of metadata each (large payloads stored separately, capped at e.g. 256 KB) that's ~100 GB. Recurring definitions: 5M × 1 KB = 5 GB.",
        "History: 70M executions × ~300 bytes ≈ 21 GB a day, ~650 GB for 30 days of retention.",
        "Workers: by Little's law, jobs running at once = rate × duration. At 800/s and 2 s average that's ~1,600 concurrent; at 20k/s, ~40k. Worker pools belong to the owning teams, so our part is to queue and pace, not to run 40k slots ourselves.",
        "Conclusion: the store and throughput are moderate. The design questions are how to find what is due without scanning 100M rows, how to survive the midnight burst, and how to avoid running a job twice or never.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "Define the API teams use to create and manage jobs, and the protocol workers use to receive jobs and " +
        "report results. Say how creation retries stay safe. About 4 minutes.",
      points: [
        "POST /jobs with idempotency_key, handler, payload, run_at or cron + timezone, max_attempts, timeout, priority",
        "GET, DELETE (cancel), PATCH (reschedule, pause) and GET executions",
        "Workers receive jobs with a lease (execution id, fencing token, lease expiry)",
        "Heartbeat to extend the lease; complete or fail with the fencing token",
        "Repeated idempotency key returns the original job",
      ],
      model: [
        "- POST /v1/jobs  { idempotency_key, handler: \"billing.invoice\", payload, run_at | delay_s | { cron: \"0 0 1 * *\", timezone: \"Europe/Paris\" }, max_attempts: 5, timeout_s: 600, priority: \"high\" }  ->  201 { job_id, next_run_at }. The same idempotency_key returns the original job.",
        "- GET /v1/jobs/{id}, DELETE /v1/jobs/{id} (cancel), PATCH /v1/jobs/{id}  { run_at | cron | paused }, GET /v1/jobs/{id}/executions.",
        "Worker protocol, either through a queue the team consumes or an HTTP pull API:",
        "- POST /v1/leases  { handler, max: 10, lease_s: 60 }  ->  [{ execution_id, job_id, scheduled_for, attempt, fencing_token, payload }].",
        "- POST /v1/executions/{id}/heartbeat  { fencing_token }  extends the lease while the job runs.",
        "- POST /v1/executions/{id}/complete  { fencing_token, status: succeeded | failed, error?, retryable? }.",
        "Every execution carries (job_id, scheduled_for), which handlers can use as an idempotency key for their own side effects.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Lay out jobs, the index that finds due jobs, and executions with their leases. Say where each lives and " +
        "how it is partitioned. About 5 minutes.",
      points: [
        "Jobs table: schedule, next_run_at, status, retry policy, tenant, version",
        "An index or time-bucketed table on (shard, next_run_at) for due jobs",
        "Executions: (job_id, scheduled_for) unique, attempt, lease_expires_at, worker, fencing token, status",
        "Idempotency keys per tenant; payloads in object storage when large",
        "Sharded relational store (or Cassandra with time buckets), partitioned by job id",
      ],
      model: [
        "jobs: job_id (PK), tenant_id, handler, payload_ref, schedule (one-off run_at, or cron + timezone), next_run_at, status (scheduled, paused, cancelled, completed), max_attempts, timeout_s, priority, version, created_at.",
        "Due index: an index on (shard_id, next_run_at) WHERE status = 'scheduled'. In a key-value store, the same thing as a table keyed by (minute bucket, shard) with rows ordered by run time, so a dispatcher reads one small partition per minute instead of scanning.",
        "executions: execution_id, job_id, scheduled_for, attempt, status (queued, running, succeeded, failed, timed_out), worker_id, lease_expires_at, fencing_token, started_at, finished_at, error. A unique constraint on (job_id, scheduled_for, attempt) means one firing can't create two executions, even if two dispatchers race.",
        "idempotency: (tenant_id, key) -> job_id with a TTL of a few days.",
        "Storage: PostgreSQL sharded by job_id (say 64 logical shards on a handful of machines) handles this volume, gives transactions for \"create execution and advance next_run_at together\", and has FOR UPDATE SKIP LOCKED for claiming rows without blocking other dispatchers. Large payloads go to object storage, referenced by key. History is moved to cheaper storage after a few days.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw the path from creating a job to a worker running it and reporting back, and how a recurring job " +
        "gets its next run. Show what finds jobs whose worker died. About 8 minutes.",
      points: [
        "API writes the job with next_run_at to the sharded store",
        "Dispatchers, each owning some shards through a lease, poll for due jobs a few seconds ahead",
        "Dispatching creates the execution and advances next_run_at in one transaction, then enqueues",
        "Ready queues per priority (and tenant class); workers lease jobs, heartbeat, complete",
        "A reaper re-queues executions whose lease expired",
        "Retries reuse the same path: a failed execution schedules the next attempt with backoff",
      ],
      model: [
        "Create: the API validates the schedule, stores the job with its first next_run_at, and returns. That's all; nothing is in memory yet.",
        "Dispatch: a pool of dispatcher nodes share the 64 shards. Shard ownership is a lease in etcd or ZooKeeper, so each shard has exactly one active dispatcher and a dead one's shards move within seconds. Every second, a dispatcher claims due jobs in its shards (next_run_at <= now + 5 s, oldest first, in batches), holds the ones a few seconds early in an in-memory timer (a timing wheel), and at the due time, in one transaction, inserts the execution row and either advances next_run_at to the next cron time or marks a one-off job completed-pending. The execution is then published to the ready queue for its handler and priority (through an outbox, so the row and the message can't disagree).",
        "Run: the owning team's workers consume their ready queue, get a lease with a fencing token, heartbeat while running, and report success or failure. Failure with attempts left writes a new execution due at now + backoff with jitter, which flows through the same dispatch path; out of attempts, the execution is marked failed and the team is alerted.",
        "Recovery: a reaper scans for running executions whose lease expired (the worker died or hung) and re-queues them with a new fencing token.",
      ],
      diagram: {
        nodes: [
          { id: "clients", label: "Team services", col: 0, sub: "create, cancel" },
          { id: "api", label: "Scheduler API", col: 1, sub: "validate, idempotency" },
          { id: "store", label: "Job store", col: 2, sub: "sharded Postgres" },
          { id: "coord", label: "Coordinator", col: 2, sub: "etcd shard leases" },
          { id: "dispatch", label: "Dispatchers", col: 3, sub: "one per shard" },
          { id: "reaper", label: "Reaper", col: 3, sub: "expired leases" },
          { id: "queues", label: "Ready queues", col: 4, sub: "per priority" },
          { id: "status", label: "Results", col: 4, sub: "heartbeat, complete" },
          { id: "workers", label: "Worker pools", col: 5, sub: "owning teams" },
        ],
        edges: [
          { from: "clients", to: "api" },
          { from: "api", to: "store", label: "write" },
          { from: "store", to: "dispatch", label: "due jobs" },
          { from: "coord", to: "dispatch", label: "owns shards" },
          { from: "store", to: "reaper" },
          { from: "dispatch", to: "queues", label: "enqueue" },
          { from: "reaper", to: "queues", label: "re-queue" },
          { from: "queues", to: "workers", label: "lease" },
          { from: "workers", to: "status", label: "report" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "Interviewers usually push on finding due jobs and the midnight burst, workers that die or stall, double " +
        "dispatch, and recurring schedules. Compare options and commit. About 15 minutes.",
      points: [
        "Due jobs: index or time buckets per shard, claim with SKIP LOCKED, look ahead, timer wheel",
        "Bursts: queue and drain by priority, per-tenant fairness, encourage jitter on round times",
        "Leases with heartbeats; fencing tokens so a stalled worker can't commit after its lease moved",
        "Unique (job_id, scheduled_for) and outbox so a firing isn't lost or doubled by dispatcher failover",
        "Cron in the job's time zone, next run from the scheduled time, DST gaps and repeats defined",
        "Missed-run policy after an outage: run once, catch up all, or skip; overlap policy",
        "Retries with backoff and jitter, timeouts, failed state and alerts",
      ],
      model: [
        "1. Finding due jobs. Scanning a 100M-row table every second doesn't work; reading an index range does. Each dispatcher asks its shards for rows with next_run_at <= now + 5 s, ordered by time, a batch at a time, using SELECT ... FOR UPDATE SKIP LOCKED so a second dispatcher during a handover skips rows already claimed instead of blocking. Jobs due in the next few seconds wait in an in-memory timing wheel, which gives sub-second accuracy without polling constantly. Jobs far in the future cost nothing until their bucket comes up.",
        "2. The midnight burst. When 2M jobs are due at 00:00, dispatching is cheap (an insert and an enqueue each) but the workers can't start them all at once. The ready queues absorb the burst and workers drain it; high priority has its own queue so a password-expiry email isn't behind a million invoices. Per-tenant quotas on concurrency and a weighted fair dequeue stop one team's burst from delaying everyone. We also nudge callers: the API can add jitter to recurring jobs that don't need exact times (\"daily\" means some time in the hour), which flattens the peak more than any amount of hardware.",
        "3. Workers that die or stall. A worker holds a lease (say 60 s) and heartbeats every 20 s. If it crashes, the lease expires and the reaper re-queues the execution, so the job runs again: that's at-least-once. The dangerous case is a worker that isn't dead, just paused (a long GC, a network partition): its lease expires, another worker starts the job, and then the first one wakes up and finishes. Fencing tokens handle it: every lease gets a higher token, completion is a conditional update (WHERE execution_id = ? AND fencing_token = ?), and downstream systems that matter accept writes only with the newest token. Handlers should still be idempotent, keyed by (job_id, scheduled_for).",
        "4. Double dispatch and lost dispatch. If a dispatcher dies after enqueueing but before recording, or two dispatchers overlap during a lease handover, the same firing could be dispatched twice; if it records but dies before enqueueing, it could be lost. So dispatch is one transaction that inserts the execution row (unique on job_id, scheduled_for, attempt), advances next_run_at, and writes an outbox row; a relay publishes the outbox. A duplicate firing fails the unique constraint, and a crash before publishing leaves the outbox row for the relay.",
        "5. Recurring jobs and time. Store the cron expression with an IANA time zone, because \"9:00 every day\" means local time. Compute the next run from the previous scheduled time, not from when the job happened to run, or schedules drift. Daylight saving time needs a rule: a 02:30 run doesn't exist on the spring-forward day and happens twice on the fall-back day, so decide (for example, run at the next valid time, and only once). After an outage, a missed-run policy says whether to run once, run every missed firing, or skip to the next; an overlap policy says what to do if the previous run is still going. Kubernetes CronJobs expose the same choices as startingDeadlineSeconds and concurrencyPolicy (Allow, Forbid, Replace).",
        "6. Failures. A job that exceeds timeout_s is treated as failed and its lease revoked. Failures retry with exponential backoff and jitter up to max_attempts, then the job is marked failed, kept for inspection (a dead letter state) and its owning team alerted. A replay button re-runs a failed execution with a new attempt number.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction:
        "Say what limits the system first, how it behaves when each part fails, and what you would monitor. " +
        "About 4 minutes.",
      points: [
        "First limits: store write load during bursts, and worker capacity owned by other teams",
        "Store failover delays jobs but loses none; dispatcher death moves shard leases in seconds",
        "Queue outage: jobs stay due in the store and dispatch catches up",
        "Clock skew: compare against one clock (the database's), keep NTP healthy",
        "Key SLI: schedule lag (actual start minus scheduled time) p50/p99, by priority",
        "Also: queue age, lease expiries, retries, failed jobs, per-tenant usage",
      ],
      model: [
        "Bottlenecks: each firing is a few writes (execution row, next_run_at, outbox), so the job store's write capacity sets the burst rate; more shards raise it. The other limit is outside our control: teams' worker pools, which is why we queue and pace instead of pushing.",
        "Failure modes:",
        "- A store shard's primary fails over: dispatch for that shard pauses for seconds; jobs run late, none are lost because they are still in the store.",
        "- A dispatcher dies: its shard leases expire and another dispatcher takes over; the unique constraint absorbs any overlap.",
        "- The queue is down: outbox rows accumulate and are published when it returns.",
        "- Clock skew between dispatchers: decide due-ness using the database's clock (or a single time source), and alert on NTP drift.",
        "- A team's handler fails every time: attempts run out, the job goes to failed, and only that team is paged.",
        "Monitoring: schedule lag p50/p99 per priority (the SLI customers feel), ready-queue depth and oldest-message age, dispatch rate, lease expiries and reaper re-queues (a spike means workers are dying), retry and failure rates per handler, jobs in failed state, and per-tenant creation and concurrency against quotas.",
        "If I had more time: dependencies between jobs (a small workflow engine), and an execution-time forecast so capacity for the 1st of the month is added before it arrives.",
      ],
    },
  ],
};

const paymentSystem: DesignInterview = {
  id: "paymentSystem",
  title: "Design a Payment System",
  prompt:
    "\"Design the payment system for an online marketplace. Buyers pay by card at checkout, the marketplace keeps " +
    "a fee, and sellers are paid out weekly. Card processing goes through an external payment service provider " +
    "(PSP) such as Stripe or Adyen.\"",
  stages: [
    {
      id: "requirements",
      name: "Requirements",
      minutes: 5,
      instruction:
        "Clarify the money flows (pay, capture, refund, payout), what the PSP does for us, and the correctness " +
        "guarantees. Say early that correctness beats availability here. About 5 minutes.",
      points: [
        "Pay at checkout (authorize, then capture when shipped, or capture at once), refunds, weekly seller payouts",
        "Never charge twice, never lose a payment: idempotency end to end",
        "Correctness and auditability over raw availability; an immutable record of every money movement",
        "The PSP handles card data; we never store card numbers (keeps us mostly out of PCI DSS scope)",
        "Results arrive asynchronously (3-D Secure, webhooks); status visible to buyers and support",
        "Daily reconciliation against the PSP's reports",
        "Scopes out building a PSP, fraud models, tax and currency conversion details",
      ],
      model: [
        "Questions I'd ask: How many orders a day and what peak? Do we capture at checkout or when the seller ships? Partial refunds? How do sellers get paid and how often? Which countries (Strong Customer Authentication applies in Europe)? Multiple currencies? Do we already have a PSP?",
        "Assume: 5M payments a day, peaks of 10x during sales, card payments through one PSP, authorize at checkout and capture when the order ships, partial refunds, weekly payouts, a 10% marketplace fee.",
        "Functional:",
        "- Authorize a card payment for an order; capture it later (all or part); cancel an uncaptured authorization.",
        "- Full and partial refunds.",
        "- Track each seller's balance and pay it out weekly, minus fees and a reserve.",
        "- Payment status for the buyer, the order service and support.",
        "Non-functional:",
        "- No double charges and no lost payments, even with retries, timeouts and crashes.",
        "- Every movement of money recorded immutably and explainable later (audit, disputes).",
        "- Checkout payment p99 within a few seconds, mostly the PSP's own latency; 99.95% availability for the payment API.",
        "- Card data never touches our servers.",
        "Out of scope: running our own acquiring or card network connections, fraud models (we use the PSP's risk scoring), tax, FX.",
      ],
    },
    {
      id: "estimation",
      name: "Estimation",
      minutes: 4,
      instruction:
        "Size payments per second, ledger growth and webhook traffic, and draw the conclusion about where the " +
        "difficulty is. About 4 minutes.",
      points: [
        "5M payments/day is ~60/s, ~600/s at a sales peak",
        "~5 state changes and ~4 ledger entries per payment: ~20M entries/day, ~4 GB/day",
        "Keep records for years (audit and regulation): ~10 TB, fine for a relational store",
        "Webhooks ~3 per payment, ~175/s",
        "Conclusion: low volume; the problem is correctness, not scale",
      ],
      model: [
        "Payments: 5M a day ≈ 58 per second on average; a 10x sales peak is ~600 per second.",
        "Writes per payment: created, authorized, captured, maybe refunded, each a state change with its event row, plus ledger entries (a capture with a fee is 3 entries, a refund 3 more). Call it ~20M ledger entries a day at ~200 bytes ≈ 4 GB a day, ~1.5 TB a year. Financial records are typically kept for 7 years or more, so ~10 TB over the lifetime, before indexes.",
        "Webhooks: ~3 events per payment (authorized, captured, refunded, disputes) ≈ 15M a day ≈ 175 per second.",
        "Payouts: say 500k sellers paid weekly, a batch job, not a QPS problem.",
        "Conclusion: one well-provisioned relational database (with replicas for reads) handles this for a long time. The design is about idempotency, state machines, an accurate ledger and reconciling with a provider that is slow and sometimes wrong.",
      ],
    },
    {
      id: "api",
      name: "API design",
      minutes: 4,
      instruction:
        "Define the payment API the checkout and order services call, including idempotency semantics, and the " +
        "webhook endpoint. Say how amounts are represented. About 4 minutes.",
      points: [
        "POST /payments with an idempotency key, order id, amount in minor units, currency, PSP payment-method token",
        "Statuses include requires_action (3-D Secure) and processing, not just success or failure",
        "Capture, cancel and refund endpoints, each idempotent",
        "Same key and same body returns the stored response; same key, different body is an error",
        "Signed webhook endpoint for PSP events",
        "Integers in minor units (cents), never floating point",
      ],
      model: [
        "- POST /v1/payments  Idempotency-Key: <uuid>  { order_id, amount: 2599, currency: \"EUR\", payment_method: \"pm_token_from_psp\", capture: \"manual\" }  ->  201 { payment_id, status: \"authorized\" | \"requires_action\" | \"processing\" | \"failed\", next_action? }.",
        "- POST /v1/payments/{id}/capture  { amount? }, POST /v1/payments/{id}/cancel, POST /v1/payments/{id}/refunds  { amount, reason }, each with its own Idempotency-Key.",
        "- GET /v1/payments/{id}  ->  status, amounts captured and refunded, history.",
        "- POST /webhooks/psp: events from the PSP, verified by signature and timestamp.",
        "Idempotency semantics: the first request with a key is processed and its response stored; a retry with the same key and body gets the stored response; the same key with a different body is rejected; a retry while the first is still in progress gets 409 and tries again shortly.",
        "Amounts are integers in the currency's minor unit (2599 means 25.99 EUR). Floating point can't represent most decimal fractions exactly, and rounding errors in money are bugs. Some currencies have zero or three decimal places, so the currency defines the unit.",
        "The card number never reaches us: the browser sends it to the PSP through the PSP's hosted fields or SDK and we receive a token.",
      ],
    },
    {
      id: "data",
      name: "Data model",
      minutes: 5,
      instruction:
        "Model payments and their history, idempotency records, the ledger, seller balances and payouts, and the " +
        "outbox. Explain the ledger's rules. About 5 minutes.",
      points: [
        "payments with status, amounts, psp_reference and a version for conditional updates",
        "Append-only payment events (the state machine's history), never updated",
        "idempotency_keys: key, request hash, stored response, in-progress flag",
        "Double-entry ledger: transactions whose entries sum to zero per currency; immutable",
        "Accounts per seller payable, platform revenue, PSP receivable; balances derived from entries",
        "payouts and an outbox table, all in one relational database with ACID transactions",
      ],
      model: [
        "payments: payment_id (PK), order_id, buyer_id, seller_id, amount, currency, captured_amount, refunded_amount, status, psp_reference, version, created_at, updated_at.",
        "payment_events: (payment_id, seq) -> type, PSP request and response, created_at. Append-only, the audit trail of the state machine.",
        "idempotency_keys: (client_id, key) -> request_hash, status (in_progress, done), response_code, response_body, created_at; kept for at least 24 hours (Stripe keeps keys for 24 hours too).",
        "Ledger: ledger_transactions(txn_id, kind, reference, created_at) and ledger_entries(txn_id, account_id, amount, currency), where amount is signed (debit positive, credit negative, or two columns) and every transaction's entries sum to zero per currency, enforced on write. Entries are never updated or deleted; a mistake is corrected by a new reversing transaction.",
        "accounts: psp_receivable (money the PSP owes us), seller_payable:{seller_id}, platform_revenue, psp_fees, refunds, bank. account_balances is a cache of the sum of entries, updated in the same transaction.",
        "payouts: payout_id, seller_id, amount, period, status, psp_payout_reference. outbox: event_id, type, payload, created_at, published_at.",
        "All of it in one relational database (PostgreSQL or MySQL) with ACID transactions, so a state change, its ledger entries and its outbox event commit together. Partitioning by payment or seller id can come later; at 600 writes a second it isn't needed yet.",
      ],
    },
    {
      id: "hld",
      name: "High-level design",
      minutes: 8,
      instruction:
        "Draw a payment from the buyer's browser through our service and the PSP, the webhook path back, and " +
        "where events, reconciliation and payouts fit. About 8 minutes.",
      points: [
        "Browser tokenizes the card directly with the PSP; checkout calls our payment service with the token",
        "Payment service records intent first, then calls the PSP with its own idempotency key",
        "Result applied in one transaction: state change, ledger entries, outbox row",
        "Webhooks update state through the same state machine; events published from the outbox",
        "Daily reconciliation against PSP settlement reports before payouts",
        "Payout job pays sellers from reconciled balances",
      ],
      model: [
        "Pay: the checkout page loads the PSP's card fields; the card number goes straight to the PSP, which returns a token. Checkout calls POST /v1/payments with the token and an idempotency key created for this checkout attempt.",
        "The payment service stores the idempotency key and a payment row in state created, in one transaction, before calling anyone. Then it calls the PSP's authorize API, passing our payment_id as the PSP's own idempotency key. Depending on the answer it moves the payment to authorized, failed or requires_action (the browser must complete 3-D Secure, and the final result arrives by webhook). The state change, its event row, any ledger entries and an outbox row are written in one transaction.",
        "Webhooks: the PSP posts events (authorization completed after 3-D Secure, capture settled, refund done, dispute opened). The handler verifies the signature, records the event id to drop duplicates, and applies it through the same state machine.",
        "Events: an outbox relay publishes PaymentAuthorized, PaymentCaptured and so on to Kafka; the order service, email and analytics consume them idempotently.",
        "Money: capture writes ledger entries (PSP receivable debited, seller payable and platform revenue credited). A nightly reconciliation job matches our ledger with the PSP's settlement report; the weekly payout job pays each seller's reconciled balance through the PSP's payout API.",
      ],
      diagram: {
        nodes: [
          { id: "browser", label: "Buyer's browser", col: 0, sub: "PSP card fields" },
          { id: "checkout", label: "Checkout service", col: 0 },
          { id: "psp", label: "PSP", col: 1, sub: "Stripe / Adyen" },
          { id: "payments", label: "Payment service", col: 1, sub: "state machine" },
          { id: "webhooks", label: "Webhook handler", col: 2, sub: "signed events" },
          { id: "db", label: "Payments DB", col: 2, sub: "payments, ledger, outbox" },
          { id: "relay", label: "Outbox relay", col: 3, sub: "to Kafka" },
          { id: "recon", label: "Reconciliation", col: 3, sub: "nightly" },
          { id: "consumers", label: "Orders, email", col: 4, sub: "idempotent consumers" },
          { id: "payouts", label: "Payout job", col: 4, sub: "weekly" },
        ],
        edges: [
          { from: "browser", to: "psp", label: "card -> token" },
          { from: "browser", to: "checkout", label: "token" },
          { from: "checkout", to: "payments", label: "pay + key" },
          { from: "payments", to: "psp", label: "authorize" },
          { from: "psp", to: "webhooks", label: "events" },
          { from: "payments", to: "db", label: "one txn" },
          { from: "webhooks", to: "db", label: "apply" },
          { from: "db", to: "relay" },
          { from: "db", to: "recon", label: "ledger" },
          { from: "relay", to: "consumers" },
          { from: "recon", to: "payouts", label: "verified" },
        ],
      },
    },
    {
      id: "deep",
      name: "Deep dives",
      minutes: 15,
      instruction:
        "Interviewers usually push on duplicate requests, timeouts with an unknown result, the ledger, and " +
        "reconciliation. Be ready for refunds, chargebacks and security. About 15 minutes.",
      points: [
        "Idempotency inbound (client key, stored response, in-progress lock) and outbound (our id as the PSP's key)",
        "A timeout is an unknown outcome: never mark it failed or retry with a new key; query or retry the same key",
        "Forward-only state machine with conditional updates; out-of-order webhooks handled",
        "Double-entry ledger, immutable, reversals instead of edits; integer minor units",
        "Outbox for events; exactly-once effects from at-least-once delivery",
        "Reconciliation against settlement reports, with mismatch categories and a human queue",
        "Refunds, chargebacks, payout reserves; PCI scope, webhook signatures, 3-D Secure",
      ],
      model: [
        "1. Idempotency end to end. The client creates the key once per checkout attempt and reuses it on every retry. The service inserts (client, key) with status in_progress under a unique constraint before doing anything: a concurrent duplicate fails the insert and gets 409; a later retry finds status done and gets the stored response, so the buyer is charged once however often the button or the network repeats the request. Outbound, we send our payment_id (or an attempt id) as the PSP's idempotency key, so our own retries to the PSP can't create a second charge either.",
        "2. Unknown outcomes. The PSP call times out. The charge may or may not have happened. Marking the payment failed is wrong (the buyer may have been charged and gets no order), and retrying with a new key is how double charges happen. Instead the payment goes to an unknown state; we retry with the same idempotency key (safe by design), or look the charge up by our reference, and the webhook settles it if all else fails. A sweeper resolves payments stuck in unknown or processing beyond a few minutes. The buyer sees \"processing\" rather than an error.",
        "3. The state machine. created -> requires_action -> authorized -> captured -> partially_refunded / refunded, with failed and canceled as exits. Every transition is a conditional update (UPDATE ... WHERE payment_id = ? AND status = 'authorized' AND version = ?), so the API response and a webhook racing to apply the same result can't both apply it, and states only move forward: a late \"authorized\" event after \"captured\" is recorded and ignored.",
        "4. The ledger. Double-entry bookkeeping: every movement is a transaction of entries that sum to zero. Capturing 100.00 with a 10% fee: debit psp_receivable 100.00, credit seller_payable 90.00, credit platform_revenue 10.00. The PSP's processing fee: debit psp_fees, credit psp_receivable. A refund is new reversing entries, never an edit. Balances are sums of entries, so any balance can be explained line by line, an unbalanced transaction is rejected on write, and \"the sum of all accounts is zero\" is an invariant we can check continuously. This is how real financial systems find their own bugs.",
        "5. Exactly-once effects. Delivery is at least once everywhere: PSP webhooks repeat (Stripe retries an undelivered event for up to 3 days), Kafka redelivers, clients retry. Effects are made exactly once by idempotency: the state change, ledger entries and outbox row commit in one transaction keyed by the payment and event ids, and consumers record event ids they have processed. Never charge and then save as two steps.",
        "6. Reconciliation. Every night, import the PSP's settlement report (every charge, refund, fee and payout it processed) and match it line by line with our ledger. Mismatches fall into known buckets: in the PSP but not in our ledger (a lost webhook: import it), in ours but not theirs (a capture we think happened: investigate), amount differences (fees, currency rounding). Known buckets are fixed automatically with correcting entries; the rest go to a finance operations queue. Seller payouts only include reconciled periods.",
        "7. Refunds, disputes and payouts. A refund is a new PSP call with its own idempotency key and its own ledger reversal; partial refunds are capped at the captured amount minus refunds so far, checked in the same conditional update. Chargebacks arrive by webhook weeks later and debit the seller's payable, which can go negative, so payouts keep a reserve. The payout job is idempotent per (seller, period) and writes ledger entries when the PSP confirms.",
        "8. Security. Card data goes from the browser to the PSP, never through our servers, which keeps most of our systems out of PCI DSS scope. Webhooks are verified by signature and timestamp to stop forgeries and replays. 3-D Secure handles Strong Customer Authentication (required under PSD2 in Europe). Payment data is encrypted at rest, access is audited, and only the payment service can write the ledger.",
      ],
    },
    {
      id: "wrapup",
      name: "Wrap-up",
      minutes: 4,
      instruction:
        "Name the first limits, what happens when the PSP, the database or the webhook path fails, and the " +
        "metrics that would wake someone. About 4 minutes.",
      points: [
        "Limits: PSP latency and rate limits; one database primary; hot balance rows",
        "PSP outage: circuit breaker and a clear error at checkout; no silent queuing of charges",
        "Database failover: requests fail and are retried safely with the same keys",
        "Webhook handler down: the PSP keeps retrying; reconciliation catches anything missed",
        "Metrics: authorization success rate, latency, payments stuck in unknown, webhook lag",
        "Must-be-zero alarms: ledger imbalance, unreconciled amounts, duplicate charges",
      ],
      model: [
        "Bottlenecks: the PSP's latency and rate limits set checkout speed. Our database primary handles writes for a long time; the first real hot spot is single rows such as the platform revenue balance updated by every capture, fixed by splitting it into sub-accounts or updating cached balances asynchronously from the entries.",
        "Failure modes:",
        "- The PSP is down or slow: a circuit breaker fails fast and checkout says \"try again\" instead of hanging. Silently queueing an authorization for later is usually wrong (the buyer has left), though captures and refunds can be queued and retried. Some companies keep a second PSP for failover.",
        "- The database fails over: in-flight requests error, clients retry with the same idempotency keys, nothing is charged twice.",
        "- The webhook endpoint is down: the PSP retries; the sweeper queries pending payments; reconciliation catches anything still missing.",
        "- A bug writes wrong entries: the zero-sum check fails or reconciliation flags it; fix with reversing entries, never by editing history.",
        "Monitoring: authorization success rate by card brand, country and issuer (a drop often means a PSP or issuer problem, not ours), checkout payment p50/p99, payments in unknown or processing for more than 5 minutes, webhook delivery lag, refund and chargeback rates, payout failures, and three numbers that must stay at zero: ledger imbalance, unexplained reconciliation differences, and duplicate charges.",
        "If I had more time: multi-currency with FX, a second PSP with smart routing, and fraud rules before authorization.",
      ],
    },
  ],
};

// An API design round rather than a whole-system round: the stages follow the API design
// track (resources, endpoints, pagination, idempotent writes, evolution, auth and limits).
const apiPhotoSharing: DesignInterview = {
  id: "apiPhotoSharing",
  title: "Design the API for a Photo-Sharing App",
  prompt:
    "\"Design the public API for an Instagram-like photo-sharing app. Our own iOS, Android and web apps will use it, and " +
    "we want to open it to third-party developers later. Users upload photos with captions, follow each other, scroll a " +
    "home feed, like and comment.\"",
  reviewTip:
    "Look at the stages with the fewest ticks and reread the matching lesson in the API design track. Most candidates lose " +
    "points on pagination (offset for an infinite feed), on retries (a POST that double-posts), and on never mentioning how " +
    "the API will change next year.",
  stages: [
    {
      id: "requirements",
      name: "Clients and requirements",
      minutes: 5,
      instruction:
        "Ask who calls the API and what they need before naming any endpoint. Which clients, which features are in scope, " +
        "what scale, and what the clients' networks are like. About 5 minutes.",
      points: [
        "Names the clients: first-party mobile and web apps now, third-party developers later",
        "Lists core features: upload a photo with a caption, view a photo, follow, home feed, like, comment",
        "Notes mobile clients on flaky networks retry, so writes must tolerate repeats",
        "States the API is public and long-lived, so compatibility matters from day one",
        "Asks about scale and read/write mix (reads dominate: feed and photo views)",
        "Scopes out direct messages, stories, search and ads explicitly",
      ],
      model: [
        "Questions: Is this API for our own apps only, or for third parties too? Which features in v1? How large are uploads (photos only, or video)? Roughly how many users? Do we need real-time updates in the feed?",
        "Assume: our own apps first, a third-party program within a year; photos up to 20 MB; 100 million daily users; feed reads outnumber uploads by roughly 100 to 1; no real-time requirement beyond \"new posts appear on refresh\".",
        "What that means for the API:",
        "- Mobile clients on bad networks: requests time out and get retried, so every write must be safe to repeat.",
        "- Phones pay heavily for round trips: the feed must come back in one call with what a feed card needs.",
        "- Third parties are coming, so it must be a stable, documented REST API with versioning, OAuth and per-app rate limits. Internally the services can talk gRPC; that's not the public contract.",
        "Out of scope: direct messages, stories, search, ads. I'll mention where they'd attach.",
      ],
    },
    {
      id: "resources",
      name: "Resources",
      minutes: 5,
      instruction:
        "Name the nouns of the API and how they relate before writing endpoints: what each resource is, its id, who owns it, " +
        "and which relationships deserve their own resource. About 5 minutes.",
      points: [
        "Users, photos (posts), comments, likes, follows, feed, uploads",
        "Opaque string ids (ph_..., usr_...), never sequential integers exposed",
        "Models likes and follows as resources (or sub-resources) so they can be created and deleted idempotently",
        "Treats the feed as a read-only, per-user computed collection, not a stored resource clients edit",
        "Separates the upload (binary bytes) from the photo (metadata)",
        "Keeps nesting to one level: /photos/{id}/comments, not deeper",
      ],
      model: [
        "- User: id, username, display_name, avatar_url, bio, follower_count, following_count.",
        "- Photo: id, owner (a small user summary), caption, image URLs per size, width, height, like_count, comment_count, viewer_has_liked, created_at, visibility.",
        "- Comment: id, photo_id, author summary, text, created_at. Nested under its photo for listing and creating, addressable on its own for deleting.",
        "- Like: the pair (photo, user). Modelled as a sub-resource, /photos/{id}/likes/me, so liking is a PUT and unliking a DELETE, both idempotent.",
        "- Follow: the pair (follower, followee), the same way: /users/me/following/{user_id}.",
        "- Feed: /me/feed, a computed, read-only list of photos for the signed-in user.",
        "- Upload: a temporary resource for the bytes of an image, separate from the photo so large binaries never pass through the API servers.",
        "Ids are opaque strings with a type prefix (ph_8sK2..., usr_...). Clients must treat them as strings, which lets us change id generation later, and sequential integers would let anyone count our users and walk every photo.",
      ],
    },
    {
      id: "endpoints",
      name: "Endpoints",
      minutes: 8,
      instruction:
        "Write the endpoints in a consistent notation: method and path, key request fields, the response, and the status " +
        "codes that matter. Show one full response body for the most important call. About 8 minutes.",
      points: [
        "Uses nouns in paths and HTTP methods for actions, under a version prefix (/v1)",
        "Create photo returns 201 with Location and the created photo",
        "Likes and follows use PUT and DELETE so they are naturally idempotent",
        "Uses PATCH for editing a caption, DELETE for removing a photo (204)",
        "Names key error codes: 400/422 validation, 401, 403, 404 for private or missing, 409, 429",
        "Shows a response body with exactly what a feed card needs (embedded owner summary, counts, viewer_has_liked)",
      ],
      model: [
        "- POST /v1/uploads  { content_type, size_bytes }  ->  201 { upload_id, upload_url, expires_at }",
        "- POST /v1/photos  { upload_id, caption, visibility }  ->  201, Location: /v1/photos/ph_8sK2, body: the photo. 422 if the upload is missing or not an image.",
        "- GET /v1/photos/{id}  ->  200 photo. 404 if it doesn't exist or the caller may not see it.",
        "- PATCH /v1/photos/{id}  { caption }  ->  200. DELETE /v1/photos/{id}  ->  204. 404 for photos the caller doesn't own (not 403, so ids of private photos don't leak).",
        "- GET /v1/me/feed?limit=20&cursor=...  ->  200 { data: [photo...], next_cursor }",
        "- GET /v1/users/{id}/photos?cursor=...  and  GET /v1/photos/{id}/comments?cursor=...",
        "- POST /v1/photos/{id}/comments  { text }  ->  201 (with an Idempotency-Key header). DELETE /v1/comments/{id}  ->  204.",
        "- PUT /v1/photos/{id}/likes/me  ->  204;  DELETE /v1/photos/{id}/likes/me  ->  204. Repeating either is harmless.",
        "- PUT /v1/users/me/following/{user_id}  ->  204;  DELETE the same  ->  204.",
        "A feed card in one response, so the phone makes one call per page:",
        "```",
        "{",
        "  \"id\": \"ph_8sK2\",",
        "  \"owner\": { \"id\": \"usr_41\", \"username\": \"ana\", \"avatar_url\": \"...\" },",
        "  \"caption\": \"Sunset at the pier\",",
        "  \"images\": { \"thumb\": \"...\", \"medium\": \"...\", \"full\": \"...\" },",
        "  \"like_count\": 41, \"comment_count\": 3, \"viewer_has_liked\": false,",
        "  \"created_at\": \"2026-10-01T09:14:03Z\"",
        "}",
        "```",
      ],
    },
    {
      id: "reads",
      name: "Feed and pagination",
      minutes: 6,
      instruction:
        "Deal with the hard reads: how the feed and other lists are paged, what the client sends and gets back, and what " +
        "happens when new posts arrive while someone scrolls. About 6 minutes.",
      points: [
        "Chooses cursor pagination for the feed and every scrolling list, and explains offset drift (duplicates and skips)",
        "Cursor is opaque (base64 of sort key plus id), with a server-side cap on page size",
        "Sorts by a unique key or adds the id as a tie-breaker",
        "Handles new posts at the top: a separate \"newer than\" request or a refresh, not shifting pages",
        "Mentions response size control: image URLs per size, optional fields, no overfetching",
        "Mentions caching: ETag or Cache-Control on photos and images served from a CDN",
      ],
      model: [
        "Every list uses cursor pagination: GET /v1/me/feed?limit=20 returns { data, next_cursor }; the client passes next_cursor back for the next page and stops when it's null. limit defaults to 20 and is capped at 50 on the server.",
        "Why not offset: the feed changes constantly. With ?offset=20, three new posts arriving while you read page 1 push three posts you've already seen onto page 2, and a deleted post makes you skip one. Offset also gets slower with depth, because the database discards every skipped row.",
        "The cursor is base64 of the last item's position, for example the (ranking_score, photo_id) pair or (created_at, photo_id) for a chronological feed. The id breaks ties so posts with the same timestamp are never skipped. It's opaque and documented as such, so we can change ranking or storage without breaking clients.",
        "New posts: the top of the feed is fetched again on pull-to-refresh, or with GET /v1/me/feed?newer_than=<cursor of the first item>, which the app uses to show \"5 new posts\". Pages already loaded never shift.",
        "Response size: each card embeds only a user summary and image URLs for several sizes, so the phone downloads the thumb on a slow network. Images themselves come from a CDN, not the API. Individual photos get an ETag so a client can revalidate with If-None-Match and get 304.",
        "If clients' needs diverge a lot later (web wants different fields than iOS), add field selection (?fields=) or a GraphQL layer for our own apps; the public REST API stays as it is.",
      ],
    },
    {
      id: "writes",
      name: "Uploads and safe writes",
      minutes: 8,
      instruction:
        "Deal with the hard writes: getting a 20 MB photo from a phone to storage, and making every write safe when the " +
        "client retries after a timeout. About 8 minutes.",
      points: [
        "Uploads go directly to object storage with a pre-signed URL; the API never streams the bytes",
        "Supports resumable or chunked uploads for large files on flaky networks",
        "Photo creation is async-aware: a processing status, with thumbnails generated in the background",
        "Idempotency-Key header on POSTs (create photo, comment), stored with the result, scoped per user, with a TTL",
        "Likes and follows idempotent by design (PUT/DELETE on the relationship), counts updated asynchronously",
        "Explains what happens on a retry after a lost response: the same photo id comes back, not a duplicate post",
      ],
      model: [
        "Upload in two steps. POST /v1/uploads starts a multipart upload in object storage (S3 multipart, or a GCS resumable session) and returns pre-signed URLs: short-lived URLs with the permission baked into their signature, one per part. The phone PUTs the parts straight there, so 20 MB uploads never tie up API servers, and after losing signal it re-sends only the parts that failed. Then POST /v1/photos with the upload_id attaches the metadata.",
        "Processing: thumbnails and sizes are generated asynchronously after the photo is created. The photo comes back with status \"processing\" and images filled in as they're ready; the app shows the local copy meanwhile. Clients that care can poll GET /v1/photos/{id} or receive a push notification.",
        "Retries: a phone that sends POST /v1/photos and loses the response will retry. Without protection that posts the photo twice. Every POST takes an Idempotency-Key header, a UUID the app generates when the user taps Share and keeps across retries. The server inserts (user_id, key) into a table with a unique constraint before doing the work, saves the response with it, and answers repeats with the same 201 and the same photo id. A repeat while the first is still running gets 409; a reused key with a different body gets 422. Keys expire after 24 hours.",
        "Likes and follows don't need keys: PUT /photos/{id}/likes/me is idempotent by definition. The like is stored as a row keyed by (photo_id, user_id), and like_count is updated asynchronously from those rows, so a double tap never counts twice.",
        "Comments use idempotency keys like photos. Editing a caption with PATCH can take If-Match with the photo's ETag so two devices don't silently overwrite each other (412 if stale).",
      ],
    },
    {
      id: "evolution",
      name: "Errors and evolution",
      minutes: 5,
      instruction:
        "Say what an error looks like, and how the API will change over the next few years without breaking apps that " +
        "users never update. About 5 minutes.",
      points: [
        "One error format everywhere, such as RFC 9457 Problem Details, with a stable code, a message and a request id",
        "Version in the path (/v1) or a dated header, with a stated policy for what counts as breaking",
        "Additive changes only within a version; clients must ignore unknown fields and enum values",
        "Deprecation process: Deprecation and Sunset headers, notice, usage tracking per app",
        "Old mobile app versions considered (minimum supported version, forced upgrade as a last resort)",
      ],
      model: [
        "Errors: application/problem+json on every endpoint, with type, title, status, detail, a stable code (caption_too_long, upload_not_found), the offending field for validation errors, and a request_id. Clients branch on code, never on the message text; nothing internal (SQL, stack traces) ever appears.",
        "Versioning: /v1 in the path. Within v1 we only make additive changes: new endpoints, new optional parameters, new response fields. The docs say clients must ignore unknown fields and treat unknown enum values as \"other\", and our own SDKs do. Renames, removals, type changes and new required fields wait for v2.",
        "When v2 comes, v1 keeps running. Responses from v1 carry Deprecation and Sunset headers, third-party developers get notice (months, not weeks), and we track v1 calls per app so we know who to contact. Our own old app versions are the hardest clients: we keep a minimum supported app version, and force an upgrade only as a last resort.",
      ],
    },
    {
      id: "auth",
      name: "Auth and rate limits",
      minutes: 5,
      instruction:
        "Cover how callers authenticate, what third-party apps are allowed to do, and how usage is limited. Stay at the " +
        "level of the API; the internals are another round. About 5 minutes.",
      points: [
        "OAuth 2.0 with authorization code + PKCE for apps acting for users; short-lived access tokens and refresh tokens",
        "Scopes designed around user-understandable permissions (photos:read, photos:write, comments:write, follows:write)",
        "Object-level authorization on every request (private photos, owner-only edits) and 404 for hidden objects",
        "Rate limits per app and per user, stricter on writes, with RateLimit headers and 429 plus Retry-After",
        "API gateway handles token validation, limits and quotas; services handle ownership checks",
        "Mentions abuse: limits on follows and comments per hour, spam detection hooks",
      ],
      model: [
        "Authentication: OAuth 2.0. Our own apps and third-party apps both use the authorization code flow with PKCE; access tokens live 1 hour, refresh tokens rotate. Server-side partner integrations get client credentials. No API keys in mobile apps.",
        "Scopes: photos:read, photos:write, comments:write, follows:write, profile:read. A print-shop app asks for photos:read only; a token without photos:write gets 403 insufficient_scope on POST /photos.",
        "Per-object checks in the services: only the owner may edit or delete a photo, private photos are visible only to approved followers, and anything the caller may not see is a 404.",
        "Rate limits at the API gateway, keyed by (app, user): for example 600 reads a minute and 60 writes a minute per user, plus an app-wide quota for third parties by plan. Every response carries RateLimit-Limit, -Remaining and -Reset; over the limit is 429 with Retry-After. Stricter limits on follows and comments per hour, because those are what spam bots abuse.",
        "If I had more time: webhooks for third parties (new follower, photo processed) signed with an HMAC, and a GraphQL layer for our own apps if their screens diverge.",
      ],
    },
  ],
};

const SYSTEM_DESIGN_INTERVIEWS: Record<SystemDesignId, DesignInterview> = {
  urlShortener,
  newsFeed,
  chat,
  rateLimiter,
  keyValueStore,
  webCrawler,
  notificationSystem,
  videoStreaming,
  rideSharing,
  jobScheduler,
  paymentSystem,
  apiPhotoSharing,
};

export const DESIGN_INTERVIEWS: Record<DesignId, DesignInterview> = {
  ...SYSTEM_DESIGN_INTERVIEWS,
  ...OOD_INTERVIEWS,
};
