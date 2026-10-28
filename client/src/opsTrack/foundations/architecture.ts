import { type OpsLessonData } from "../types.ts";

export const architectureStyles: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Architecture is how a system is divided into parts and how those parts talk: one deployable application or fifty services, layers that call downwards or a core surrounded by adapters, direct calls or events. These choices are expensive to change later, they shape how teams work, and interviewers ask about them constantly (\"would you use microservices here?\").",
        "There is no best style, only trade-offs that suit a team's size, the domain and how fast it changes. This lesson describes the common styles at two levels: how the whole system is deployed (monolith, modular monolith, microservices, serverless) and how the code inside one application is organized (layered, hexagonal, clean), plus event-driven communication.",
      ],
    },
    {
      kind: "table",
      title: "How the system is deployed",
      head: ["Style", "What it is", "Strengths", "Costs"],
      rows: [
        ["Monolith", "one codebase, built and deployed as one unit, usually with one database", "simple to build, test, debug and deploy; calls are fast in-process function calls; transactions are easy", "grows tangled without discipline; one team's change redeploys everything; scales only as a whole"],
        ["Modular monolith", "one deployable, but split into modules with explicit boundaries and interfaces, each owning its data", "most of a monolith's simplicity with clear ownership; modules can later be extracted", "the boundaries need enforcing (by project references, architecture tests or review)"],
        ["Microservices", "many small services, each deployed independently and owning its data, talking over the network", "teams ship independently; services scale and fail separately; different technology per service is possible", "a distributed system: network failures, eventual consistency, tracing, versioned APIs, much more infrastructure"],
        ["Serverless", "functions and managed services that the cloud runs and scales per request or event", "no servers to manage; scales to zero; pay per use", "cold starts, time limits, vendor lock-in, harder local testing, cost at steady high load"],
      ],
      notes: ["A common, sound path: start with a well-structured modular monolith, and extract a service only when there is a concrete reason, such as a part that needs to scale differently, a separate team, or different reliability requirements. Splitting too early produces a \"distributed monolith\": services that must all be deployed together, with the costs of both."],
    },
    {
      kind: "text",
      title: "When microservices are worth it",
      paragraphs: [
        "Microservices solve an organizational problem first: many teams working on one product without blocking each other. Each service has one owning team, its own release schedule and its own data. That pays off at the size of dozens of engineers and a domain with clear seams (catalogue, ordering, payments, shipping). For a team of five, the overhead of service discovery, network failures, distributed tracing, contract testing and data duplication usually outweighs the benefit.",
        "The hard part is the boundaries. A good service boundary follows the business (a bounded context in domain-driven design), so most changes touch one service. A bad one splits along technical layers (a \"database service\", a \"validation service\"), so every feature touches several services and needs coordinated deploys. If two services always change together, they are one service.",
      ],
    },
    {
      kind: "table",
      title: "How the code inside an application is organized",
      head: ["Style", "Idea", "Dependency direction"],
      rows: [
        ["Layered (n-tier)", "presentation, then business logic, then data access, each layer calling the one below", "downwards, ending at the database; business logic depends on data access"],
        ["Hexagonal (ports and adapters)", "the domain logic sits in the middle and defines ports (interfaces) for what it needs; adapters implement them for the web, the database, a queue", "inwards: adapters depend on the core, the core depends on nothing technical"],
        ["Clean or onion architecture", "rings: entities, use cases, interface adapters, frameworks; a variation of hexagonal", "inwards, towards the entities"],
        ["Vertical slices", "organize by feature (PlaceOrder, CancelOrder) rather than by layer, each slice holding its handler, data access and model", "within a slice; little shared across slices"],
      ],
      notes: ["The point of hexagonal and clean architecture is the dependency inversion principle: business rules don't import the database library or the web framework, so they can be tested without either and survive a change of either. In C# that usually means interfaces in the core project and implementations registered by dependency injection (see Services & Dependency Injection)."],
    },
    {
      kind: "text",
      title: "Event-driven architecture",
      paragraphs: [
        "In request-driven systems, a service calls another and waits: Ordering calls Payments, then Shipping. In event-driven systems, a service publishes a fact (OrderPlaced) to a broker such as Kafka, RabbitMQ or a cloud event bus, and any number of other services react to it in their own time. The publisher doesn't know or care who listens.",
        "Events decouple services in time and in knowledge: a new consumer can be added without changing the publisher, and a slow or broken consumer doesn't block the order. The costs are eventual consistency (Shipping learns about the order a moment later), harder debugging (the flow isn't in one place, so you need correlation ids and tracing), and the need for idempotent consumers, because brokers deliver at least once. Event sourcing goes further and stores the events themselves as the source of truth, rebuilding current state from them; CQRS separates the model used for writes from the models used for reads. Both add power and complexity, and suit only some domains.",
      ],
    },
    {
      kind: "steps",
      title: "Questions that decide the style",
      steps: [
        "How many teams will work on it, and do they need to release independently?",
        "Do parts of the system have very different load, scaling or reliability needs?",
        "How well is the domain understood? Boundaries drawn before you understand it will be wrong, and moving code between modules is far cheaper than between services.",
        "Does the team have the operational maturity for many deployables: CI/CD per service, monitoring, tracing, on-call?",
        "Which operations need strong consistency across parts, and which can be eventually consistent?",
      ],
    },
  ],
  quiz: [
    {
      question: "A team of four is starting a new internal product. What is usually the best first architecture?",
      answer: "A modular monolith with clear internal boundaries",
      distractors: ["Microservices from day one, one per entity", "Serverless functions for every endpoint", "A layered monolith with no module boundaries"],
      why: "It keeps deployment, testing and transactions simple while the domain is still being learned, and leaves the door open to extract services later.",
    },
    {
      question: "Every new feature needs coordinated changes and deploys to the order, customer and pricing services. What does that suggest?",
      answer: "The service boundaries are wrong: this is a distributed monolith",
      distractors: ["The services need more instances", "The team should add a message broker", "The services should share one database"],
      why: "Good boundaries make most changes local to one service. Services that always change together should be merged or redrawn along business capabilities.",
    },
    {
      question: "In hexagonal architecture, which way do dependencies point?",
      answer: "Inwards: adapters for the web and database depend on the domain core",
      distractors: ["Downwards: the domain depends on the data access layer", "Outwards: the core depends on the adapters", "Both ways, through a shared library"],
      why: "The core defines ports (interfaces); adapters implement them. The business logic can then be tested without a database or web server.",
    },
    {
      question: "What is a main cost of switching from direct calls to events between services?",
      answer: "Eventual consistency and flows that are harder to trace and debug",
      distractors: ["Services become more tightly coupled", "The publisher must know every consumer", "Messages can never be delivered twice"],
      why: "Consumers react later and independently, so state converges over time, and a business flow is spread across services. Brokers usually deliver at least once, so consumers must be idempotent.",
    },
  ],
  pitfalls: [
    "Choosing microservices for a small team because large companies use them.",
    "Splitting services by technical layer instead of business capability.",
    "Sharing one database between services, so a schema change couples them all again.",
    "Synchronous chains of calls across many services, where one slow service slows everything.",
    "Adopting event sourcing or CQRS everywhere instead of only where the domain needs an audit trail or very different read models.",
  ],
  next: [
    { id: "services-dependency-injection", label: "Services & Dependency Injection: Handed Dependencies, Not Constructed Ones" },
    { id: "sd-async-systems", label: "Distributed Async Systems: Streams, Outbox and Sagas" },
    { id: "sd-api-styles", label: "REST vs gRPC vs GraphQL" },
  ],
};
