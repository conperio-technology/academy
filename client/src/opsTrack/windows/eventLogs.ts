import { src, type OpsLessonData } from "../types.ts";

export const eventLogs: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Windows records what happens in event logs, read with Event Viewer (`eventvwr.msc`) or PowerShell. Every event has a log, a time, a level, a source (the component that wrote it), an event ID (a number whose meaning is fixed for that source) and a message. Learning a dozen IDs gets you most of the way through the usual \"why did the server reboot / who locked my account / why did the app stop\" questions.",
      ],
    },
    {
      kind: "table",
      title: "The logs",
      head: ["Log", "What goes in it"],
      rows: [
        ["System", "Windows itself: drivers, services starting and stopping, shutdowns, updates, disk and network problems"],
        ["Application", "programs: crashes (.NET Runtime, Application Error), SQL Server, IIS and anything else that writes there"],
        ["Security", "the audit trail: sign-ins, failed sign-ins, lockouts, account and group changes. Only administrators can read it, and what's recorded is set by audit policy"],
        ["Setup", "installation of Windows features and updates"],
        ["Applications and Services Logs", "one log per component, e.g. Microsoft-Windows-PowerShell/Operational, Microsoft-Windows-TaskScheduler/Operational"],
      ],
      notes: [
        "Levels: Critical, Error, Warning, Information and Verbose. The Security log uses Audit Success and Audit Failure instead.",
      ],
    },
    {
      kind: "widget",
      widget: "eventLog",
      title: "Try it: one night on a server",
      intro: "Filter by log, level or event ID, and watch the matching Get-WinEvent command build itself. Click an event for what it means.",
    },
    {
      kind: "table",
      title: "Event IDs worth knowing",
      head: ["ID", "Log, source", "Means"],
      rows: [
        ["41", "System, Kernel-Power", "rebooted without a clean shutdown (power loss, hang, crash)"],
        ["1074", "System, User32", "a person or process asked for a restart or shutdown, and why"],
        ["6005 / 6006 / 6008", "System, EventLog", "event log started (boot) / stopped (clean shutdown) / previous shutdown was unexpected"],
        ["7031 / 7034 / 7036", "System, Service Control Manager", "service crashed (with / without a recovery action) / a service started or stopped"],
        ["1000 / 1026", "Application", "a program crashed / a .NET program died from an unhandled exception"],
        ["4624 / 4625", "Security", "sign-in succeeded / failed (check the Logon Type: 2 at the keyboard, 3 over the network, 10 Remote Desktop)"],
        ["4740", "Security (on domain controllers)", "an account was locked out, and from which computer"],
        ["4720 / 4728", "Security", "a user account was created / a member was added to a security-enabled global group"],
      ],
    },
    {
      kind: "code",
      title: "Querying events with PowerShell",
      blocks: [
        {
          lang: "powershell",
          code: src`
# Why did it reboot? Restarts asked for and unexpected shutdowns, newest first
Get-WinEvent -FilterHashtable @{ LogName = 'System'; Id = 41, 1074, 6008 } -MaxEvents 10 |
    Format-Table TimeCreated, Id, ProviderName, Message -Wrap

# Errors in the last 24 hours
Get-WinEvent -FilterHashtable @{ LogName = 'System', 'Application'; Level = 1, 2; StartTime = (Get-Date).AddDays(-1) }

# Failed sign-ins today, grouped by account (run as administrator)
Get-WinEvent -FilterHashtable @{ LogName = 'Security'; Id = 4625; StartTime = (Get-Date).Date } |
    ForEach-Object { $_.Properties[5].Value } | Group-Object | Sort-Object Count -Descending

# The same on another server
Get-WinEvent -ComputerName FS01 -FilterHashtable @{ LogName = 'System'; Id = 7031, 7034 } -MaxEvents 20
`,
        },
      ],
      notes: [
        "`-FilterHashtable` sends the filter to the event log service, so only matching events come back. Piping everything into `Where-Object` instead works, but reads every event first and is far slower on a big log.",
        "`$_.Properties` holds the event's data fields in order; for 4625, index 5 is the target account name. The `Message` text is for people; scripts should read properties (or the XML from `$_.ToXml()`).",
        "`Get-EventLog` is the older cmdlet. It only reads the classic logs and isn't in PowerShell 7, so use `Get-WinEvent`. In cmd, `wevtutil qe System /c:5 /rd:true /f:text` shows the newest five.",
      ],
    },
    {
      kind: "text",
      title: "Beyond one machine",
      paragraphs: [
        "Logs on a single server are lost if the server is, and nobody reads fifty servers' logs one by one. Companies forward events: Windows Event Forwarding collects chosen events onto one collector server, and a SIEM (security information and event management system, such as Microsoft Sentinel or Splunk) gathers logs from everything for searching and alerting. The event IDs above are the ones those alerts are built on.",
        "Logs also roll over: each log has a maximum size (Properties in Event Viewer), after which the oldest events are overwritten by default. If you need a month of Security events for an investigation, make sure the log, or the forwarding, keeps a month.",
      ],
    },
  ],
  quiz: [
    {
      question: "A server restarted at 03:00 and nobody admits to it. Which event do you look for first?",
      answer: "System event 1074, which records who or what asked for the restart and why",
      distractors: ["Security event 4624", "Application event 1000", "System event 7036"],
      why: "1074 names the process and user behind a planned restart or shutdown (Windows Update often). If there's no 1074 but there is a 41 and a 6008, the restart wasn't planned at all.",
    },
    {
      question: "Ana's account keeps locking out. Where do you find which machine is sending the bad password?",
      answer: "Event 4740 in the Security log of a domain controller, in the Caller Computer Name field",
      distractors: ["Event 4740 in Ana's laptop's System log", "Event 41 on the file server", "The Application log on any server"],
      why: "Lockouts are decided by domain controllers, so they log 4740. The caller computer is the one that sent the failed attempts, often an old phone or a mapped drive with a saved password.",
    },
    {
      question: "Why use Get-WinEvent -FilterHashtable rather than Get-WinEvent -LogName System | Where-Object Id -eq 41?",
      answer: "The filter runs in the event log service, so only matching events are read and returned",
      distractors: ["Where-Object can't compare numbers", "-FilterHashtable is the only way to read the System log", "There's no difference"],
      why: "Both give the same events, but the pipeline version reads and converts every event in the log first, which is slow on large logs or remote machines.",
    },
    {
      question: "A 4625 event shows Logon Type 3. What kind of sign-in failed?",
      answer: "A network sign-in, such as connecting to a file share",
      distractors: ["Someone at the keyboard", "A Remote Desktop session", "A service starting"],
      why: "Logon types: 2 interactive (keyboard), 3 network, 4 batch, 5 service, 10 remote interactive (Remote Desktop).",
    },
  ],
  pitfalls: [
    "Reading only the Message text in scripts. It's localised and can change; read the event's properties or XML.",
    "Security log too small. On a busy domain controller the default size can hold only hours of events; size it for your investigations, or forward events.",
    "Treating every Error as a problem. Some components log harmless errors at every boot. Learn what's normal for your servers so the unusual stands out.",
  ],
  next: [
    { id: "win-ntfs-permissions", label: "NTFS Permissions, Inheritance and Shares" },
    { id: "linux-systemd", label: "Linux's journal: systemd Services and journalctl" },
  ],
};
