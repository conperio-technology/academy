import { src, type OpsLessonData } from "../types.ts";

export const processesServices: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Windows runs programs as processes, just like Linux: each has an ID (PID), its own memory, one or more threads, and runs as some user account. Task Manager shows them; so do `tasklist` in the old command prompt (cmd) and `Get-Process` in PowerShell.",
        "A service is Windows' word for a daemon: a program started by the Service Control Manager (SCM) rather than by a user, usually at boot, running in the background with no window. Services run in session 0, separate from the desktops of signed-in users, so a service can't pop up a dialog. Many small Windows services share one process called `svchost.exe`, which is why you see a dozen of them in Task Manager.",
        "Every service runs as an account. The built-in ones: LocalSystem (all-powerful on the machine, and acts as the computer's own account on the network), NetworkService (limited locally, the computer's account on the network), LocalService (limited, anonymous on the network). For your own apps, use a dedicated low-privilege account or a group managed service account (gMSA), an Active Directory account whose password Windows rotates automatically.",
      ],
    },
    {
      kind: "code",
      title: "Looking at services and processes",
      blocks: [
        {
          lang: "powershell",
          code: "Get-Service -Name Spooler, W32Time, wuauserv",
          unverified: true,
          output: src`
Status   Name               DisplayName
------   ----               -----------
Running  Spooler            Print Spooler
Running  W32Time            Windows Time
Stopped  wuauserv           Windows Update
`,
        },
        {
          lang: "powershell",
          code: src`
Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -ne 'Running' }
Get-CimInstance Win32_Service -Filter "Name='Spooler'" | Select-Object Name, StartName, PathName
`,
        },
        {
          lang: "cmd",
          code: src`
sc.exe query Spooler
sc.exe qc Spooler
`,
        },
      ],
      notes: [
        "The first command in the second block is a classic health check: automatic services that aren't running. (A few, like some update services, stop by design once their work is done.) `Win32_Service` adds what `Get-Service` doesn't show: which account the service runs as (`StartName`) and the program it runs (`PathName`).",
        "In PowerShell, write `sc.exe` in full: plain `sc` is an alias for `Set-Content`.",
      ],
    },
    {
      kind: "table",
      title: "Startup types",
      head: ["Startup type", "Meaning"],
      rows: [
        ["Automatic", "starts during boot"],
        ["Automatic (Delayed Start)", "starts about two minutes after boot, so the machine is usable sooner"],
        ["Manual", "starts only when something asks: a user, another service, or a trigger (some services start on an event, such as a USB device arriving)"],
        ["Disabled", "can't be started at all until the type is changed"],
      ],
      notes: ["Recovery actions (the Recovery tab in services.msc, or `sc.exe failure`) decide what happens when a service crashes: nothing, restart it, run a program or reboot the machine, for the first, second and later failures."],
    },
    {
      kind: "widget",
      widget: "winServices",
      title: "Try it: the Service Control Manager",
      intro: "Four services, one depending on another. The box underneath shows the PowerShell you'd type and what Windows says back.",
    },
    {
      kind: "text",
      title: "The registry",
      paragraphs: [
        "The registry is Windows' central configuration database: a tree of keys (like folders) holding values (name, type, data). Services, drivers, installed programs, user preferences and most policy settings live there. `regedit` browses it; PowerShell exposes it as drives (`HKLM:` and `HKCU:`) so the same `Get-ChildItem` and `Get-ItemProperty` you use on files work on keys.",
      ],
    },
    {
      kind: "table",
      title: "The parts you'll visit",
      head: ["Root key", "What's in it", "Example"],
      rows: [
        ["HKEY_LOCAL_MACHINE (HKLM)", "settings for the whole machine", "`HKLM\\SYSTEM\\CurrentControlSet\\Services\\Spooler` holds the Spooler service's configuration"],
        ["HKEY_CURRENT_USER (HKCU)", "settings for the signed-in user (loaded from their profile's NTUSER.DAT)", "`HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run` starts programs at that user's sign-in"],
        ["HKEY_USERS (HKU)", "every loaded user profile, by SID", "`HKU\\S-1-5-21-…` is someone's HKCU"],
        ["HKEY_CLASSES_ROOT (HKCR)", "file associations and COM registrations (a merged view of parts of HKLM and HKCU)", "`.txt` opens with Notepad"],
      ],
      notes: [
        "Value types you'll meet: `REG_SZ` (text), `REG_EXPAND_SZ` (text with %VARIABLES%), `REG_MULTI_SZ` (a list of strings), `REG_DWORD` (a 32-bit number, often 0 or 1 for off or on) and `REG_BINARY`.",
        "Programs installed for everyone register under `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall` (and the `WOW6432Node` copy for 32-bit programs); that's where inventory scripts look.",
      ],
    },
    {
      kind: "code",
      title: "Reading the registry",
      blocks: [
        {
          lang: "powershell",
          code: src`
Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' |
    Select-Object ProductName, DisplayVersion, CurrentBuild
`,
          unverified: true,
          output: src`
ProductName    DisplayVersion CurrentBuild
-----------    -------------- ------------
Windows 10 Pro 24H2          26100
`,
        },
        {
          lang: "cmd",
          code: 'reg query "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Spooler" /v Start',
          unverified: true,
          output: src`
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Spooler
    Start    REG_DWORD    0x2
`,
        },
      ],
      notes: [
        "Yes, that's a Windows 11 machine reporting \"Windows 10 Pro\": `ProductName` was never updated for Windows 11, and build 22000 or higher is how you tell them apart. A good reminder to check what a value really means before you script against it.",
        "A service's `Start` value is its startup type: 2 automatic, 3 manual, 4 disabled (delayed start is 2 plus a separate `DelayedAutostart` value of 1).",
        "Back up before you edit: `reg export` a key to a file, or export from regedit. A wrong value under `HKLM\\SYSTEM` can stop a machine booting.",
      ],
    },
  ],
  quiz: [
    {
      question: "A service is set to Manual. What happens to it after a reboot?",
      answer: "It stays stopped until something (a user, a program, another service or a trigger) starts it",
      distractors: ["It starts about two minutes after boot", "It starts with the machine like Automatic", "It can't be started until the type is changed"],
      why: "Manual means on demand. Two minutes after boot is Automatic (Delayed Start); can't be started at all is Disabled.",
    },
    {
      question: "In PowerShell you type sc query Spooler. Nothing is printed, but a file named query appears in the current folder. Why?",
      answer: "In PowerShell, sc is an alias for Set-Content; you need sc.exe (or Get-Service Spooler)",
      distractors: ["sc was removed in Windows 11", "You need to run it as administrator", "Spooler isn't a real service name"],
      why: "PowerShell aliases take priority over programs on the PATH, so sc query Spooler runs Set-Content -Path query -Value Spooler and silently writes a file. Typing the .exe skips the alias.",
    },
    {
      question: "Which registry root holds settings that apply to every user of the machine?",
      answer: "HKEY_LOCAL_MACHINE",
      distractors: ["HKEY_CURRENT_USER", "HKEY_CLASSES_ROOT", "HKEY_CURRENT_CONFIG"],
      why: "HKLM is machine-wide; HKCU is the signed-in user's own settings, loaded from their profile.",
    },
    {
      question: "Your service needs to read a file share on another server. Which account should it run as?",
      answer: "A dedicated domain account or group managed service account given just that access",
      distractors: ["LocalSystem, because it can do anything", "The administrator's own account", "LocalService"],
      why: "Least privilege: a dedicated account can be granted exactly the share access it needs and nothing else. LocalSystem is far too powerful, a person's account breaks when they leave, and LocalService is anonymous on the network.",
    },
  ],
  pitfalls: [
    "Running services as a person's account. When they change their password or leave, the service stops. Use a service account or gMSA.",
    "Disabling services you don't recognise to \"speed things up\". Look a service up first; many are dependencies of something you need.",
    "Editing the registry without a backup, or on the wrong machine. Export the key first.",
  ],
  next: [
    { id: "win-event-logs", label: "Event Viewer and Windows Logs" },
    { id: "linux-systemd", label: "The Linux equivalent: systemd Services and journalctl" },
  ],
};
