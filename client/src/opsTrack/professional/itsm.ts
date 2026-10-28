import { type OpsLessonData } from "../types.ts";

export const itsm: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "IT service management (ITSM) is how an IT or operations team keeps services running and handles the stream of work around them: outages, requests, changes and the bugs behind repeated problems. The jargon comes mostly from ITIL, a framework of practices most companies use loosely. You don't need a certificate to work with it, but you will file tickets, join incidents, request changes and write root cause analyses, and each has its own rules.",
        "This lesson explains the main processes in plain English, how severity and SLAs decide what gets done first, and how a good incident and its postmortem run.",
      ],
    },
    {
      kind: "table",
      title: "The four kinds of ticket",
      head: ["Type", "Means", "Example", "Goal"],
      rows: [
        ["Incident", "something that worked is broken or degraded now", "the payroll site returns errors", "restore service as fast as possible, even with a workaround"],
        ["Service request", "a normal ask, nothing is broken", "a new laptop, access to a shared folder, a password reset", "fulfil it within the agreed time, ideally automatically"],
        ["Problem", "the underlying cause of one or more incidents", "the same disk fills up every month and takes the site down", "find and remove the root cause so the incidents stop"],
        ["Change", "adding, modifying or removing anything that could affect a service", "patching servers, a firewall rule, a release", "make the change safely, with a plan and a way back"],
      ],
      notes: ["The most common mix-up: closing an incident is not fixing the problem. Restarting the server ends the incident; finding out why it keeps running out of memory is problem management."],
    },
    {
      kind: "table",
      title: "Severity and priority",
      head: ["Severity", "Typical meaning", "Typical response"],
      rows: [
        ["SEV1 / P1 (critical)", "a core service is down for everyone, data loss, or a security breach", "page the on-call engineer now, incident commander, updates every 30 minutes, work around the clock"],
        ["SEV2 / P2 (high)", "a major feature broken or a large group affected, workaround painful", "respond within about an hour, work it during extended hours"],
        ["SEV3 / P3 (medium)", "a minor feature broken or a workaround exists", "next business day"],
        ["SEV4 / P4 (low)", "cosmetic, a question, a nice to have", "planned work"],
      ],
      notes: ["Many teams set priority from impact (how many people or how much money) and urgency (how fast it gets worse). Write down what each level means for your services before an incident, so nobody argues about it during one."],
    },
    {
      kind: "terms",
      title: "Agreements and measurements",
      terms: [
        { term: "SLA (service level agreement)", meaning: "a promise to a customer, often with penalties: 99.9% monthly availability, or P1 incidents answered within 15 minutes." },
        { term: "SLO (service level objective)", meaning: "an internal target, usually stricter than the SLA, such as 99.95%. The gap is your safety margin." },
        { term: "SLI (service level indicator)", meaning: "the actual measurement: the share of requests that succeeded in under 300 ms this month." },
        { term: "OLA (operational level agreement)", meaning: "a promise between internal teams, such as the database team answering escalations within 30 minutes, so the SLA can be met." },
        { term: "MTTA, MTTR", meaning: "mean time to acknowledge an alert and mean time to restore service. They track how good the response is, not how often things break." },
        { term: "Error budget", meaning: "what the SLO allows to fail: 99.9% leaves about 43 minutes a month. When it is spent, reliability work comes before new features." },
      ],
    },
    {
      kind: "steps",
      title: "How a major incident runs",
      steps: [
        "Detect and declare: an alert or a user report arrives; whoever sees it opens an incident and sets a severity. Declaring early is cheap; arriving late is not.",
        "Assign roles: an incident commander coordinates and decides, a communications lead updates stakeholders and the status page, and responders investigate. The commander doesn't debug.",
        "Stabilize first: roll back the last change, fail over, add capacity or disable the feature. Finding the root cause can wait until users are working again.",
        "Communicate on a schedule: say what is affected, what is being done and when the next update is, even if the update is \"no change\".",
        "Resolve and confirm with the users or the monitoring that service is really back, then close the incident and open a problem ticket for the cause.",
        "Hold a blameless postmortem within a few days.",
      ],
    },
    {
      kind: "text",
      title: "Root cause analysis and blameless postmortems",
      paragraphs: [
        "A postmortem records what happened (a timeline), the impact, why it happened and the actions that stop it happening again, each with an owner and a date. Blameless means the question is how the system let a reasonable person make that mistake, not who to punish. If people fear blame they hide information, and the real causes stay.",
        "The 5 whys is a simple way to dig past the first answer. The site went down. Why? The disk was full. Why? Logs filled it. Why? Log rotation was off on the new servers. Why? The server build script didn't include it. Why? Nobody reviews changes to the build script. The useful fixes are near the bottom of the chain: review the build script and alert on disk space, not just delete some logs. Real incidents usually have several contributing causes rather than a single root.",
      ],
    },
    {
      kind: "table",
      title: "Change management",
      head: ["Change type", "Meaning", "Approval"],
      rows: [
        ["Standard", "low risk, done often, with a tested procedure (adding a DNS record, a routine patch)", "pre-approved; just log it"],
        ["Normal", "anything else: assessed for risk, scheduled, with a test and rollback plan", "a peer, a manager or the change advisory board (CAB), depending on risk"],
        ["Emergency", "needed now to fix or prevent an incident", "a quick approval by an on-call authority, reviewed afterwards"],
      ],
      notes: ["Most outages follow a change, which is why the first question in an incident is \"what changed?\". Modern teams keep the control but automate it: a reviewed pull request plus a CI/CD pipeline with automatic tests, gradual rollout and rollback is a change record."],
    },
    {
      kind: "steps",
      title: "Writing a ticket someone can act on",
      steps: [
        "A specific title: \"Payroll site returns 500 on submit since 09:40\", not \"site broken\".",
        "Who and how many are affected, and since when.",
        "What you did, what you expected and what happened instead, with exact error messages and screenshots.",
        "What you already tried, and whether there is a workaround.",
        "Anything that changed recently, as far as you know.",
      ],
    },
  ],
  quiz: [
    {
      question: "The VPN went down and the on-call engineer restarted the gateway; it is back. The same thing happened twice last month. What should happen next?",
      answer: "Close the incident and open a problem ticket to find why it keeps failing",
      distractors: ["Nothing, the incident is resolved", "Raise the incident's severity", "Open a service request for a new VPN"],
      why: "Incident management restores service; problem management removes the cause of repeated incidents.",
    },
    {
      question: "During a SEV1, what should the incident commander mostly do?",
      answer: "Coordinate: assign work, make decisions and keep updates flowing",
      distractors: ["Debug the hardest part personally", "Write the postmortem as it happens", "Approve each command responders run"],
      why: "Someone has to keep the big picture. A commander deep in a terminal stops coordinating, and the incident drifts.",
    },
    {
      question: "Your SLO is 99.9% availability per 30 day month. Roughly how much downtime does that allow?",
      answer: "About 43 minutes",
      distractors: ["About 4 minutes", "About 7 hours", "About 1 day"],
      why: "0.1% of 43,200 minutes is 43.2 minutes. 99.99% would allow about 4.3 minutes.",
    },
    {
      question: "Which is a standard change?",
      answer: "Adding a DNS record using the documented, pre-approved procedure",
      distractors: ["Migrating the main database to new hardware", "A hotfix during an outage", "Changing the core firewall policy"],
      why: "Standard changes are low risk, frequent and follow a tested procedure, so they are pre-approved. The others need assessment or are emergencies.",
    },
  ],
  pitfalls: [
    "Debugging the root cause while users are still down, instead of rolling back first.",
    "Postmortems that name a person as the cause, so the next mistake is hidden instead of reported.",
    "Action items with no owner or date, which never get done.",
    "Every ticket marked urgent, so severity stops meaning anything.",
    "Making an unrecorded \"quick change\" during business hours.",
  ],
  next: [
    { id: "sec-incident-response-logging", label: "Incident Response, Logging and Monitoring" },
    { id: "sd-observability", label: "Observability and SLOs" },
    { id: "git-team-workflows", label: "Git in a Team: Pull Requests, Reviews and Merge Strategies" },
  ],
};
