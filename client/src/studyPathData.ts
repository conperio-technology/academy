// The "Well-rounded IT & CS" study path: a second plan next to the FAANG interview plan in
// prepPlanData.ts, for people who want broad, practical computing knowledge rather than
// interview drilling. It is built from topic families. Each family is an ordered list of
// lesson ids; the plan turns every lesson that exists on the server into one task, so adding a
// lesson to a family is all it takes to add it to the plan and the readiness view. Ids the
// server doesn't know are skipped, and a family with no existing lessons is hidden, so families
// can be listed before their content lands (Windows & PowerShell, for example).

export interface PathFamily {
  id: string;
  label: string;
  blurb: string;
  lessons: string[];
}

export const IT_CS_FAMILIES: PathFamily[] = [
  {
    id: "start",
    label: "Start Here",
    blurb: "The math, data types and call stack the rest assumes.",
    lessons: ["math-for-cs", "data-types", "functions-call-stack"],
  },
  {
    id: "fundamentals",
    label: "Computer fundamentals",
    blurb: "Hardware, logic gates, number systems and how text and numbers are stored.",
    lessons: [
      "computer-architecture",
      "logic-gates",
      "number-bases-bits",
      "floating-point-representation",
      "endianness",
      "text-encoding",
    ],
  },
  {
    id: "programming",
    label: "Programming in C# and Python",
    blurb: "From variables to classes, then the everyday intermediate tools, with graded exercises along the way.",
    lessons: [
      "lang-start-here",
      "lang-variables-types",
      "basics-celsius-to-fahrenheit",
      "lang-strings",
      "basics-count-vowels",
      "lang-conditionals",
      "basics-letter-grade",
      "lang-loops",
      "basics-fizzbuzz",
      "lang-functions",
      "basics-greeting",
      "lang-collections",
      "basics-word-frequency",
      "lang-exceptions",
      "basics-sum-valid-numbers",
      "lang-classes",
      "basics-rectangle-class",
      "lang-lambdas",
      "lang-linq",
      "lang-interfaces",
      "lang-files-formatting",
      "inter-parse-settings",
      "lang-async",
      "lang-testing",
      "lang-modules",
    ],
  },
  {
    id: "algorithms",
    label: "Algorithms basics",
    blurb: "What an algorithm is, Big O, and a first taste of the core data structures.",
    lessons: [
      "algorithm-intro",
      "big-o-notation",
      "array-traversal-sum",
      "hashmap-two-sum",
      "hash-table-internals",
      "binary-search-array",
      "sorting-insertion-sort",
      "graph-bfs-traversal",
    ],
  },
  {
    id: "os",
    label: "Operating systems and how code runs",
    blurb: "Scheduling, system calls, processes and threads, memory, and what happens when you run a program.",
    lessons: [
      "cpu-scheduling",
      "kernel-mode-syscalls",
      "running-a-program",
      "compiled-vs-interpreted",
      "linkers-libraries",
      "threads-processes",
      "race-conditions",
      "stack-heap-gc",
      "memory-hierarchy",
    ],
  },
  {
    id: "linux",
    label: "Linux and the command line",
    blurb: "A real Linux shell in the browser: files, permissions, pipes and processes, then scripting, text processing and day-to-day administration.",
    lessons: [
      "linux-files",
      "linux-permissions",
      "linux-pipes",
      "linux-processes",
      "linux-scripting-basics",
      "linux-scripting-robust",
      "linux-text-processing",
      "linux-packages",
      "linux-systemd",
      "linux-cron",
      "linux-ssh",
      "linux-disks-logs",
    ],
  },
  {
    id: "windows",
    label: "Windows and PowerShell",
    blurb: "Administering Windows machines and automating them with PowerShell.",
    lessons: [
      "win-processes-services",
      "win-event-logs",
      "win-ntfs-permissions",
      "ps-objects-pipeline",
      "ps-cmdlets-help",
      "ps-scripting-remoting",
      "ad-domains-ous",
      "ad-gpo-kerberos",
      "bash-vs-powershell",
    ],
  },
  {
    id: "networking",
    label: "Networking",
    blurb: "From how the internet fits together to subnetting, routing, VLANs, firewalls, VPNs and troubleshooting.",
    lessons: [
      "how-the-internet-works",
      "network-layers",
      "ip-subnetting",
      "net-subnetting-practice",
      "net-arp-switching",
      "net-vlans",
      "net-dhcp",
      "net-wifi-basics",
      "net-routing-gateways",
      "net-nat-port-forwarding",
      "tcp-vs-udp",
      "dns-and-http",
      "net-firewalls-ports",
      "net-vpns",
      "net-troubleshooting",
    ],
  },
  {
    id: "security",
    label: "Security",
    blurb: "Identity, passwords and phishing first, then web attacks, secure design, incident response and the plant floor.",
    lessons: [
      "security-authn-authz",
      "sec-passwords-mfa",
      "sec-phishing-social-engineering",
      "security-hashing-encryption",
      "security-tls-certificates",
      "sec-secrets-least-privilege",
      "sec-owasp-top-10",
      "security-sql-injection",
      "security-xss",
      "sec-access-control-ssrf-csrf",
      "sec-deserialization-misconfig",
      "sec-threat-modeling-stride",
      "sec-incident-response-logging",
      "sec-ot-ics-security",
    ],
  },
  {
    id: "industrial",
    label: "Industrial systems",
    blurb: "PLCs and industrial networks: Conperio's own world.",
    lessons: ["plc-overview", "industrial-networking"],
  },
  {
    id: "databases",
    label: "Databases and SQL",
    blurb: "Querying, joining, aggregating, designing schemas, indexes and transactions.",
    lessons: ["sql-basics", "sql-joins", "sql-aggregation", "sql-schema-design", "sql-indexes", "sql-transactions"],
  },
  {
    id: "professional",
    label: "Git and professional skills",
    blurb: "Version control, testing, and structuring code so it stays easy to change.",
    lessons: ["git-basics", "git-branching", "git-team-workflows", "test-pyramid", "test-doubles", "tdd-coverage", "ai-assisted-engineering", "oop-basics", "solid-principles"],
  },
  {
    id: "cloud",
    label: "Cloud and DevOps",
    blurb: "Containers, deployment pipelines and running services in the cloud.",
    lessons: [
      "cloud-basics",
      "linux-containers",
      "cloud-container-images",
      "cloud-kubernetes",
      "cloud-cicd",
      "cloud-iac",
      "cloud-observability",
    ],
  },
  {
    id: "system-design",
    label: "System design basics",
    blurb: "How bigger systems are put together: load balancers, caches, replication, queues and consistency, and how to design the APIs between them.",
    lessons: [
      "sd-capacity-estimation",
      "sd-load-balancing",
      "sd-caching",
      "sd-replication-sharding",
      "sd-message-queues",
      "sd-rate-limiting",
      "sd-cap",
      "sd-cdn",
      "sd-resilience",
      "sd-observability",
      "sd-api-rest-http",
      "sd-api-styles",
      "sd-api-pagination",
      "sd-api-idempotency",
      "sd-api-evolution",
      "sd-api-auth-limits",
    ],
  },
  {
    id: "ai",
    label: "AI and machine learning",
    blurb: "How the AI tools you use work, and how to use them well and safely.",
    lessons: [
      "ai-ml-basics",
      "ai-neural-networks",
      "ai-tokens-embeddings",
      "ai-transformers-attention",
      "ai-llm-training",
      "ai-using-llms",
      "ai-risks-limits",
    ],
  },
];

