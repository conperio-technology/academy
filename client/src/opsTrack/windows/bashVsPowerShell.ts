import { src, type OpsLessonData } from "../types.ts";

export const bashVsPowerShell: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Most IT people end up using both shells: bash on Linux servers, containers and CI runners; PowerShell on Windows servers, Active Directory and Microsoft 365. They solve the same problems with different philosophies, and knowing the mapping makes switching between them painless.",
      ],
    },
    {
      kind: "table",
      title: "Two philosophies",
      head: ["", "bash", "PowerShell"],
      rows: [
        ["What flows through a pipe", "lines of text", ".NET objects with named properties"],
        ["How you pick out data", "by position and delimiter: `awk '{print $4}'`, `cut -d, -f2`", "by property name: `Select-Object Name`, `$_.Status`"],
        ["Command names", "short and historical: `ls`, `grep`, `awk`", "Verb-Noun: `Get-ChildItem`, `Select-String` (with short aliases)"],
        ["Case", "case-sensitive (files, commands, comparisons)", "case-insensitive by default"],
        ["Comparisons", "`[ \"$a\" = \"$b\" ]`, `-eq` for numbers", "`-eq`, `-gt`, `-like`, `-match` for everything"],
        ["Success of the last command", "`$?` is the exit code (0 = success)", "`$?` is True or False; `$LASTEXITCODE` for programs"],
        ["Where it runs", "every Linux and macOS machine, Git Bash and WSL on Windows", "built into Windows (5.1); PowerShell 7 on Windows, Linux and macOS"],
      ],
    },
    {
      kind: "widget",
      widget: "bashVsPs",
      title: "Try it: the translation table",
      intro: "Search for a command you know in one shell to find its partner in the other.",
    },
    {
      kind: "code",
      title: "One task, both ways: which client IPs cause the most errors?",
      blocks: [
        {
          lang: "bash",
          code: "grep ERROR app.log | awk '{print $4}' | sort | uniq -c | sort -rn",
          output: src`
      3 10.0.0.12
      1 192.168.1.20
`,
        },
        {
          lang: "powershell",
          code: src`
Get-Content app.log | Where-Object { $_ -match ' ERROR ' } |
    ForEach-Object { ($_ -split ' ')[3] } |
    Group-Object | Sort-Object Count -Descending | Select-Object Count, Name
`,
          unverified: true,
          output: src`
Count Name
----- ----
    3 10.0.0.12
    1 192.168.1.20
`,
        },
      ],
      notes: [
        "The log has seven lines in the same format as the Linux pipes lesson (date, time, level, IP, request, result); four are errors. With text input, both shells split the line by position. PowerShell only pulls ahead once the data is already objects, for example from `Import-Csv`, `ConvertFrom-Json` or any cmdlet, because then there's nothing to split.",
      ],
    },
  ],
  quiz: [
    {
      question: "Which PowerShell command is closest to grep -i timeout *.log?",
      answer: "Select-String -Pattern timeout -Path *.log",
      distractors: ["Where-Object timeout *.log", "Get-Content *.log -Filter timeout", "Find-Item timeout *.log"],
      why: "Select-String searches text with regular expressions and ignores case by default, so -i isn't needed (-CaseSensitive turns it on).",
    },
    {
      question: "What is the bash equivalent of Get-Content app.log -Tail 20 -Wait?",
      answer: "tail -n 20 -f app.log",
      distractors: ["head -n 20 app.log", "cat app.log | wc -l", "less -20 app.log"],
      why: "Both show the last 20 lines and keep following the file as it grows.",
    },
    {
      question: "In bash, $? is 1 after grep finds nothing. What is $? in PowerShell after Select-String finds nothing?",
      answer: "True: the command ran without error, it just returned nothing",
      distractors: ["1", "False", "$null"],
      why: "In PowerShell $? says whether the last command succeeded (True or False), not an exit code, and finding no matches isn't an error. For external programs, the exit code is in $LASTEXITCODE.",
    },
    {
      question: "You need a list of disabled AD users with their last sign-in date as a CSV. Which shell suits it best?",
      answer: "PowerShell: Get-ADUser returns objects and Export-Csv writes them directly",
      distractors: ["bash, piping ldapsearch through awk", "Either is equally easy", "Neither can do it"],
      why: "Get-ADUser -Filter 'Enabled -eq $false' -Properties LastLogonDate | Select-Object Name, LastLogonDate | Export-Csv. In bash you'd be parsing LDIF text.",
    },
  ],
  pitfalls: [
    "Typing bash habits into PowerShell: `>` for comparison (it redirects to a file), `&&` (only works in PowerShell 7), single `=` in conditions.",
    "Expecting PowerShell aliases on Linux. In pwsh on Linux, `ls`, `cat` and `sort` run the real Linux programs, which return text, not objects.",
    "Line endings and encodings when files cross over: Windows tools write CRLF line endings that break bash scripts. Configure your editor and Git (`core.autocrlf`, `.gitattributes`).",
  ],
  next: [
    { id: "ps-objects-pipeline", label: "PowerShell: Objects in the Pipeline" },
    { id: "linux-text-processing", label: "Text Processing: grep, sed, awk, cut, sort, uniq and xargs" },
  ],
};
