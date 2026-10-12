// Plain-language purpose for each top-level section, shown on the dashboard. Keyed by the
// section name in the exported content; an unlisted section just renders without a blurb.
export const SECTION_INFO: Record<string, { blurb: string; why: string }> = {
  "Start Here": {
    blurb: "Foundations for anyone without a computer science background: a week-by-week Well-rounded IT & CS study path through the whole academy, the math behind Big O, data types and overflow, and what functions, the call stack and recursion do in memory.",
    why: "The other sections assume these ideas. Half an hour here makes the jargon in the rest of the academy far easier to follow.",
  },
  "Computer Fundamentals": {
    blurb: "How a computer actually works: logic gates, number systems, floating point, memory, and the OS.",
    why: "Everything else sits on top of this. Knowing why 0.1 + 0.2 isn't 0.3, or what a byte order is, saves hours of confusion later.",
  },
  "Programming in C# & Python": {
    blurb: "Learn to program in C# and Python side by side, from variables, loops, functions and classes to lambdas, LINQ and comprehensions, generics, iterators, records, files, async and unit tests, then advanced topics like Span<T>, threads and the GIL, decorators, pattern matching, result types and profiling, with predict-the-output questions, graded exercises in either language, and printable cheat sheets.",
    why: "Every other coding lesson here assumes you can read and write basic code. Seeing both languages at once teaches each idea once, and the cheat sheets stay useful long after, right up to interview day.",
  },
  "Interview Prep": {
    blurb: "A week-by-week plan through the coding, system design, object-oriented design and behavioral material, and a readiness view that shows where you're weakest. The same tool holds the Well-rounded IT & CS path for broader, non-interview study.",
    why: "Preparing for big-tech interviews is mostly about covering the right things in the right order and practising your weak spots, not doing everything.",
  },
  "Concurrency & Memory": {
    blurb: "What runs your code and where its data lives: threads and the scheduler, race conditions, locks, deadlock, producer-consumer, async/await, the stack and heap, garbage collection, and caches and virtual memory.",
    why: "Interviewers at big tech companies probe these foundations directly (\"write a thread-safe bounded queue\", \"why is this loop slow?\"), and they explain the bugs that only show up under load.",
  },
  "Data Structures & Algorithms": {
    blurb: "The core toolkit: Big O, data structures, sorting, graphs, dynamic programming, and the problem-solving patterns behind LeetCode-style questions.",
    why: "This is the interview and day-to-day foundation. Start with complexity, then the fundamentals, then work through the Patterns track and drills.",
  },
  "Software Design & OOP": {
    blurb: "Structuring code: classes, interfaces, dependency injection, SOLID, and the design patterns interviewers expect you to recognize.",
    why: "Knowing the algorithm is half the job; the other half is shaping the code around it so it stays easy to change.",
  },
  "Professional Dev Skills": {
    blurb: "Skills a working developer needs regardless of language: SQL with live queries, Git's staging and branching model, Git in a team with pull requests and merge strategies, testing, and engineering with AI assistants without handing over your judgement.",
    why: "Almost every real job touches a database and a Git repo from day one.",
  },
  "Linux & the Command Line": {
    blurb: "A real Linux system running right in your browser: files, permissions, pipes and processes, then shell scripting, text processing with grep, sed and awk, systemd services and logs, packages, cron, SSH keys, disks, and containers.",
    why: "Servers, containers and build machines nearly all run Linux, and the terminal is how you work with them.",
  },
  "Windows & PowerShell": {
    blurb: "Windows from an IT point of view: services, the registry, event logs and NTFS permissions; PowerShell's object pipeline, help system, scripting and remoting; Active Directory, Group Policy and Kerberos; and a bash to PowerShell phrasebook.",
    why: "Most company networks run on Windows and Active Directory, and PowerShell is how they're managed at scale. Knowing both shells makes you useful on either side of a mixed estate.",
  },
  Security: {
    blurb: "Authentication vs. authorization, passwords and MFA, secrets and least privilege, hashing and HTTPS, the OWASP Top 10 with hands-on SQL injection, XSS, IDOR, CSRF, SSRF and deserialization, threat modeling with STRIDE, phishing, incident response and logging, and OT/ICS security with the Purdue model.",
    why: "Most breaches come from a handful of well-known mistakes. Seeing each one happen makes it much easier to avoid.",
  },
  Networking: {
    blurb: "How data moves: how the internet fits together, network layers, IP addressing with unlimited subnetting drills, ARP and switches, VLANs, DHCP, Wi-Fi, routing, NAT, TCP vs UDP, DNS and HTTP, firewalls and ports, VPNs, and a troubleshooting toolkit built on real command output.",
    why: "Debugging anything that talks over a network gets much faster once the layers make sense.",
  },
  "System Design": {
    blurb: "How large systems are put together and how they scale: estimation, load balancing, caching and CDNs, replication and sharding, queues and event streams, rate limiting and consistency, tail latency, retries and circuit breakers, observability, a traffic simulator lab, API design (REST, gRPC and GraphQL, pagination, idempotency, versioning, auth and limits), then full interview walk-throughs.",
    why: "Senior and big-tech interviews include a design round, and the same building blocks decide how real services hold up under load.",
  },
  "Cloud & DevOps": {
    blurb: "Where the System Design building blocks actually run, and how code gets there: cloud service models, regions and shared responsibility; container images and registries; Kubernetes in practice; CI/CD pipelines; infrastructure as code with Terraform and Bicep; and observability with metrics, logs, traces and alerts.",
    why: "Almost every team now ships to a cloud through a pipeline. Knowing how that path works, and how to see what's happening once code is live, is expected of developers and IT staff alike.",
  },
  "AI & Machine Learning": {
    blurb: "How the AI tools you use every day actually work: machine learning basics, neural networks and gradient descent, tokens and embeddings, transformers and attention, how LLMs are trained, and how to use them well and safely.",
    why: "Knowing what a model is doing under the hood explains its costs, limits and failure modes, so you can get better results from it and know when not to trust it.",
  },
  "Behavioral Interviews": {
    blurb: "The other half of every interview loop: how STAR answers are graded, a bank of your own stories, and timed mock rounds in Amazon, Google and Meta styles.",
    why: "Behavioral rounds carry as much weight as coding at most big companies, and they decide your level. Unprepared stories are the most common way strong engineers get down-levelled.",
  },
  Glossary: {
    blurb: "About 1,000 industry terms in plain English, from algorithms, web APIs and cloud to IT operations, PLCs, SCADA, AI and interview jargon, with flash cards and a quiz.",
    why: "Knowing the vocabulary makes meetings, code reviews and interviews easier to follow, and each term links to the lesson that covers it in depth.",
  },
  "Industrial & Embedded Systems": {
    blurb: "PLCs, ladder logic, I/O, industrial networking, safety/redundancy design, hands-on IEC 61131-3 programming in Structured Text with a scan-cycle simulator and graded exercises, and step-by-step labs on real Allen-Bradley Micro850 controllers.",
    why: "Conperio's own world: controllers behave very differently from ordinary computers, and these lessons cover exactly how.",
  },
};
