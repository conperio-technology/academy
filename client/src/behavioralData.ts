// Content for the Behavioral Interviews section: the competencies interviewers probe, a
// question bank tagged by competency and company style, and worked STAR examples (a weak
// answer and a strong one to the same question, annotated).

export type CompetencyId =
  | "ownership"
  | "conflict"
  | "failure"
  | "ambiguity"
  | "impact"
  | "influence"
  | "collaboration"
  | "pressure"
  | "growth"
  | "customer"
  | "mentoring"
  | "technical";

export interface Competency {
  id: CompetencyId;
  label: string;
  hint: string; // what a story for this competency has to show
}

export const COMPETENCIES: Competency[] = [
  { id: "ownership", label: "Ownership", hint: "You took responsibility for something nobody assigned you, or saw it through after it got hard." },
  { id: "conflict", label: "Conflict and disagreement", hint: "You disagreed with a peer or manager, handled it with data and respect, and the outcome is clear (including if you lost)." },
  { id: "failure", label: "Failure or mistake", hint: "Something went wrong because of you, you owned it, fixed it, and changed how you work." },
  { id: "ambiguity", label: "Ambiguity and judgement", hint: "The requirements or the right answer were unclear, and you made a reasoned call without waiting for certainty." },
  { id: "impact", label: "Biggest impact", hint: "The work you're proudest of, with a measurable result and your specific part in it." },
  { id: "influence", label: "Influence without authority", hint: "You changed what other people or teams did without being their manager." },
  { id: "collaboration", label: "Working across teams", hint: "You delivered something that depended on people outside your team, and handled the friction." },
  { id: "pressure", label: "Pressure and deadlines", hint: "A hard deadline or an incident, what you cut or prioritised, and why." },
  { id: "growth", label: "Learning something fast", hint: "You had to get good at something new quickly, and how you did it." },
  { id: "customer", label: "Customer focus", hint: "You went back to what the user or customer actually needed, even when it cost you something." },
  { id: "mentoring", label: "Helping others grow", hint: "You made someone else better: onboarding, mentoring, reviews, or raising a team's bar." },
  { id: "technical", label: "Hardest technical problem", hint: "A genuinely hard problem, the options you weighed, and how you knew your fix worked." },
];

export type InterviewStyle = "general" | "amazon" | "google" | "meta";

export const STYLES: { id: InterviewStyle; label: string; blurb: string }[] = [
  {
    id: "general",
    label: "Any company",
    blurb: "The questions almost every company asks in some form.",
  },
  {
    id: "amazon",
    label: "Amazon",
    blurb:
      "Every question maps to one of the Leadership Principles, and interviewers each own two or three of them. Expect two follow-ups per answer and pointed questions about data and what you personally did.",
  },
  {
    id: "google",
    label: "Google",
    blurb:
      "\"Googleyness and leadership\": how you handle ambiguity, collaborate, push back, and help others. Less scripted than Amazon; hypotheticals (\"what would you do if...\") are common.",
  },
  {
    id: "meta",
    label: "Meta",
    blurb:
      "Focused on impact, moving fast, conflict and growth. Expect to be asked for the scope of your work and how you measured it; the answer helps decide your level.",
  },
];

export interface BehavioralQuestion {
  id: string;
  text: string;
  competencies: CompetencyId[];
  styles: InterviewStyle[];
  lookingFor: string;
  followUps: string[];
  principle?: string; // the Amazon Leadership Principle it's usually tied to
}

