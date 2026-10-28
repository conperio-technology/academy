import { type OpsLessonData } from "../types.ts";

export const agile: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Agile is a way of building software in small steps, showing working results often, and adjusting as you learn, rather than planning everything up front and delivering once at the end. It came out of the 2001 Agile Manifesto, a reaction to long projects that shipped late and built the wrong thing. Scrum and Kanban are the two frameworks most teams use to put it into practice.",
        "You don't need a certificate to take part, but you'll join standups, size work, sit in retrospectives and write design docs from your first week. This lesson explains the ceremonies and roles in plain English, how estimation works (and why it's in points, not hours), and where a design doc fits.",
      ],
    },
    {
      kind: "text",
      title: "What agile actually says",
      paragraphs: [
        "The manifesto values individuals and interactions over processes and tools, working software over comprehensive documentation, customer collaboration over contract negotiation, and responding to change over following a plan. It values the things on the right too; it just prefers the left when they conflict. The practical core is a short cycle: build a small slice, show it to users, learn, and decide what to build next.",
        "\"Agile\" has become a loaded word, because many teams adopt the ceremonies without the point of them: daily meetings that are really status reports to a manager, estimation that becomes a deadline, and no actual change in response to what's learned. The ceremonies are only useful when they serve shipping small and adjusting.",
      ],
    },
    {
      kind: "table",
      title: "Scrum and Kanban",
      head: ["", "Scrum", "Kanban"],
      rows: [
        ["Shape of work", "fixed-length sprints, usually 1 to 2 weeks", "a continuous flow, no fixed iterations"],
        ["Commitment", "a set of items picked for the sprint", "pull the next item when there's capacity"],
        ["Limits", "the sprint scope", "a work-in-progress (WIP) limit per column"],
        ["Roles", "product owner, scrum master, developers", "no prescribed roles"],
        ["Changes mid-cycle", "avoided during a sprint", "allowed any time"],
        ["Suits", "feature work that can be planned in batches", "steady streams: support, operations, maintenance"],
      ],
      notes: ["Many teams run a mix (\"Scrumban\"): sprints for planning rhythm, with WIP limits and a flow board. The framework matters less than the habits: small batches, limiting work in progress, and looking at how the work is going."],
    },
    {
      kind: "terms",
      title: "Scrum roles and artifacts",
      terms: [
        { term: "Product owner", meaning: "owns the backlog and its priority: decides what gets built next and why, representing the users and the business." },
        { term: "Scrum master", meaning: "helps the team follow the process and removes blockers. A facilitator, not a manager who assigns work." },
        { term: "Developers", meaning: "everyone who builds the increment: engineers, testers, designers. The team is cross-functional and self-organizing." },
        { term: "Product backlog", meaning: "the ordered list of everything that might be built, refined over time. The top is detailed and ready; lower items are rough." },
        { term: "Sprint backlog", meaning: "the items the team took on for this sprint, plus the plan for delivering them." },
        { term: "Increment", meaning: "the working, potentially shippable result at the end of a sprint. It must meet the team's definition of done." },
        { term: "User story", meaning: "a small unit of value from a user's view: \"As a shopper, I can save items for later, so I can buy them another day,\" with acceptance criteria that say when it's done." },
        { term: "Epic", meaning: "a large body of work that is broken into many stories." },
      ],
    },
    {
      kind: "table",
      title: "The Scrum ceremonies",
      head: ["Ceremony", "When", "Purpose"],
      rows: [
        ["Sprint planning", "start of the sprint", "pick items from the backlog and agree a realistic plan for them"],
        ["Daily standup", "every day, about 15 minutes", "the team syncs: progress, today's plan, blockers. For the team, not a status report to a boss"],
        ["Backlog refinement", "through the sprint", "break down and clarify upcoming items so they're ready to plan"],
        ["Sprint review", "end of the sprint", "demo the working increment to stakeholders and get feedback"],
        ["Retrospective", "end of the sprint", "the team reflects on how it worked and picks one or two improvements to try"],
      ],
      notes: ["The retrospective is the one that makes a team actually agile: it's where the process adapts. A team that skips it, or never acts on it, is just doing ceremonies."],
    },
    {
      kind: "text",
      title: "Estimation: points, not hours",
      paragraphs: [
        "Most teams size work in story points, a measure of relative effort and complexity rather than hours. A 2 is about twice the effort of a 1; an 8 is big and probably should be split. Points are often picked from a Fibonacci-like scale (1, 2, 3, 5, 8, 13) because the bigger the item, the less precisely you can estimate it. Planning poker is the usual method: everyone picks a number privately and reveals at once, and a big spread starts a useful conversation about what people understood differently.",
        "Why not hours? Because estimates in hours get read as commitments and then as deadlines, and people estimate hours badly. Points sidestep that: over a few sprints a team learns its velocity, the number of points it typically completes, and uses that to forecast. Velocity is a planning aid for one team, not a productivity score and never a way to compare teams: points mean different things on different teams, and pushing for higher velocity just inflates the estimates.",
      ],
    },
    {
      kind: "text",
      title: "Design docs",
      paragraphs: [
        "Agile prefers working software to heavy documentation, but it doesn't mean no documents. For anything beyond a small change, a short design doc (also called an RFC or a one-pager) written before the code saves far more time than it costs. It states the problem and context, the proposed approach, the main alternatives and why they were rejected, the trade-offs and risks, and the impact on other systems. Then people review it and disagree on paper, which is cheap, instead of in a finished pull request, which isn't.",
        "Keep it as short as the decision allows, write it for the reviewers who need to weigh in, and link it from the resulting tickets and pull request. Its real value is the thinking and the discussion it forces before the code is written; the artifact is a record of a decision, useful to whoever asks \"why was it built this way?\" a year later. This fits the same place as an architecture decision record (ADR), a very short note of one decision and its rationale kept in the repository.",
      ],
    },
  ],
  quiz: [
    {
      question: "What is the daily standup for?",
      answer: "The team to sync on progress, plans and blockers",
      distractors: ["Developers to report status to their manager", "Estimating the next sprint's work", "The product owner to assign tasks"],
      why: "It's a short coordination meeting for the team itself. When it becomes a status report to a manager, it has lost its purpose.",
    },
    {
      question: "Why do teams estimate in story points rather than hours?",
      answer: "Points measure relative effort and avoid being read as a deadline",
      distractors: ["Points are always more accurate than hours", "Points let managers compare teams' output", "Hours can't be used for planning"],
      why: "Hour estimates get treated as commitments. Points capture relative size, and a team's velocity turns them into a forecast for that team only.",
    },
    {
      question: "Which Scrum ceremony is where the team improves how it works?",
      answer: "The retrospective",
      distractors: ["The sprint review", "Sprint planning", "The daily standup"],
      why: "The review demos the product to stakeholders; the retrospective is the team reflecting on its own process and choosing what to change.",
    },
    {
      question: "A team handles a steady stream of support and operations tasks with constantly shifting priorities. Which fits best?",
      answer: "Kanban, with work-in-progress limits and continuous flow",
      distractors: ["Scrum with two-week sprints", "A six-month waterfall plan", "No process at all"],
      why: "Fixed sprint commitments fight constant reprioritization. Kanban pulls the next most important item and limits work in progress.",
    },
  ],
  pitfalls: [
    "Doing the ceremonies without the point: standups as status reports, retrospectives with no follow-through.",
    "Turning story points back into hours and then into deadlines.",
    "Comparing velocity between teams, or treating it as a productivity target.",
    "Stories too big to finish in a sprint, with no working increment to show.",
    "Skipping design docs for large changes, then discovering the disagreement in code review.",
    "\"Agile\" as a reason to skip all planning and documentation, rather than to do the right amount at the right time.",
  ],
  next: [
    { id: "itsm-incidents-changes", label: "IT Service Management: Incidents, Problems, Changes and SLAs" },
    { id: "git-team-workflows", label: "Git in a Team: Pull Requests, Reviews and Merge Strategies" },
    { id: "tdd-coverage", label: "TDD, What to Test, Flaky Tests and Coverage" },
  ],
};
