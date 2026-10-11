import { src, type OpsLessonData } from "../types.ts";

export const psScripting: OpsLessonData = {
  parts: [
    {
      kind: "code",
      title: "A small but complete script",
      blocks: [
        {
          lang: "powershell",
          label: "Get-StaleProfiles.ps1",
          code: src`
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string[]]$ComputerName,

    [int]$Days = 90
)

$ErrorActionPreference = 'Stop'
$cutoff = (Get-Date).AddDays(-$Days)

foreach ($computer in $ComputerName) {
    try {
        $profiles = Get-CimInstance -ClassName Win32_UserProfile -ComputerName $computer |
            Where-Object { -not $_.Special -and $_.LastUseTime -lt $cutoff }

        foreach ($p in $profiles) {
            [pscustomobject]@{
                Computer = $computer
                Path     = $p.LocalPath
                LastUsed = $p.LastUseTime
            }
        }
    }
    catch {
        Write-Warning "$($computer): $($_.Exception.Message)"
    }
}
`,
        },
        {
          lang: "powershell",
          code: src`
.\Get-StaleProfiles.ps1 -ComputerName PC-0142, PC-0177 -Days 180 |
    Export-Csv stale-profiles.csv -NoTypeInformation
`,
        },
      ],
      notes: [
        "`param()` declares the script's parameters with types and defaults, so PowerShell checks and converts arguments for you; `[Parameter(Mandatory)]` makes it ask if one is missing. `[CmdletBinding()]` gives the script the common parameters like `-Verbose`.",
        "Variables start with `$` and keep their .NET type: `$Days` is an int, `$cutoff` a DateTime, so `-lt` compares dates properly. `@( )` is an array, `@{ }` a hashtable (key-value pairs), and `[pscustomobject]@{ ... }` turns a hashtable into an object with those properties.",
        "The script outputs objects instead of printing text, so whoever runs it decides what to do with them: a table on screen, a CSV, JSON, or another command. That's the main habit to carry over from the pipeline lesson.",
        "`\"$($computer): ...\"`: inside double quotes, `$( )` evaluates an expression. Here it also stops PowerShell reading `$computer:` as a drive-qualified variable name.",
      ],
    },
    {
      kind: "table",
      title: "Errors: terminating and non-terminating",
      head: ["", "Behaviour", "Handle with"],
      rows: [
        ["Non-terminating (most cmdlet errors)", "the error is written, the command carries on with the next item", "`-ErrorAction Stop` on that command, or `$ErrorActionPreference = 'Stop'` for the script"],
        ["Terminating (exceptions, `throw`, `-ErrorAction Stop`)", "stops the pipeline", "`try { } catch { } finally { }`"],
        ["External programs (`ping.exe`, `git`)", "never throw; set `$LASTEXITCODE`", "`if ($LASTEXITCODE -ne 0) { throw \"git failed\" }`"],
      ],
      notes: [
        "The trap everyone falls into: `try { Get-Item C:\\nope } catch { 'missing' }` doesn't print missing, because \"path not found\" is non-terminating and never reaches the catch. Add `-ErrorAction Stop`. It's PowerShell's equivalent of bash's `set -e`.",
      ],
    },
    {
      kind: "text",
      title: "Remoting: run commands on other machines",
      paragraphs: [
        "PowerShell remoting runs commands on remote computers and brings the results back as objects. On Windows it uses WinRM (Windows Remote Management, HTTP on port 5985 or HTTPS on 5986), which is on by default on Windows Server; `Enable-PSRemoting` switches it on elsewhere. In a domain, authentication is Kerberos, so no passwords are typed. PowerShell 7 can also remote over SSH, to Linux and Windows alike.",
      ],
    },
    {
      kind: "code",
      title: "Remoting in practice",
      blocks: [
        {
          lang: "powershell",
          code: src`
# One command on many machines at once (in parallel); results come back tagged
Invoke-Command -ComputerName WEB01, WEB02, WEB03 -ScriptBlock {
    Get-Service W3SVC | Select-Object Status, Name
}

# An interactive session on one machine (like ssh)
Enter-PSSession -ComputerName FS01
Exit-PSSession

# Pass local values in with $using:
$name = 'Spooler'
Invoke-Command -ComputerName PRN01 { Restart-Service -Name $using:name }

# PowerShell 7 over SSH
Invoke-Command -HostName web01.conperio.local -UserName deploy { uname -a }
`,
        },
        {
          lang: "powershell",
          code: src`
Invoke-Command -ComputerName WEB01, WEB02 { Get-Service W3SVC } |
    Select-Object PSComputerName, Status, Name
`,
          unverified: true,
          output: src`
PSComputerName Status  Name
-------------- ------  ----
WEB01          Running W3SVC
WEB02          Stopped W3SVC
`,
        },
      ],
      notes: [
        "Each result carries a `PSComputerName` property saying which machine it came from. The objects are serialised on the way back: you get their properties, but methods like `.Stop()` no longer work locally. Do the work inside the script block.",
        "The double hop: inside a remote session you can't, by default, reach a third machine (a file share, say) with your credentials, because they weren't passed along. The fixes (resource-based constrained delegation, or explicit credentials) are a conversation with your Active Directory team; just recognise the \"access denied on the second hop\" symptom.",
      ],
    },
    {
      kind: "text",
      title: "Execution policy",
      paragraphs: [
        "Execution policy decides whether `.ps1` scripts may run. It's a safety catch against running scripts by accident, not a security boundary: anyone can paste the script's contents into the console, or start `powershell -ExecutionPolicy Bypass`. Real control comes from things like application control policies (App Control for Business, AppLocker) and constrained language mode.",
        "See the current settings with `Get-ExecutionPolicy -List` (it can be set per machine, per user, per process and by Group Policy, which wins), and change your own with `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`.",
      ],
    },
    {
      kind: "widget",
      widget: "executionPolicy",
      title: "Try it: will this script run?",
      intro: "Pick a policy, where the script came from, and whether it's signed.",
    },
  ],
  quiz: [
    {
      question: "This prints the error and never reaches the catch. Why?",
      code: "try { Get-Item C:\\does-not-exist } catch { 'not found' }",
      lang: "powershell",
      answer: "\"Cannot find path\" is a non-terminating error; catch only sees terminating ones, so add -ErrorAction Stop",
      distractors: ["catch needs an exception type in brackets", "Get-Item never fails, it returns $null", "try/catch only works in scripts, not the console"],
      why: "Most cmdlet errors are non-terminating: written to the error stream while the command carries on. -ErrorAction Stop (or $ErrorActionPreference = 'Stop') turns them into terminating errors that try/catch can handle.",
    },
    {
      question: "A script block passed to Invoke-Command uses $name, which you set on your own machine. On the remote machine it's empty. What's the fix?",
      answer: "Use $using:name inside the script block",
      distractors: ["Declare $name as global", "Use Enter-PSSession instead", "Export $name as an environment variable"],
      why: "The script block runs in a separate session on the other machine, which knows nothing about your variables. $using: copies the local value across.",
    },
    {
      question: "What's the default execution policy on Windows Server?",
      answer: "RemoteSigned",
      distractors: ["Restricted", "Unrestricted", "AllSigned"],
      why: "Windows Server defaults to RemoteSigned: local scripts run, downloaded ones must be signed. Windows client editions default to Restricted. On Linux and macOS it's Unrestricted and can't be changed.",
    },
    {
      question: "Why is execution policy not considered a security control?",
      answer: "It's easily bypassed, for example by starting PowerShell with -ExecutionPolicy Bypass or pasting the script's code",
      distractors: ["It only applies to administrators", "It can't be set by Group Policy", "It only checks file names"],
      why: "Microsoft describes it as a safety feature to prevent accidents. To actually restrict what code can run, use application control policies.",
    },
    {
      question: "git.exe fails inside your PowerShell script, but the script carries on even with $ErrorActionPreference = 'Stop'. Why?",
      answer: "Native programs report failure through their exit code ($LASTEXITCODE), not as PowerShell errors",
      distractors: ["git always exits with 0", "$ErrorActionPreference only applies to the first command", "Native programs can't run in scripts"],
      why: "Check $LASTEXITCODE after each external program, or in PowerShell 7.4 and later set $PSNativeCommandUseErrorActionPreference = $true.",
    },
  ],
  pitfalls: [
    "Writing scripts that print text with `Write-Host` instead of outputting objects. Write-Host goes straight to the screen and can't be piped or saved.",
    "Forgetting `-ErrorAction Stop` and then trusting `try`/`catch`.",
    "Opening remoting to everyone. WinRM should be reachable only from admin networks, and in a domain it should use Kerberos or HTTPS.",
    "Fixing \"scripts are disabled\" by setting Unrestricted machine-wide. Use `-Scope CurrentUser RemoteSigned`, or sign your scripts.",
  ],
  next: [
    { id: "ad-domains-ous", label: "Active Directory: Domains, OUs, Users and Groups" },
    { id: "linux-scripting-robust", label: "The bash side: Loops, Functions, Exit Codes and set -euo pipefail" },
  ],
};