export const QUESTIONS: BehavioralQuestion[] = [
  {
    id: "tell-me-about-yourself",
    text: "Tell me about yourself.",
    competencies: ["impact"],
    styles: ["general", "google", "meta", "amazon"],
    lookingFor:
      "A 60 to 90 second arc, not your CV read aloud: what you work on now, one or two things you're proud of with a number attached, and why this role is the next step.",
    followUps: ["What are you looking for in your next role?", "Which of those projects was hardest, and why?"],
  },
  {
    id: "disagree-manager",
    text: "Tell me about a time you disagreed with your manager.",
    competencies: ["conflict"],
    styles: ["general", "amazon", "google", "meta"],
    principle: "Have Backbone; Disagree and Commit",
    lookingFor:
      "You raised it directly and early, argued with evidence rather than opinion, and once a decision was made you committed to it fully, even if it went against you.",
    followUps: ["What would you have done if they'd still said no?", "Looking back, who was right?", "How is your relationship with them now?"],
  },
  {
    id: "conflict-peer",
    text: "Describe a conflict with a coworker and how you resolved it.",
    competencies: ["conflict", "collaboration"],
    styles: ["general", "google", "meta"],
    lookingFor:
      "You tried to understand their side first, separated the person from the problem, and found a resolution that served the work. Blaming the other person is the most common way to fail this one.",
    followUps: ["What did you learn about how they work?", "What would you do differently?"],
  },
  {
    id: "biggest-mistake",
    text: "Tell me about a mistake you made at work.",
    competencies: ["failure"],
    styles: ["general", "amazon", "google", "meta"],
    principle: "Earn Trust",
    lookingFor:
      "A real mistake with real consequences (not a humble-brag), that you owned without excuses, how you fixed the immediate damage, and the change you made so it can't happen again.",
    followUps: ["How did you tell your manager?", "What process changed afterwards?", "Has anything similar happened since?"],
  },
  {
    id: "project-failed",
    text: "Tell me about a project that failed.",
    competencies: ["failure", "ambiguity"],
    styles: ["general", "meta", "google"],
    lookingFor:
      "Why it failed, your part in that, the signals you missed or acted on too late, and what you do differently now. It's fine if the failure wasn't your fault, but you still need to own your piece.",
    followUps: ["When did you first suspect it wouldn't work?", "What would you tell yourself at the start?"],
  },
  {
    id: "proudest",
    text: "What's the project you're most proud of?",
    competencies: ["impact", "technical"],
    styles: ["general", "meta", "google"],
    lookingFor:
      "Scope, your specific contribution, a hard decision along the way, and a measurable result. At Meta this answer is used to judge your level, so be precise about what you led versus what the team did.",
    followUps: ["What was the hardest decision?", "How did you measure success?", "What would you change if you did it again?"],
  },
  {
    id: "beyond-role",
    text: "Tell me about a time you took on something outside your job description.",
    competencies: ["ownership"],
    styles: ["general", "amazon", "meta"],
    principle: "Ownership",
    lookingFor:
      "You saw a problem nobody owned, decided it mattered enough to act, and saw it through without being asked, while still delivering your actual job.",
    followUps: ["Why did nobody else pick it up?", "What did you stop doing to make time for it?"],
  },
  {
    id: "long-term-vs-short",
    text: "Tell me about a time you sacrificed a short-term goal for a long-term one.",
    competencies: ["ownership", "ambiguity"],
    styles: ["amazon"],
    principle: "Ownership",
    lookingFor:
      "A real trade-off: what you gave up, why the long-term benefit was worth it, how you got others to agree, and evidence afterwards that it paid off.",
    followUps: ["Who disagreed, and how did you convince them?", "How do you know it paid off?"],
  },
  {
    id: "customer-obsession",
    text: "Tell me about a time you went above and beyond for a customer.",
    competencies: ["customer"],
    styles: ["amazon", "general"],
    principle: "Customer Obsession",
    lookingFor:
      "You started from the customer's actual problem, not the ticket as written, and the outcome changed something for them. Internal users count as customers.",
    followUps: ["How did you find out what they really needed?", "What did it cost you or the team?"],
  },
  {
    id: "said-no-customer",
    text: "Tell me about a time you had to say no to a customer or stakeholder.",
    competencies: ["customer", "conflict"],
    styles: ["amazon", "meta"],
    principle: "Customer Obsession",
    lookingFor:
      "You understood the need behind the request, explained why you weren't doing it, and offered something that addressed the underlying problem.",
    followUps: ["How did they react?", "Would you make the same call today?"],
  },
  {
    id: "ambiguous-requirements",
    text: "Describe a time you had to deliver with unclear requirements.",
    competencies: ["ambiguity"],
    styles: ["general", "google", "meta", "amazon"],
    principle: "Bias for Action",
    lookingFor:
      "You narrowed the ambiguity yourself (asked the right people, built a small prototype, wrote down assumptions) instead of waiting, and adjusted as you learned more.",
    followUps: ["Which assumption turned out wrong?", "How did you decide when you knew enough to start?"],
  },
  {
    id: "decision-without-data",
    text: "Tell me about a decision you made without all the data you wanted.",
    competencies: ["ambiguity"],
    styles: ["amazon", "google"],
    principle: "Bias for Action",
    lookingFor:
      "Why waiting was worse than deciding, how you judged the risk (was it reversible?), and how you would have spotted a wrong call quickly.",
    followUps: ["What data did you wish you had?", "What would have made you reverse it?"],
  },
  {
    id: "dive-deep",
    text: "Tell me about a time you had to dig into the details to find the root cause of a problem.",
    competencies: ["technical", "ownership"],
    styles: ["amazon", "general"],
    principle: "Dive Deep",
    lookingFor:
      "You didn't stop at the first plausible explanation. Walk through the evidence, the dead ends, how you proved the real cause, and how you made sure it was fixed.",
    followUps: ["What metric told you something was wrong?", "What did you rule out first?"],
  },
  {
    id: "hardest-technical",
    text: "What's the hardest technical problem you've worked on?",
    competencies: ["technical"],
    styles: ["general", "google", "meta"],
    lookingFor:
      "Why it was hard (not just big), the options you considered and their trade-offs, the one you chose, and how you verified it worked. Be ready to go two levels deeper on any part.",
    followUps: ["What other approaches did you consider?", "What would break first at 10x the scale?"],
  },
  {
    id: "simplify",
    text: "Tell me about a time you found a simpler way to do something.",
    competencies: ["technical", "impact"],
    styles: ["amazon"],
    principle: "Invent and Simplify",
    lookingFor:
      "What was complicated and what it cost, the simpler approach, and the measurable difference (time saved, incidents avoided, code removed).",
    followUps: ["Why hadn't anyone done it before?", "Was there resistance?"],
  },
  {
    id: "tight-deadline",
    text: "Tell me about a time you had to deliver under a tight deadline.",
    competencies: ["pressure"],
    styles: ["general", "amazon", "meta"],
    principle: "Deliver Results",
    lookingFor:
      "How you prioritised (what you cut and why), how you kept quality where it mattered, how you communicated the trade-offs, and whether you made it.",
    followUps: ["What did you cut?", "Did the shortcuts cause problems later?", "Who did you tell, and when?"],
  },
  {
    id: "incident",
    text: "Tell me about a production incident you handled.",
    competencies: ["pressure", "technical", "ownership"],
    styles: ["general", "google", "amazon"],
    lookingFor:
      "Calm triage: stop the bleeding first, communicate clearly, find the root cause afterwards, and the follow-up actions that stopped it recurring.",
    followUps: ["How did you decide between rolling back and fixing forward?", "What was in the postmortem?"],
  },
  {
    id: "missed-deadline",
    text: "Tell me about a time you missed a deadline or a commitment.",
    competencies: ["failure", "pressure"],
    styles: ["amazon", "meta"],
    principle: "Deliver Results",
    lookingFor:
      "When you realised you'd miss it, how early you said so, what you did to limit the damage, and how you plan differently now.",
    followUps: ["When did you know?", "How did the people depending on you react?"],
  },
  {
    id: "influence-other-team",
    text: "Tell me about a time you convinced another team to change their plans.",
    competencies: ["influence", "collaboration"],
    styles: ["general", "google", "meta", "amazon"],
    principle: "Earn Trust",
    lookingFor:
      "You understood their priorities, framed the change in terms of their goals, used data, and built support before the big ask.",
    followUps: ["What was in it for them?", "What would you have done if they'd refused?"],
  },
  {
    id: "unpopular-idea",
    text: "Tell me about a time you pushed for an idea others didn't like at first.",
    competencies: ["influence", "conflict"],
    styles: ["google", "amazon", "meta"],
    principle: "Have Backbone; Disagree and Commit",
    lookingFor:
      "Conviction backed by evidence, listening to the objections and adjusting, and knowing when to let it go. A story where you were eventually proved wrong can be just as strong.",
    followUps: ["What was the strongest objection?", "What changed people's minds?"],
  },
  {
    id: "cross-team-dependency",
    text: "Tell me about a project that depended on other teams. How did you keep it on track?",
    competencies: ["collaboration", "ownership"],
    styles: ["general", "google", "meta"],
    lookingFor:
      "Clear agreements early, regular check-ins, spotting slippage before it was a crisis, and escalating constructively when needed.",
    followUps: ["What happened when a dependency slipped?", "How did you escalate, if you did?"],
  },
  {
    id: "difficult-person",
    text: "Tell me about working with someone who was difficult to work with.",
    competencies: ["collaboration", "conflict"],
    styles: ["general", "google", "meta"],
    lookingFor:
      "Empathy for why they behaved that way, what you changed in your own approach, and a working relationship (not necessarily a friendship) at the end.",
    followUps: ["Why do you think they acted that way?", "What did you change about yourself?"],
  },
  {
    id: "learn-fast",
    text: "Tell me about a time you had to learn a new technology or domain quickly.",
    competencies: ["growth"],
    styles: ["general", "amazon", "google", "meta"],
    principle: "Learn and Be Curious",
    lookingFor:
      "A concrete method (who you asked, what you built to learn, what you read), how quickly you became useful, and something you contributed back.",
    followUps: ["What was the hardest part to learn?", "How did you know you understood it?"],
  },
  {
    id: "critical-feedback",
    text: "Tell me about a time you received critical feedback.",
    competencies: ["growth", "failure"],
    styles: ["general", "amazon", "google", "meta"],
    principle: "Earn Trust",
    lookingFor:
      "Real feedback that stung, that you listened rather than defended, and a visible change in your behaviour afterwards that someone else noticed.",
    followUps: ["Did you agree with it at first?", "How do you know you've improved?"],
  },
  {
    id: "mentor",
    text: "Tell me about a time you helped a teammate grow.",
    competencies: ["mentoring"],
    styles: ["general", "amazon", "google", "meta"],
    principle: "Hire and Develop the Best",
    lookingFor:
      "Specifics: what they struggled with, what you did (pairing, reviews, stretch tasks), and how they're doing now. Senior candidates are expected to have several of these.",
    followUps: ["What did they find hardest?", "What did you learn from mentoring them?"],
  },
  {
    id: "raise-bar",
    text: "Tell me about a time you raised the quality bar on your team.",
    competencies: ["mentoring", "ownership"],
    styles: ["amazon", "meta"],
    principle: "Insist on the Highest Standards",
    lookingFor:
      "A standard that was too low, the change you drove (reviews, tests, alerts, a checklist), how you got buy-in, and the measurable improvement.",
    followUps: ["Who pushed back?", "How do you keep the standard from slipping again?"],
  },
  {
    id: "frugality",
    text: "Tell me about a time you accomplished something with fewer resources than you wanted.",
    competencies: ["pressure", "ambiguity"],
    styles: ["amazon"],
    principle: "Frugality",
    lookingFor: "The constraint, the creative way around it, and a result that held up without the extra resources.",
    followUps: ["What would you have done with twice the resources?", "What did you decide not to do?"],
  },
  {
    id: "big-bet",
    text: "Tell me about a time you thought big and proposed something ambitious.",
    competencies: ["influence", "impact"],
    styles: ["amazon", "meta"],
    principle: "Think Big",
    lookingFor:
      "A vision bigger than the immediate task, how you made the case for it, and how you broke it into steps that delivered value along the way.",
    followUps: ["How did you get it funded or prioritised?", "What part of it hasn't happened yet?"],
  },
  {
    id: "prioritize",
    text: "How do you decide what to work on when everything is a priority?",
    competencies: ["pressure", "ambiguity"],
    styles: ["general", "google", "meta"],
    lookingFor:
      "A real example, a framework you actually used (impact vs effort, deadlines, who's blocked), and how you communicated what you were not doing.",
    followUps: ["Tell me about a time you got the priority wrong.", "Who did you disappoint, and how did you handle it?"],
  },
  {
    id: "why-company",
    text: "Why do you want to work here?",
    competencies: ["growth"],
    styles: ["general", "google", "meta", "amazon"],
    lookingFor:
      "Specific reasons tied to the product, the team or the kind of problems, and to what you want to learn. Generic praise of the company is the weak answer.",
    followUps: ["What would you want to work on first?", "What do you think we do badly?"],
  },
  {
    id: "hypothetical-teammate",
    text: "A teammate keeps missing their commitments and it's starting to affect your work. What do you do?",
    competencies: ["conflict", "collaboration"],
    styles: ["google"],
    lookingFor:
      "Talk to them privately first and find out why, offer help, agree something concrete, and involve the manager only if that fails, with empathy throughout. Back it with a real example if you have one.",
    followUps: ["What if they say it's none of your business?", "When would you go to your manager?"],
  },
  {
    id: "hypothetical-launch",
    text: "You're about to launch and you find a bug that affects a small number of users. What do you do?",
    competencies: ["customer", "pressure", "ambiguity"],
    styles: ["google", "meta"],
    lookingFor:
      "Quantify the impact, consider options (delay, launch with a flag off, launch and hotfix), involve the right people, and decide on the basis of user harm rather than schedule.",
    followUps: ["Who makes the final call?", "What if the deadline was set by a partner?"],
  },
  {
    id: "earned-trust",
    text: "Tell me about a time you had to rebuild trust with someone.",
    competencies: ["failure", "collaboration"],
    styles: ["amazon"],
    principle: "Earn Trust",
    lookingFor: "What broke the trust, how you acknowledged it honestly, the consistent behaviour that rebuilt it, and how you know it worked.",
    followUps: ["How long did it take?", "What did you say in the first conversation?"],
  },
  {
    id: "are-right-a-lot",
    text: "Tell me about a time your judgement was right when others' wasn't.",
    competencies: ["ambiguity", "influence"],
    styles: ["amazon"],
    principle: "Are Right, A Lot",
    lookingFor:
      "How you reached your view (data, experience, seeking out opposing opinions), how you handled the disagreement, and humility in the telling. Also be ready for the opposite story.",
    followUps: ["Tell me about a time your judgement was wrong.", "How did you test your own assumptions?"],
  },
  {
    id: "scale-of-work",
    text: "Walk me through the most complex system you've owned end to end.",
    competencies: ["technical", "ownership", "impact"],
    styles: ["meta", "google"],
    lookingFor:
      "The scale (users, traffic, team size), the architecture in a few sentences, the decisions you personally made, and what you'd change. Interviewers use this to judge your level.",
    followUps: ["What was the biggest risk?", "Who else worked on it and what did they own?"],
  },
  {
    id: "questions-for-us",
    text: "Do you have any questions for me?",
    competencies: ["growth"],
    styles: ["general", "google", "meta", "amazon"],
    lookingFor:
      "Two or three real questions about the team, the work and how success is measured. \"No\" reads as low interest; questions about perks read as the wrong priorities.",
    followUps: [],
  },
];

