import { src, type OpsLessonData } from "../types.ts";

export const psPipeline: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "PowerShell is Microsoft's shell and scripting language, built on .NET. Windows ships Windows PowerShell 5.1 (`powershell.exe`); the current, cross-platform version is PowerShell 7 (`pwsh`), which also runs on Linux and macOS. Learn 7, and know that 5.1 is what you'll find on older servers.",
        "The big idea: commands pass objects, not text. In bash, `ps` prints lines and you cut columns out of them with awk; if the layout changes, your script breaks. In PowerShell, `Get-Process` emits .NET process objects, and the next command reads their properties by name: `CPU`, `Id`, `WS` (working set, the memory in use). Nothing is parsed, and numbers stay numbers, so sorting and comparing just work.",
      ],
    },
    {
      kind: "code",
      title: "The same question in both shells",
      blocks: [
        {
          lang: "bash",
          label: "bash: top 3 processes by memory",
          code: "ps -eo comm,pid,rss --sort=-rss | head -n 4",
        },
        {
          lang: "powershell",
          label: "PowerShell: top 3 processes by memory",
          code: src`
Get-Process | Sort-Object WS -Descending | Select-Object -First 3
`,
          unverified: true,
          output: src`
 NPM(K)    PM(M)      WS(M)     CPU(s)      Id  SI ProcessName
 ------    -----      -----     ------      --  -- -----------
    104   1210.33    1192.09     402.11    2260   0 sqlservr
     98    501.44     488.28     812.40    4120   1 chrome
     76    412.70     400.54     145.02    9012   1 Teams
`,
        },
      ],
      notes: [
        "The bash version depends on `ps` printing the columns you asked for in that order, and `head -n 4` counts the header line. The PowerShell version names the property it sorts by and never sees text until the very end, when the console formats whatever objects reach it as a table.",
        "That table is only a display. The objects underneath have far more properties than the columns shown (`Get-Process | Select-Object -First 1 *` shows them all).",
      ],
    },
    {
      kind: "widget",
      widget: "psPipeline",
      title: "Try it: build a pipeline and watch the objects",
      intro: "Add stages, then click any stage to see exactly which objects come out of it.",
    },
    {
      kind: "table",
      title: "The pipeline toolkit",
      head: ["Cmdlet", "Does", "Example"],
      rows: [
        ["`Where-Object`", "keep objects that match", "`Where-Object Status -eq Running`, or with a script block: `Where-Object { $_.CPU -gt 100 -and $_.Name -like 'w*' }`"],
        ["`Sort-Object`", "sort by one or more properties", "`Sort-Object Department, Name`"],
        ["`Select-Object`", "pick properties, or the first or last N objects", "`Select-Object Name, Id`; `Select-Object -Last 5`; `-ExpandProperty Name` for bare values"],
        ["`ForEach-Object`", "run a script block for each object", "`ForEach-Object { $_.Name.ToUpper() }`"],
        ["`Group-Object`", "group by a property and count", "`Group-Object Status`"],
        ["`Measure-Object`", "count, sum, average, min, max", "`Measure-Object Length -Sum -Average`"],
        ["`Format-Table`, `Format-List`", "display only. Always last", "`Format-Table Name, Status -AutoSize`"],
        ["`Export-Csv`, `ConvertTo-Json`, `Out-File`", "save or convert", "`Export-Csv services.csv -NoTypeInformation`"],
      ],
      notes: [
        "`$_` (also spelled `$PSItem`) is the current object inside a script block. Comparison operators are words: `-eq -ne -gt -lt -ge -le`, `-like` (wildcards), `-match` (regular expressions), `-contains` and `-in` (collections). They ignore case by default; `-ceq`, `-clike` and so on are case-sensitive.",
      ],
    },
    {
      kind: "code",
      title: "Format last, or you get strings",
      blocks: [
        {
          lang: "powershell",
          code: src`
# Works: real objects reach Export-Csv
Get-Service | Where-Object Status -eq Running | Select-Object Name, DisplayName |
    Export-Csv running.csv -NoTypeInformation

# Broken: Format-Table turns objects into formatting instructions
Get-Service | Format-Table Name, Status | Export-Csv broken.csv
`,
        },
      ],
      notes: [
        "Format cmdlets produce objects that only the console knows how to draw. Anything after them sees those, not your services, so `broken.csv` is full of format metadata. Rule: filter left (as early as possible), format right (only at the very end, and only for people).",
      ],
    },
  ],
  quiz: [
    {
      question: "What does this output?",
      code: "1..6 | Where-Object { $_ % 2 -eq 0 } | ForEach-Object { $_ * 10 }",
      lang: "powershell",
      answer: "20, 40 and 60, one per line",
      distractors: ["10, 30 and 50, one per line", "2, 4 and 6, one per line", "120"],
      why: "1..6 makes the numbers 1 to 6, Where-Object keeps the even ones, and ForEach-Object multiplies each by 10. Each result is written to the pipeline as its own object.",
    },
    {
      question: "What does \"abc\" -eq \"ABC\" return?",
      answer: "True",
      distractors: ["False", "An error", "abc"],
      why: "PowerShell's comparison operators ignore case unless you use the c versions: \"abc\" -ceq \"ABC\" is False.",
    },
    {
      question: "What does \"5\" + 5 return, and what does 5 + \"5\" return?",
      answer: "\"55\" (text) and 10 (a number)",
      distractors: ["10 and 10", "\"55\" and \"55\"", "An error both times"],
      why: "The left operand decides: a string on the left means string concatenation, so 5 is converted to \"5\"; a number on the left means addition, so \"5\" is converted to 5.",
    },
    {
      question: "Why does Get-Process | Format-Table Name, Id | Sort-Object Id not sort anything useful?",
      answer: "After Format-Table there are only formatting objects, which have no Id property",
      distractors: ["Sort-Object only sorts text", "Format-Table already sorts by the first column", "Id is read-only"],
      why: "Format cmdlets must come last. Sort first, then format: Get-Process | Sort-Object Id | Format-Table Name, Id.",
    },
    {
      question: "You want just the names as plain strings, one per line, to pass to another command. Which works?",
      answer: "Get-Service | Select-Object -ExpandProperty Name",
      distractors: ["Get-Service | Select-Object Name", "Get-Service | Format-List Name", "Get-Service | Out-String Name"],
      why: "Select-Object Name gives objects that each have one property called Name. -ExpandProperty pulls the values themselves out. (Get-Service).Name does the same.",
    },
  ],
  pitfalls: [
    "Formatting in the middle of a pipeline (`Format-Table`, `Out-String`) and then trying to use the result. Format last.",
    "Filtering right: `Get-ChildItem C:\\ -Recurse | Where-Object Extension -eq .log` reads every file first; `Get-ChildItem C:\\ -Recurse -Filter *.log` lets the filesystem do the filtering.",
    "Assuming the columns you see are all there is. Use `Select-Object *` or `Get-Member` to see every property.",
    "Comparing with `=` or `>`: in PowerShell `=` assigns and `>` redirects to a file. Use `-eq` and `-gt`.",
  ],
  next: [
    { id: "ps-cmdlets-help", label: "Cmdlets, Verb-Noun, Get-Help and Get-Member" },
    { id: "bash-vs-powershell", label: "Bash vs PowerShell Side by Side" },
  ],
};
