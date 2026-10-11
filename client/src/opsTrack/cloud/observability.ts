import { src, type OpsLessonData } from "../types.ts";

export const observability: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Monitoring tells you that something is wrong; observability is being able to work out why, including for problems nobody predicted, from the data your systems give off. That data comes in three kinds, often called the three pillars: metrics, logs and traces. Each answers a different question, and an incident usually needs all three.",
      ],
    },
    {
      kind: "table",
      title: "Three kinds of telemetry",
      head: ["", "What it is", "Good for", "Typical tools"],
      rows: [
        ["Metrics", "numbers measured over time: requests per second, error count, latency, CPU, queue length", "dashboards and alerts; cheap to keep for months", "Prometheus and Grafana, Azure Monitor, CloudWatch, Datadog"],
        ["Logs", "timestamped records of individual events, ideally structured (JSON) so they can be filtered by field", "the details of what happened to one request or one user", "Loki, Elasticsearch, Azure Monitor Logs, CloudWatch Logs, Splunk"],
        ["Traces", "the path of one request through every service it touched, as a tree of timed steps called spans", "finding which service or call is slow or failing in a distributed system", "Jaeger, Tempo, Zipkin, Application Insights, X-Ray"],
      ],
      notes: [
        "OpenTelemetry (OTel) is the vendor-neutral standard for producing all three: instrument your app once with its libraries and send the data to whichever backend you use.",
      ],
    },
    {
      kind: "terms",
      title: "Reading latency",
      terms: [
        { term: "Percentile (p50, p95, p99)", meaning: "p99 = 800 ms means 99% of requests were faster than 800 ms and 1% slower. p50 is the median: the typical request." },
        { term: "Why not the average?", meaning: "An average blends a few very slow requests into many fast ones and hides them. Users who hit the slow 1% many times a day notice; the average doesn't." },
        { term: "Counter, gauge, histogram", meaning: "the basic metric types. A counter only goes up (requests served); a gauge goes up and down (memory in use); a histogram counts values into buckets so percentiles can be calculated." },
        { term: "RED and USE", meaning: "two checklists. For services, RED: Rate, Errors, Duration. For resources such as disks and CPUs, USE: Utilisation, Saturation (work waiting), Errors." },
      ],
    },
    {
      kind: "widget",
      widget: "observability",
      title: "Try it: an incident from metric to trace to log",
      intro: "Set an alert rule on the latency graph, then follow one slow request through its trace to the log lines that explain it.",
    },
    {
      kind: "code",
      title: "Structured logs and jq",
      blocks: [
        {
          lang: "json",
          label: "app.jsonl (one JSON object per line)",
          code: src`
{"ts":"10:38:13.950","level":"info","service":"orders-api","trace_id":"0af7651916cd43dd8448eb211c80319c","msg":"request","path":"/api/orders","status":200,"ms":48}
{"ts":"10:38:14.002","level":"info","service":"gateway","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","msg":"request","path":"/api/orders/1842","status":200,"ms":2214}
{"ts":"10:38:14.023","level":"debug","service":"orders-api","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","msg":"cache miss","key":"order:1842"}
{"ts":"10:38:15.310","level":"error","service":"orders-api","trace_id":"b9c7c989f97918e1a8e2f6f1d2c3b4a5","msg":"query timeout","path":"/api/orders/1790","status":500,"ms":5003}
{"ts":"10:38:16.186","level":"warn","service":"orders-api","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","msg":"query slow","ms":2161,"waited_for_lock":true}
{"ts":"10:38:16.205","level":"warn","service":"orders-api","trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","msg":"slow request","ms":2190}
`,
        },
        {
          lang: "bash",
          code: "jq -r .level app.jsonl | sort | uniq -c",
          output: src`
      1 debug
      1 error
      2 info
      2 warn
`,
        },
        {
          lang: "bash",
          code: src`jq -r 'select(.trace_id == "4bf92f3577b34da6a3ce929d0e0e4736") | [.ts, .service, .level, .msg] | @tsv' app.jsonl`,
          output: src`
10:38:14.002	gateway	info	request
10:38:14.023	orders-api	debug	cache miss
10:38:16.186	orders-api	warn	query slow
10:38:16.205	orders-api	warn	slow request
`,
        },
        {
          lang: "bash",
          code: src`jq -r 'select(.ms > 1000) | "\(.ms) ms \(.msg)"' app.jsonl`,
          output: src`
2214 ms request
5003 ms query timeout
2161 ms query slow
2190 ms slow request
`,
        },
      ],
      notes: [
        "Because every line is JSON with the same field names, you filter on fields instead of guessing at text: `select(.level == \"error\")`, a time range, one user, one trace. Log platforms do the same thing at scale with their own query languages.",
        "The trace ID is what ties it together. Every service logs the ID of the request it's working on, and passes it on to the next service in the W3C `traceparent` HTTP header, for example `traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01` (version, trace ID, the caller's span ID, flags). OpenTelemetry libraries do this for you.",
      ],
    },
    {
      kind: "code",
      title: "Asking questions of metrics and logs",
      blocks: [
        {
          lang: "text",
          label: "PromQL (Prometheus)",
          code: src`
# requests per second over the last 5 minutes, per status code
sum by (code) (rate(http_requests_total{job="orders-api"}[5m]))

# share of requests that failed
sum(rate(http_requests_total{job="orders-api",code=~"5.."}[5m]))
  / sum(rate(http_requests_total{job="orders-api"}[5m]))

# p99 latency from a histogram
histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket{job="orders-api"}[5m])))
`,
        },
        {
          lang: "text",
          label: "KQL (Azure Monitor Logs, Application Insights)",
          code: src`
requests
| where timestamp > ago(1h)
| summarize count(), percentile(duration, 99) by bin(timestamp, 5m), resultCode
| order by timestamp asc
`,
        },
      ],
    },
    {
      kind: "table",
      title: "Alerts people don't learn to ignore",
      head: ["Rule", "Why"],
      rows: [
        ["Alert on symptoms users feel (errors, latency, \"can't log in\"), not on every cause", "High CPU that hurts nobody isn't worth waking someone for; a slow checkout is, whatever the cause."],
        ["Every alert that pages a person must need action now", "Anything else goes to a ticket or a dashboard. Pages that need nothing teach people to ignore pages."],
        ["Use a duration (`for: 5m`) and sensible thresholds", "One slow minute isn't an incident; five in a row probably is."],
        ["Link a runbook from every alert", "What it means, how to check, how to fix or escalate, written before 3 a.m."],
        ["Set SLOs and alert on burning the error budget", "An SLO (service level objective) is a target such as \"99.9% of requests succeed over 30 days\". The 0.1% you may fail is the error budget; alert when it's being used up fast."],
      ],
    },
  ],
  quiz: [
    {
      question: "Average latency is 120 ms and looks fine, but users complain the app is slow. What should you look at?",
      answer: "High percentiles such as p95 and p99",
      distractors: ["The minimum latency", "The average over a longer period", "CPU usage"],
      why: "A small share of very slow requests barely moves the average or the median, but users who hit them notice. Percentiles show the tail.",
    },
    {
      question: "A request is slow and passes through a gateway, two services and a database. Which telemetry shows where the time went?",
      answer: "A distributed trace of that request",
      distractors: ["A CPU metric of each server", "The gateway's access log", "An uptime check"],
      why: "A trace records each step (span) with its start time and duration across services, so the slow span stands out.",
    },
    {
      question: "How do you find every log line, from every service, for one user's failed request?",
      answer: "Filter on the trace ID (or correlation ID) that every service logs and passes along",
      distractors: ["Search all logs for the user's IP address in that minute", "Ask the user to reproduce it with debug logging on", "Read the logs of each service in turn"],
      why: "A shared ID propagated with the request is what joins logs across services. Without it you're matching timestamps by hand.",
    },
    {
      question: "An alert fires several times a night on CPU above 80% for one minute, and nobody ever needs to do anything. What should change?",
      answer: "Remove it or make it a dashboard item, and alert on user-facing symptoms with a sensible duration instead",
      distractors: ["Lower the threshold so it catches problems earlier", "Add more people to the rota", "Mute it at night only"],
      why: "Alerts that need no action cause alert fatigue, and then real alerts get ignored. Page only for things that need a person now.",
    },
    {
      question: "Why log JSON instead of free text?",
      answer: "Tools can filter and aggregate on fields (level, trace_id, status) reliably, without fragile text patterns",
      distractors: ["JSON logs are smaller", "Free text can't contain timestamps", "Only JSON can be sent over the network"],
      why: "Structured logs turn \"grep and hope\" into queries: count errors per endpoint, find all lines for one trace, and so on.",
    },
  ],
  pitfalls: [
    "Logging passwords, tokens or personal data. Logs are copied widely and kept for a long time; mask them at the source.",
    "Unbounded label values in metrics (a user ID or full URL as a label). Each distinct value is a new time series and can overwhelm the metrics system.",
    "Dashboards nobody looks at and alerts nobody owns.",
    "Only monitoring from the inside. Add a synthetic check from outside that does what a user does; it catches DNS, certificate and network problems your servers can't see.",
    "No retention plan: keeping everything forever is expensive, keeping a week is too little for most investigations.",
  ],
  next: [
    { id: "cloud-basics", label: "Cloud Fundamentals" },
    { id: "linux-disks-logs", label: "Disks, Filesystems and Logs (Linux)" },
  ],
};