// The self-check after each answer. Same list everywhere, because these are the mistakes
// interviewers write down most often.
export const RUBRIC: { id: string; label: string }[] = [
  { id: "specific", label: "One specific situation, not \"I usually...\" or a summary of several" },
  { id: "context", label: "Situation and task set up in under 30 seconds" },
  { id: "i", label: "Said \"I\" for what I did, \"we\" only for the team" },
  { id: "actions", label: "Most of the answer was my actions and why I chose them" },
  { id: "result", label: "A concrete result, with a number if there is one" },
  { id: "reflection", label: "What I learned or would do differently" },
  { id: "time", label: "Finished in about 2 to 3 minutes" },
];

export type StarPart = "S" | "T" | "A" | "R" | "L";

export const STAR_LABELS: Record<StarPart, string> = {
  S: "Situation",
  T: "Task",
  A: "Action",
  R: "Result",
  L: "Learning",
};

export interface StarExample {
  question: string;
  weak: { text: string; problems: string[] };
  strong: { part: StarPart; text: string; note: string }[];
}

export const STAR_EXAMPLES: StarExample[] = [
  {
    question: "Tell me about a time you disagreed with your manager.",
    weak: {
      text:
        "I disagree with people quite a lot, honestly, because I care about doing things right. One time my manager wanted us to use a new framework and I thought it was a bad idea. We had a lot of back and forth about it, and in the end we kind of found a middle ground. I think it worked out fine. I'm always open to other people's views.",
      problems: [
        "Opens with a generalisation about personality instead of one situation.",
        "No stakes: we never learn why the framework mattered or what was at risk.",
        "\"A lot of back and forth\" hides the actions: what did you actually say or do?",
        "\"Kind of found a middle ground\" and \"worked out fine\" are not results.",
        "Ends on a claim about yourself (\"always open\") that the story didn't demonstrate.",
      ],
    },
    strong: [
      {
        part: "S",
        text:
          "Last year my manager wanted to move our order service from SQL Server to a document database before the holiday peak, because the schema changes were slowing the team down.",
        note: "One situation, one sentence of context, and why it mattered.",
      },
      {
        part: "T",
        text: "I owned the order service, so I'd be the one running the migration, and I thought doing it six weeks before our busiest period was too risky.",
        note: "Your role and the specific disagreement.",
      },
      {
        part: "A",
        text:
          "Before arguing, I checked whether my worry was real. I pulled our incident history and found that two of our three outages that year came from data migrations. I also listed what the document database would actually fix. I took both to my manager in a one-to-one, not in the team meeting, and proposed a split: do the schema clean-up that was causing most of the pain now, and migrate in January after the peak. She pushed back that the team would lose momentum, so I offered to write the migration plan in December so it could start on day one.",
        note: "Most of the answer. Evidence over opinion, raised privately, a counter-proposal, and handling the objection.",
      },
      {
        part: "R",
        text:
          "She agreed. We got through the peak with no order-service incidents, the schema clean-up cut our average change time from about four days to one, and the migration finished in February, a week ahead of the plan.",
        note: "Concrete outcomes with numbers, including the follow-through.",
      },
      {
        part: "L",
        text:
          "What I took from it is that a disagreement goes much better when I arrive with data and an alternative rather than just a \"no\". I've done the same since when I disagree with a timeline.",
        note: "A short, specific reflection that shows a change in behaviour.",
      },
    ],
  },
  {
    question: "Tell me about a mistake you made at work.",
    weak: {
      text:
        "My biggest weakness is probably that I'm a perfectionist, so I sometimes spend too long polishing things. On one project that meant we shipped a bit late. But the quality was really high, so the customer was happy in the end.",
      problems: [
        "A humble-brag (\"perfectionist\") instead of a real mistake. Interviewers hear this constantly and discount it.",
        "No ownership of a consequence: the story ends with everything being fine.",
        "No specific actions to fix the damage.",
        "No change in behaviour, which is the main thing this question is testing.",
      ],
    },
    strong: [
      {
        part: "S",
        text: "Two years ago I wrote a database migration that added an index to our largest table, about 400 million rows.",
        note: "Concrete and technical, with scale.",
      },
      {
        part: "T",
        text: "I'd tested it on staging, which had a fraction of the data, and I ran it in production during working hours.",
        note: "States plainly what you did wrong, no excuses.",
      },
      {
        part: "A",
        text:
          "The index build locked the table and checkout started timing out. I spotted it in the error-rate alert within about two minutes, killed the migration, and posted in the incident channel what I'd run and that I'd stopped it. Once checkout recovered I rebuilt the index online with the concurrent option that evening. The next day I wrote the postmortem myself and added a check to our migration tool that refuses a blocking index build on any table over a million rows.",
        note: "Immediate fix, honest communication, a permanent fix that removes the cause for everyone.",
      },
      {
        part: "R",
        text:
          "Checkout was degraded for about seven minutes, roughly 300 failed orders, which we contacted with a discount code. The migration check has blocked four similar changes since then, two of them from other teams.",
        note: "The real cost, stated honestly, and evidence that the fix worked.",
      },
      {
        part: "L",
        text: "I now treat \"it worked on staging\" as meaning very little for anything that depends on data size, and I run big migrations off-peak with someone watching.",
        note: "A specific lesson, not \"I learned to be more careful\".",
      },
    ],
  },
  {
    question: "Tell me about a time you had to deliver with unclear requirements.",
    weak: {
      text:
        "We were asked to build a reporting dashboard but nobody really knew what they wanted. We had lots of meetings and eventually we built something and they liked it. I think the key with ambiguity is just being flexible and communicating a lot.",
      problems: [
        "\"We\" throughout: what did you do?",
        "\"Lots of meetings\" is not a method for reducing ambiguity.",
        "\"They liked it\" is a weak result with no measure.",
        "Ends on a platitude instead of what you'd specifically repeat.",
      ],
    },
    strong: [
      {
        part: "S",
        text:
          "Our operations director asked for \"a dashboard showing how the plants are doing\". There were five plants, each tracking different numbers, and no one could say which ones mattered.",
        note: "Shows the ambiguity concretely.",
      },
      {
        part: "T",
        text: "I was the only developer on it and had about a month.",
        note: "Your role and the constraint, in one line.",
      },
      {
        part: "A",
        text:
          "Instead of collecting requirements in meetings, I asked the director what decision she'd make differently with the dashboard. The answer was which plant to send the maintenance crew to each week. That narrowed it to downtime and its causes. I built a rough version in three days with real data from two plants and sat with her while she used it. She ignored half of it and kept asking for one breakdown I hadn't included, so I cut the unused charts and added that one. I repeated that loop weekly with plant managers as well.",
        note: "A method: anchor on the decision, prototype fast, watch real use, iterate.",
      },
      {
        part: "R",
        text:
          "The final dashboard had four charts instead of the twenty in the original wish list. Within two months the crew's scheduling was based on it, and unplanned downtime at the worst plant fell by about 15 percent.",
        note: "A business result, not just \"shipped\".",
      },
      {
        part: "L",
        text: "Since then, when requirements are vague I start by asking what decision the thing will support. It's usually the fastest way to cut the scope down.",
        note: "A reusable technique you can name.",
      },
    ],
  },
];
