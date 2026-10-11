import { src, type OpsLessonData } from "../types.ts";

export const systemd: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "When a Linux machine boots, the kernel starts exactly one program, process 1, and everything else descends from it. On almost every current distribution (Ubuntu, Debian, RHEL, SUSE) that program is systemd. It starts services in the right order, restarts them when they crash, collects their logs, and stops them cleanly at shutdown.",
        "Everything systemd manages is a unit, described by a small text file. The kinds you'll meet: `.service` (a program to keep running, or a one-off job), `.timer` (run a service on a schedule, covered in the scheduling lesson), `.socket` (start a service when someone connects), `.mount` (a filesystem), and `.target` (a named group of units, like `multi-user.target`, the normal \"booted, no desktop\" state).",
        "A daemon is a program that runs in the background with no terminal, waiting for work: a web server, the SSH server, cron. Running your own app as a systemd service is how you turn \"it works when I start it in my terminal\" into \"it runs on the server\".",
      ],
    },
    {
      kind: "code",
      title: "A service unit file",
      blocks: [
        {
          lang: "ini",
          label: "/etc/systemd/system/academy-api.service",
          code: src`
[Unit]
Description=Academy API
After=network-online.target
Wants=network-online.target

[Service]
User=academy
WorkingDirectory=/opt/academy
Environment=ASPNETCORE_URLS=http://0.0.0.0:8080
ExecStart=/usr/bin/dotnet /opt/academy/Server.dll
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
`,
        },
      ],
      notes: [
        "`[Unit]` describes it and its ordering: `After=` only orders startup, `Wants=` actually pulls the other unit in. `[Service]` says how to run it: which user (never root unless it must), the working folder, environment variables, the command (`ExecStart=` needs an absolute path), and what to do when it stops (`Restart=`). `[Install]` is only read by `systemctl enable`: `WantedBy=multi-user.target` means \"start me during a normal boot\".",
        "Your own units go in `/etc/systemd/system/`. Packages install theirs in `/usr/lib/systemd/system/`; don't edit those, because the next package upgrade overwrites them. Use `sudo systemctl edit nginx` instead, which writes a drop-in file (`/etc/systemd/system/nginx.service.d/override.conf`) whose settings are layered on top.",
      ],
    },
    {
      kind: "table",
      title: "systemctl: the commands you'll use",
      head: ["Command", "What it does"],
      rows: [
        ["`systemctl status NAME`", "is it running, since when, its main process ID and its last few log lines"],
        ["`sudo systemctl start` / `stop` / `restart NAME`", "start or stop it now. Doesn't change what happens at the next boot"],
        ["`sudo systemctl reload NAME`", "ask it to re-read its configuration without stopping (only if the service supports it, like nginx)"],
        ["`sudo systemctl enable NAME`", "start it at every boot (creates a symlink in the target's `.wants` folder). `enable --now` also starts it immediately"],
        ["`sudo systemctl disable NAME`", "don't start it at boot. `mask` goes further: it can't be started at all, even by hand"],
        ["`sudo systemctl daemon-reload`", "re-read unit files after you change them. Without it systemd keeps using the old version"],
        ["`systemctl is-active NAME`, `is-enabled NAME`", "one-word answers, with matching exit codes for scripts"],
        ["`systemctl list-units --type=service --state=failed`", "every service that has failed"],
        ["`systemctl cat NAME`", "the unit file plus every drop-in, exactly as systemd sees it"],
      ],
      notes: ["\"Started\" and \"enabled\" are independent. The classic mistake is starting a new service, seeing it work, and finding it gone after the next reboot because it was never enabled."],
    },
    {
      kind: "widget",
      widget: "systemdService",
      title: "Try it: run a service, break it, reboot",
      intro: "Edit the restart policy, start and enable the service, then crash it in different ways. The status box and the journal update the way systemd's would.",
    },
    {
      kind: "code",
      title: "Reading the status",
      blocks: [
        {
          lang: "bash",
          code: "systemctl status academy-api",
          unverified: true,
          output: src`
● academy-api.service - Academy API
     Loaded: loaded (/etc/systemd/system/academy-api.service; enabled; preset: enabled)
     Active: active (running) since Mon 2026-10-12 09:00:03 UTC; 2h 14min ago
   Main PID: 2117 (dotnet)
      Tasks: 18 (limit: 4558)
     Memory: 96.4M (peak: 101.2M)
        CPU: 41.380s
     CGroup: /system.slice/academy-api.service
             └─2117 /usr/bin/dotnet /opt/academy/Server.dll

Oct 12 09:00:03 web01 systemd[1]: Started academy-api.service - Academy API.
Oct 12 09:00:04 web01 dotnet[2117]: Now listening on: http://0.0.0.0:8080
`,
        },
      ],
      notes: [
        "Read it top down: Loaded (where the unit file is, and whether it's enabled), Active (running, or `failed` with a reason such as `exit-code` or `signal`), the main process, and resource use. The CGroup line shows every process the service started; systemd tracks them all, so stopping the service stops its children too.",
        "Status pages its output through `less`; add `--no-pager` in scripts. The real thing colours the dot green, white or red.",
      ],
    },
    {
      kind: "code",
      title: "journalctl: the logs of every service in one place",
      blocks: [
        {
          lang: "bash",
          code: src`
journalctl -u academy-api --since "1 hour ago"   # one service, recent
journalctl -u academy-api -f                     # follow live, like tail -f
journalctl -b -p err                             # errors and worse, this boot
journalctl -b -1                                 # the previous boot (after a crash)
journalctl -u academy-api -n 50 --no-pager       # last 50 lines, for pasting
journalctl --disk-usage
`,
        },
        {
          lang: "bash",
          label: "a crash loop, as journalctl -u shows it",
          code: "journalctl -u academy-api --since 09:40",
          unverified: true,
          output: src`
Oct 12 09:41:07 web01 dotnet[2117]: Unhandled exception. System.InvalidOperationException: database unreachable
Oct 12 09:41:07 web01 systemd[1]: academy-api.service: Main process exited, code=exited, status=1/FAILURE
Oct 12 09:41:07 web01 systemd[1]: academy-api.service: Failed with result 'exit-code'.
Oct 12 09:41:10 web01 systemd[1]: academy-api.service: Scheduled restart job, restart counter is at 1.
Oct 12 09:41:10 web01 systemd[1]: Started academy-api.service - Academy API.
`,
        },
      ],
      notes: [
        "The journal stores logs from the kernel, systemd and every service's standard output and standard error, with metadata (unit, process ID, priority, boot). So a service doesn't need its own log file: anything it prints ends up here, searchable by unit and time.",
        "Priorities run from 0 (emerg) to 7 (debug); `-p err` shows err (3) and everything more severe. `--since` and `--until` accept times like `\"2026-10-12 09:00\"`, `yesterday` or `\"10 min ago\"`.",
        "On Ubuntu the journal is kept on disk in `/var/log/journal` and capped (by default at 10% of the filesystem, at most 4 GB). `sudo journalctl --vacuum-time=14d` trims it by hand.",
      ],
    },
    {
      kind: "steps",
      title: "A service won't start: the checklist",
      steps: [
        "`systemctl status NAME`: read the Active line and the last log lines. `status=203/EXEC` means the `ExecStart` path is wrong or not executable; `status=217/USER` means the `User=` doesn't exist.",
        "`journalctl -u NAME -n 100 --no-pager`: the app's own error is usually a few lines above systemd's \"Failed\" line.",
        "Run the `ExecStart` command by hand as the service's user (`sudo -u academy /usr/bin/dotnet /opt/academy/Server.dll`) to see the error directly. Remember the service doesn't get your shell's environment variables or working folder.",
        "Changed the unit file? `sudo systemctl daemon-reload`, then restart.",
        "Restarting in a loop and then stopping with \"Start request repeated too quickly\"? systemd gave up after 5 starts in 10 seconds (the default start limit). Fix the cause, then `sudo systemctl reset-failed NAME`.",
      ],
    },
  ],
  quiz: [
    {
      question: "You install a new service, run sudo systemctl start myapp, and it works. After the weekend's patching reboot it isn't running. What was missed?",
      answer: "sudo systemctl enable myapp",
      distractors: ["sudo systemctl daemon-reload", "Restart=always in the unit file", "sudo systemctl reload myapp"],
      why: "start only affects now. enable hooks the unit into a boot target (WantedBy=multi-user.target) so it starts at every boot. enable --now does both.",
    },
    {
      question: "You change Restart=no to Restart=on-failure in the unit file, then the app crashes. systemd doesn't restart it. Why?",
      answer: "systemd is still using the old unit file until you run systemctl daemon-reload",
      distractors: ["on-failure only applies after a reboot", "on-failure doesn't cover crashes", "Restart= only works for timers"],
      why: "systemd reads unit files into memory. After editing one you must run daemon-reload (systemctl status even warns that the file changed on disk).",
    },
    {
      question: "With Restart=on-failure, which of these does NOT trigger a restart?",
      answer: "The program finishes its work and exits with status 0",
      distractors: ["The program exits with status 1", "Someone runs kill -9 on its main process", "The program crashes with a segmentation fault"],
      why: "on-failure restarts on a non-zero exit, a fatal signal, a timeout or a watchdog failure. A clean exit (status 0) counts as success. Restart=always would restart that too.",
    },
    {
      question: "Where should you change a setting for nginx's unit, which came from the Ubuntu package?",
      answer: "With sudo systemctl edit nginx, which writes a drop-in under /etc/systemd/system/nginx.service.d/",
      distractors: [
        "Edit /usr/lib/systemd/system/nginx.service directly",
        "Edit /etc/nginx/nginx.conf",
        "Copy the unit into your home folder",
      ],
      why: "Files in /usr/lib are owned by the package and get replaced on upgrade. A drop-in in /etc survives upgrades and only overrides the settings you name.",
    },
    {
      question: "The server rebooted unexpectedly overnight. Which command shows the log from just before it went down?",
      answer: "journalctl -b -1",
      distractors: ["journalctl -b", "journalctl -f", "systemctl status"],
      why: "-b alone means the current boot; -b -1 is the previous one. This needs a persistent journal (on disk), which Ubuntu and most server distributions have.",
    },
  ],
  pitfalls: [
    "Forgetting `daemon-reload` after editing a unit. `systemctl status` warns you; read the warning.",
    "Relying on your shell's environment. Services start with a minimal environment and `/` as the working folder unless the unit sets `Environment=` and `WorkingDirectory=`.",
    "`ExecStart=` is not a shell: no pipes, `&&`, `~` or redirection. Point it at a script, or use `ExecStart=/bin/bash -c '...'` if you really must.",
    "Writing logs to your own file and forgetting rotation. Print to standard output and let the journal store, cap and search it.",
  ],
  next: [
    { id: "linux-cron", label: "Scheduling with cron and systemd Timers" },
    { id: "linux-processes", label: "Processes and Signals" },
  ],
};
