import { src, type OpsLessonData } from "../types.ts";

export const psCmdlets: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "PowerShell's commands are called cmdlets (\"command-lets\"), and they're all named Verb-Noun: `Get-Service`, `Restart-Computer`, `New-ADUser`. The verbs come from a short approved list (`Get-Verb` prints it), so once you know that \"read something\" is always Get, \"change it\" is Set, \"make one\" is New and \"delete it\" is Remove, you can usually guess a command's name. The noun is singular: `Get-Service`, never `Get-Services`.",
        "Three commands let you teach yourself the rest: `Get-Command` finds commands, `Get-Help` explains them, and `Get-Member` tells you what kind of object a command gives you and what you can do with it.",
      ],
    },
    {
      kind: "code",
      title: "Finding and learning commands",
      blocks: [
        {
          lang: "powershell",
          code: src`
Get-Command -Noun *Service*            # every command about services
Get-Command -Verb Get -Module NetTCPIP # what can I read about TCP/IP?
Get-Help Get-WinEvent -Examples        # just the examples
Get-Help Get-WinEvent -Parameter MaxEvents
Get-Help about_Comparison_Operators    # conceptual help topics start with about_
Update-Help                            # download help files (run elevated, once)
`,
        },
        {
          lang: "powershell",
          code: "Get-Command -Noun Service",
          unverified: true,
          output: src`
CommandType     Name                Version    Source
-----------     ----                -------    ------
Cmdlet          Get-Service         7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          New-Service         7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Remove-Service      7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Restart-Service     7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Resume-Service      7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Set-Service         7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Start-Service       7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Stop-Service        7.0.0.0    Microsoft.PowerShell.Management
Cmdlet          Suspend-Service     7.0.0.0    Microsoft.PowerShell.Management
`,
        },
      ],
      notes: [
        "Tab completion works on command names, parameter names and often parameter values: type `Get-Service -N` and press Tab. In the console, Ctrl+Space lists every match.",
        "Help files aren't installed with PowerShell 7 until you run `Update-Help`; until then `Get-Help` shows a short generated summary. `Get-Help Name -Online` opens the web page instead.",
      ],
    },
    {
      kind: "table",
      title: "Parameters",
      head: ["Idea", "Example"],
      rows: [
        ["Named parameters start with a dash and can be shortened while unambiguous", "`Get-ChildItem -Path C:\\Logs -Filter *.log -Recurse` (or `-Fi`, `-Rec`)"],
        ["Some parameters are positional: the name can be left out", "`Get-ChildItem C:\\Logs` (the first positional parameter is -Path)"],
        ["Switches are on or off, with no value", "`-Recurse`, `-Force`"],
        ["Common parameters such as `-Verbose` and `-ErrorAction` work on every cmdlet", "`-Verbose`, `-ErrorAction Stop`"],
        ["Most cmdlets that change things also offer `-WhatIf` and `-Confirm`, but not all: check with `Get-Help <cmd> -Parameter WhatIf` before relying on it", "`-WhatIf` (say what would happen), `-Confirm` (ask first)"],
        ["Aliases are short names for cmdlets", "`ls`, `dir` and `gci` are Get-ChildItem; `Get-Alias ls` shows the real command"],
      ],
      notes: [
        "`-WhatIf` is the best habit you can build: `Remove-Item C:\\Temp\\* -Recurse -WhatIf` lists what would be deleted and deletes nothing. Use full cmdlet and parameter names in scripts, and aliases only at the prompt.",
      ],
    },
    {
      kind: "widget",
      widget: "psVerbNoun",
      title: "Try it: name the cmdlet, then inspect what it returns",
      intro: "Build the cmdlet for each task from its verb and noun. Below, Get-Member shows the type and the members of three common objects.",
    },
    {
      kind: "text",
      title: "Reading Get-Member",
      paragraphs: [
        "The first line, `TypeName`, is the .NET type of the objects in the pipeline; search for it to find full documentation. Properties are data you can read (some you can also set: `{get;set;}`); methods are actions you can call with brackets, like `(Get-Service Spooler).Stop()`. AliasProperty and ScriptProperty are extras PowerShell adds for convenience, such as `Name` on a process being another name for `ProcessName`.",
        "If a pipeline returns several kinds of object (`Get-ChildItem` returns folders and files), Get-Member lists each type once.",
      ],
    },
  ],
  quiz: [
    {
      question: "Which verb would a cmdlet that creates a new local user use?",
      answer: "New (New-LocalUser)",
      distractors: ["Create (Create-LocalUser)", "Add (Add-LocalUser)", "Make (Make-LocalUser)"],
      why: "New makes a new resource. Add adds something to an existing container, as in Add-LocalGroupMember. Create and Make aren't approved verbs.",
    },
    {
      question: "You have an object in $svc and want to know which properties and methods it has. Which command?",
      answer: "$svc | Get-Member",
      distractors: ["Get-Help $svc", "Get-Command $svc", "$svc | Format-Table"],
      why: "Get-Member inspects objects. Get-Help and Get-Command are about commands, and Format-Table only shows a few properties chosen for display.",
    },
    {
      question: "What does Stop-Service Spooler -WhatIf do?",
      answer: "Prints what it would do (stop the Print Spooler service) and changes nothing",
      distractors: ["Stops the service after asking for confirmation", "Checks whether the service can be stopped and stops it if so", "Shows the help for Stop-Service"],
      why: "Stop-Service supports -WhatIf, like most cmdlets that change things (only cmdlets that declare SupportsShouldProcess have it, so check with Get-Help before relying on it). -Confirm is the one that asks before acting.",
    },
    {
      question: "In a script, why write Get-ChildItem -Path C:\\Logs instead of ls C:\\Logs?",
      answer: "Aliases can differ between systems (ls isn't an alias in PowerShell 7 on Linux), and full names are clearer to readers",
      distractors: ["Aliases are slower", "ls only lists the current folder", "Aliases don't accept parameters"],
      why: "On Linux and macOS, PowerShell doesn't define ls as an alias so the real ls runs instead, which returns text, not objects. Full names behave the same everywhere.",
    },
  ],
  pitfalls: [
    "Guessing parameters instead of reading `Get-Help NAME -Examples`. The examples are usually exactly what you need.",
    "Forgetting that one command can return zero, one or many objects. `(Get-Service x*).Count` works in PowerShell 3 and later even for one object; wrap the result in `@( )` if you need an array for certain.",
    "Running destructive commands without `-WhatIf` first.",
  ],
  next: [
    { id: "ps-scripting-remoting", label: "PowerShell Scripting, Remoting and Execution Policy" },
    { id: "ps-objects-pipeline", label: "Objects in the Pipeline" },
  ],
};