// Recurring practice that has no lesson of its own. Ticked by hand, placed after the named
// family's lessons in its phase.
export interface PathActivity {
  key: string;
  lessonId: string;
  label: string;
  minutes: number;
  after: string; // family id
}

export const IT_CS_ACTIVITIES: PathActivity[] = [
  { key: "it-subnet-drill-1", lessonId: "net-subnetting-practice", label: "Subnetting practice: 20 questions on Normal", minutes: 20, after: "networking" },
  { key: "it-subnet-drill-2", lessonId: "net-subnetting-practice", label: "Subnetting practice: 20 questions on Hard", minutes: 25, after: "networking" },
  { key: "it-troubleshoot-2", lessonId: "net-troubleshooting", label: "Troubleshooting: solve all six tickets again, fewest tools", minutes: 20, after: "security" },
  { key: "it-cards-1", lessonId: "glossary-flash-cards", label: "Glossary flash cards: clear today's due cards", minutes: 10, after: "fundamentals" },
  { key: "it-cards-2", lessonId: "glossary-flash-cards", label: "Glossary flash cards: clear today's due cards", minutes: 10, after: "linux" },
  { key: "it-cards-3", lessonId: "glossary-flash-cards", label: "Glossary flash cards: clear today's due cards", minutes: 10, after: "security" },
  { key: "it-cards-4", lessonId: "glossary-flash-cards", label: "Glossary flash cards: clear today's due cards", minutes: 10, after: "ai" },
];

export interface PathPhase {
  name: string;
  share: number; // of the weeks
  families: string[];
}

export const IT_CS_PHASES: PathPhase[] = [
  { name: "How computers work", share: 0.12, families: ["start", "fundamentals"] },
  { name: "Programming", share: 0.22, families: ["programming", "algorithms"] },
  { name: "Operating systems, Linux and Windows", share: 0.16, families: ["os", "linux", "windows"] },
  { name: "Networks and security", share: 0.26, families: ["networking", "security", "industrial"] },
  { name: "Data, tools and systems", share: 0.24, families: ["databases", "professional", "cloud", "system-design", "ai"] },
];

export const IT_CS_WEEK_OPTIONS = [8, 12, 16, 24];

// Rough time per lesson: graded exercises are short, explainer tools take longer.
export const IT_CS_MINUTES = { tool: 35, practice: 25 };

export type StudyPathId = "faang" | "it-cs";

export const STUDY_PATHS: { id: StudyPathId; label: string; blurb: string }[] = [
  { id: "faang", label: "FAANG interview prep", blurb: "Coding, system design, object-oriented design and behavioral rounds, in 6 to 12 weeks." },
  {
    id: "it-cs",
    label: "Well-rounded IT & CS",
    blurb: "Broad, practical computing: hardware, programming, operating systems, networks, security, Linux, databases, tools, systems and AI.",
  },
];
