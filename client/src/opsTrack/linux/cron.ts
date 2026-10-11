import { src, type OpsLessonData } from "../types.ts";

export const cron: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Servers are full of jobs that should run on a clock: nightly backups, clearing old files, a report every Monday, renewing certificates. The classic tool is cron, a daemon that wakes up every minute, checks its tables, and runs whatever is due. On systemd distributions there's also the systemd timer, which does the same job with better logging. You'll meet both.",
      ],
    },
    {
      kind: "code",
      title: "A crontab",
      blocks: [
        {
          lang: "text",
          label: "crontab -e",
          code: src`
# m  h  dom mon dow  command
  30 7  *   *   1-5  /opt/reports/daily-summary.sh
  */15 * *  *   *    /usr/local/bin/check-disk.sh >> /var/log/check-disk.log 2>&1
  0  2  1   *   *    /opt/backup/monthly.sh
  @reboot            /opt/academy/warm-cache.sh
`,
        },
      ],
      notes: [
        "Each line is a schedule (five fields: minute, hour, day of month, month, day of week) followed by a command. `*` means every value, `1-5` a range, `*/15` every 15th value, `1,15` a list. Day of week runs 0 to 7, where both 0 and 7 are Sunday; names like `mon` and `jan` work too.",
        "`crontab -e` edits your own table in an editor, `crontab -l` lists it, and `crontab -r` deletes it without asking (it's next to `-e` on the keyboard; be careful). System-wide jobs live in `/etc/crontab` and `/etc/cron.d/`, which have an extra field for the user to run as, plus drop-in folders `/etc/cron.daily/` and friends.",
        "Cron runs commands with a tiny environment: `PATH` is often just `/usr/bin:/bin`, no `HOME` settings from your shell profile, and the working folder is your home. Use absolute paths, and send output to a file (`>> file 2>&1`), because otherwise cron tries to email it and, with no mail system set up, it just vanishes.",
      ],
    },
    {
      kind: "widget",
      widget: "cronExplainer",
      title: "Try it: read and write schedules",
      intro: "Type a schedule to see it in plain English and its next run times, counting from Monday 12 October 2026, 09:30. Then try the challenges.",
    },
    {
      kind: "text",
      title: "The day-of-month and day-of-week trap",
      paragraphs: [
        "When both day fields are restricted, cron runs the job when EITHER matches, not both. `0 0 13 * 5` doesn't mean \"Friday the 13th\"; it means \"every 13th, and also every Friday\". If either field starts with `*`, the other one alone decides. Try it in the widget. To get \"Friday the 13th\" you schedule every 13th and test the weekday inside the command: `[ \"$(date +%u)\" = 5 ] && ...`.",
      ],
    },
    {
      kind: "code",
      title: "systemd timers: the same job, the systemd way",
      blocks: [
        {
          lang: "ini",
          label: "/etc/systemd/system/daily-summary.service",
          code: src`
[Unit]
Description=Daily summary report

[Service]
Type=oneshot
User=reports
ExecStart=/opt/reports/daily-summary.sh
`,
        },
        {
          lang: "ini",
          label: "/etc/systemd/system/daily-summary.timer",
          code: src`
[Unit]
Description=Run the daily summary on weekday mornings

[Timer]
OnCalendar=Mon..Fri *-*-* 07:30:00
Persistent=true
RandomizedDelaySec=2min

[Install]
WantedBy=timers.target
`,
        },
        {
          lang: "bash",
          label: "check the schedule before you enable it",
          code: 'systemd-analyze calendar --iterations=3 "Mon..Fri *-*-* 07:30:00"',
          output: src`
Normalized form: Mon..Fri *-*-* 07:30:00
    Next elapse: Mon 2026-10-12 07:30:00 UTC
       From now: 1 day 10h left
   Iteration #2: Tue 2026-10-13 07:30:00 UTC
       From now: 2 days left
   Iteration #3: Wed 2026-10-14 07:30:00 UTC
       From now: 3 days left
`,
        },
        {
          lang: "bash",
          code: src`
sudo systemctl daemon-reload
sudo systemctl enable --now daily-summary.timer
systemctl list-timers daily-summary.timer
journalctl -u daily-summary.service
`,
        },
      ],
      notes: [
        "A timer is a pair: a `.service` that does the work once (`Type=oneshot`), and a `.timer` with the same name that says when. You enable the timer, not the service. The output above was captured on a Saturday evening, hence \"1 day 10h left\".",
        "What you gain over cron: every run's output lands in the journal (`journalctl -u daily-summary`); `Persistent=true` runs a missed job at the next boot if the machine was off at 07:30; `RandomizedDelaySec` spreads load when a hundred servers share a schedule; `systemctl list-timers` shows when each last ran and runs next; and the job gets the resource limits and sandboxing options of any service.",
        "`OnCalendar=` uses its own syntax: `daily`, `weekly`, `Mon *-*-* 09:00`, `*:0/15` (every 15 minutes). `systemd-analyze calendar` checks an expression without changing anything.",
      ],
    },
    {
      kind: "table",
      title: "cron or timer?",
      head: ["", "cron", "systemd timer"],
      rows: [
        ["Setup", "one line", "two small files"],
        ["Where output goes", "email, or wherever you redirect it", "the journal, with the exit status"],
        ["Missed runs (machine was off)", "skipped (anacron covers daily jobs on desktops)", "`Persistent=true` catches up"],
        ["See what's scheduled", "`crontab -l`, plus several system folders", "`systemctl list-timers`"],
        ["Available on", "every Unix-like system, including containers without systemd", "systemd systems"],
      ],
      notes: ["On Windows the equivalent is Task Scheduler (`schtasks`, or `Register-ScheduledTask` in PowerShell)."],
    },
  ],
  quiz: [
    {
      question: "What does 0 */6 * * * run?",
      answer: "At 00:00, 06:00, 12:00 and 18:00 every day",
      distractors: ["Every 6 minutes", "Once, six hours after cron starts", "At minute 6 of every hour"],
      why: "The first field (minute) is 0, and the second (hour) is every 6th hour starting from 0. The widget shows the same four times.",
    },
    {
      question: "Which schedule runs at 23:45 every Sunday?",
      answer: "45 23 * * 0",
      distractors: ["23 45 * * 0", "45 23 0 * *", "45 23 * * 1"],
      why: "Minute comes first, then hour. Day of week 0 (or 7) is Sunday; day of month 0 isn't valid at all.",
    },
    {
      question: "A script works when you run it, but does nothing from cron. Its first command is mysqldump, installed in /usr/local/mysql/bin. What's the likely cause?",
      answer: "cron's PATH doesn't include /usr/local/mysql/bin, so mysqldump isn't found",
      distractors: ["cron can't run shell scripts", "cron only runs as root", "The script needs to be in /etc/cron.d"],
      why: "cron uses a minimal environment that doesn't read your shell profile. Use absolute paths or set PATH at the top of the crontab or script, and redirect output to a log so you can see errors like command not found.",
    },
    {
      question: "What does 0 9 1 * mon run?",
      answer: "At 09:00 on the 1st of every month, and also at 09:00 every Monday",
      distractors: ["At 09:00 only on Mondays that fall on the 1st", "At 09:00 on the first Monday of each month", "At 09:00 every day in January"],
      why: "Both day fields are restricted, so cron runs when either matches. \"First Monday of the month\" needs a check inside the command.",
    },
    {
      question: "The server was off over the weekend. Which setup still runs the Saturday 03:00 backup when it comes back on Monday?",
      answer: "A systemd timer with OnCalendar=Sat 03:00 and Persistent=true",
      distractors: ["A crontab line 0 3 * * 6", "A crontab line @reboot", "A systemd timer with OnBootSec=3h"],
      why: "Persistent=true records the last run on disk and runs a missed one at the next opportunity. Plain cron simply skips runs that fell while the machine was off.",
    },
  ],
  pitfalls: [
    "Relative paths and missing environment variables in cron jobs. Test with `env -i /bin/sh -c 'your command'` to get close to cron's environment.",
    "No output capture. Add `>> /var/log/job.log 2>&1` or use a systemd timer, or you'll never know it failed.",
    "Overlapping runs: a job every 5 minutes that sometimes takes 7. Guard it with `flock -n /run/lock/job.lock command` so a second copy exits instead of piling up.",
    "Time zones and daylight saving: local times like 02:30 skip or repeat on the night the clocks change. Most Linux crons compensate for fixed-time jobs, but other schedulers may not, and the job's timing still shifts. Servers usually run in UTC to avoid the question.",
  ],
  next: [
    { id: "linux-systemd", label: "systemd Services and journalctl" },
    { id: "linux-scripting-robust", label: "Loops, Functions, Exit Codes and set -euo pipefail" },
  ],
};
