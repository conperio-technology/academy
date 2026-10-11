import { src, type OpsLessonData } from "../types.ts";

export const scriptingRobust: OpsLessonData = {
  parts: [
    {
      kind: "code",
      title: "Loops",
      blocks: [
        {
          lang: "bash",
          label: "loops.sh",
          code: src`
for f in *.csv; do
  echo "$f has $(wc -l < "$f") lines"
done

for i in 1 2 3; do
  echo "attempt $i"
done

for (( i = 0; i < 3; i++ )); do
  echo "index $i"
done

count=0
while [ "$count" -lt 3 ]; do
  count=$(( count + 1 ))
done
echo "count is $count"

printf 'web01 10.0.0.5\nweb02 10.0.0.6\n' > hosts.txt
while read -r name ip; do
  echo "$name is at $ip"
done < hosts.txt
`,
          output: src`
customer list.csv has 3 lines
orders.csv has 2 lines
attempt 1
attempt 2
attempt 3
index 0
index 1
index 2
count is 3
web01 is at 10.0.0.5
web02 is at 10.0.0.6
`,
        },
      ],
      notes: [
        "Run in a folder holding `orders.csv` and `customer list.csv`. `for f in *.csv` loops over matching filenames, and because `\"$f\"` is quoted the name with a space survives. Never loop over `$(ls)`: its output gets split on spaces.",
        "`for (( ... ))` is bash's C-style counting loop; `for i in $(seq 1 10)` is the portable way. `while` repeats as long as its command succeeds.",
        "`while read -r name ip; do ... done < file` is the standard way to process a file line by line: `read` splits each line on whitespace into the variables you name, and the last one gets the rest of the line. `-r` stops backslashes being treated as escapes.",
      ],
    },
    {
      kind: "code",
      title: "Exit codes: how every command reports success",
      blocks: [
        {
          lang: "bash",
          label: "codes.sh",
          code: src`
grep -q root /etc/passwd
echo "grep found it: $?"
grep -q nobody-here /etc/passwd
echo "grep found nothing: $?"
ls /nope 2>/dev/null
echo "ls on a missing path: $?"
nosuchcommand 2>/dev/null
echo "unknown command: $?"
true && echo "&& runs after success"
false || echo "|| runs after failure"
`,
          output: src`
grep found it: 0
grep found nothing: 1
ls on a missing path: 2
unknown command: 127
&& runs after success
|| runs after failure
`,
        },
      ],
      notes: [
        "Every command ends with an exit status from 0 to 255, kept in `$?` until the next command replaces it. 0 means success; anything else is a kind of failure, and each program documents what its numbers mean (grep: 1 is \"no match\", 2 is \"error\"). 127 is the shell's \"command not found\", 126 is \"found but not executable\", and 128 + N means \"killed by signal N\" (130 is Ctrl+C, 137 is kill -9).",
        "`a && b` runs b only if a succeeded; `a || b` runs b only if a failed. `mkdir -p out && cd out || exit 1` reads as: make it, go into it, or give up.",
        "Your script's exit status is the status of the last command it ran, or whatever you pass to `exit`. Schedulers, CI pipelines and systemd all read it, so make failures exit non-zero.",
      ],
    },
    {
      kind: "code",
      title: "Functions",
      blocks: [
        {
          lang: "bash",
          label: "ports.sh",
          code: src`
#!/usr/bin/env bash
log() {
  echo "[$(date +%H:%M:%S)] $*" >&2
}

is_port_number() {
  local value=$1
  [[ $value =~ ^[0-9]+$ ]] && (( value >= 1 && value <= 65535 ))
}

for p in 80 70000 http; do
  if is_port_number "$p"; then
    echo "$p: valid"
  else
    echo "$p: not a port"
  fi
done
`,
          output: src`
80: valid
70000: not a port
http: not a port
`,
        },
      ],
      notes: [
        "A function is a named group of commands. Its arguments are `$1`, `$2` and `$@` again (the script's own arguments are hidden while it runs). `local` keeps a variable inside the function; without it, every variable in bash is global.",
        "Functions don't return values the way C# or Python do. They return an exit status (the last command's, or `return N`), which is why `is_port_number` can sit straight in an `if`. To hand back data, print it and capture it: `result=$(my_function)`.",
        "`log` writes to standard error (`>&2`), so its messages show on screen without mixing into output another command might capture.",
      ],
    },
    {
      kind: "widget",
      widget: "strictMode",
      title: "Try it: set -euo pipefail",
      intro:
        "By default bash keeps going after a command fails. The usual first line of a serious script turns on three safety options. Toggle them and see what this deploy script does. Every result was captured from a real bash run.",
    },
    {
      kind: "text",
      title: "What the three options mean",
      paragraphs: [
        "`set -e` (errexit): exit as soon as a command fails. It deliberately ignores failures you're already handling: the condition of an `if` or `while`, any command before `&&` or `||`, and anything after `!`. So `grep -q x file || echo missing` is still allowed.",
        "`set -u` (nounset): treat expanding an unset variable as an error. It catches typos (`$TARGTE_DIR`) and missing configuration before they become `rm -rf \"$DIR/\"`. When a variable is genuinely optional, give it a default: `${DEPLOY_ENV:-staging}`.",
        "`set -o pipefail`: a pipeline normally reports the exit status of its last command only, so `grep ... | sort` looks fine even if grep failed. With pipefail it reports the last non-zero status in the pipeline.",
        "None of this makes a script correct; it makes it stop loudly instead of carrying on with bad data. Some failures still slip past `-e` (a failing command inside `$( )` used as part of another command, for example), so check the important things explicitly too.",
      ],
    },
    {
      kind: "code",
      title: "Putting it together: a script that fails safely and cleans up",
      blocks: [
        {
          lang: "bash",
          label: "backup.sh",
          code: src`
#!/usr/bin/env bash
set -euo pipefail

die() {
  echo "error: $*" >&2
  exit 1
}

[ $# -eq 1 ] || die "usage: backup.sh DIRECTORY"
src=$1
[ -d "$src" ] || die "$src is not a directory"

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT       # runs however the script ends

tar -czf "$work/backup.tar.gz" -C "$src" .
echo "backed up $(tar -tzf "$work/backup.tar.gz" | wc -l) entries from $src"
`,
        },
        {
          lang: "bash",
          code: src`
./backup.sh; echo "exit $?"
./backup.sh /nope; echo "exit $?"
./backup.sh site; echo "exit $?"
`,
          output: src`
error: usage: backup.sh DIRECTORY
exit 1
error: /nope is not a directory
exit 1
backed up 4 entries from site
exit 0
`,
        },
      ],
      notes: [
        "`site` here holds `index.html` and `css/a.css`; the 4 entries are `./`, those two files and the `css/` folder.",
        "`mktemp -d` makes a fresh, uniquely named temporary folder, so two copies of the script never trip over each other. `trap '...' EXIT` registers cleanup that runs when the script exits for any reason, including a failure stopped by `set -e`.",
        "Check your arguments first and fail with a usage message. It costs two lines and saves whoever runs the script next from guessing.",
      ],
    },
    {
      kind: "code",
      title: "Parameter expansion: defaults and trimming without extra commands",
      blocks: [
        {
          lang: "bash",
          code: src`
set -u
echo "env is ${"$"}{DEPLOY_ENV:-staging}"
DEPLOY_ENV=prod
echo "env is ${"$"}{DEPLOY_ENV:-staging}"
name="report.final.csv"
echo "${"$"}{name%.csv}"
echo "${"$"}{name##*.}"
echo "${"$"}{#name}"
`,
          output: src`
env is staging
env is prod
report.final
csv
16
`,
        },
      ],
      notes: [
        "`${VAR:-default}` uses the default when VAR is unset or empty, and is allowed under `set -u`. `${VAR:?message}` stops the script with that message instead.",
        "`%` removes the shortest match from the end and `##` the longest match from the start, so they strip extensions and paths. `${#VAR}` is the length.",
      ],
    },
    {
      kind: "lab",
      title: "Hands-on: loops, exit codes and a strict script",
      lesson: "scripting2",
    },
  ],
  quiz: [
    {
      question: "What does this print?",
      code: src`
for f in "a b" c; do echo "[$f]"; done
`,
      answer: "[a b] then [c], on two lines",
      distractors: ["[a] [b] [c], on three lines", "[a b c]", "[\"a b\"] then [c]"],
      why: "The quotes in the list make \"a b\" one item, so the loop runs twice. Quoting $f inside the loop keeps the space when it's printed.",
    },
    {
      question: "What is printed?",
      code: src`
false | true
echo $?
`,
      answer: "0",
      distractors: ["1", "127", "nothing, the script stops"],
      why: "Without pipefail a pipeline's status is its last command's, and true succeeded. With set -o pipefail it would print 1.",
    },
    {
      question: "This script prints nothing and exits with status 1. Why?",
      code: src`
#!/usr/bin/env bash
set -e
count=0
(( count++ ))
echo "count is $count"
`,
      answer: "(( count++ )) evaluates to the old value, 0, which counts as false, so set -e stops the script",
      distractors: ["count++ isn't valid bash", "set -e makes every variable read-only", "echo fails because count is a number"],
      why: "An arithmetic command succeeds when its value is non-zero. count++ returns the value before incrementing (0), so the command 'fails' and -e exits. Write count=$(( count + 1 )) or (( ++count )) instead.",
    },
    {
      question: "What does this print?",
      code: src`
f() { local x=5; return 3; }
f
echo "$? [$x]"
`,
      answer: "3 []",
      distractors: ["3 [5]", "0 [5]", "5 [3]"],
      why: "return sets the exit status, which $? reads right after the call. x was local to the function, so outside it's unset and expands to nothing.",
    },
    {
      question: "What does this print?",
      code: src`
n=0
printf "a\nb\n" | while read -r line; do n=$((n+1)); done
echo "n=$n"
`,
      answer: "n=0",
      distractors: ["n=2", "n=1", "an error"],
      why: "Each part of a pipeline runs in its own subshell (a copy of the shell), so the loop's n is a copy that disappears when the pipeline ends. Feed the loop with done < file or done < <(command) to keep the changes.",
    },
    {
      question: "A backup script must not keep going when the tar fails, but should treat a missing optional config file as fine. Which line does that under set -e?",
      answer: "[ -f extra.conf ] && source extra.conf || true",
      distractors: ["source extra.conf", "set +e at the top of the script", "tar ... ; echo $? > /dev/null"],
      why: "Commands in an && or || list are exempt from -e, and || true makes the whole line succeed whatever happens, so only this optional step is allowed to fail. set +e would switch the protection off for everything.",
    },
  ],
  pitfalls: [
    "Looping over `$(ls)` or `$(find ...)`: filenames with spaces get split. Use a glob (`for f in *.log`), or for find: `while IFS= read -r -d '' f; do ...; done < <(find . -name '*.log' -print0)`.",
    "Checking `$?` too late. Any command in between, even an `echo`, replaces it. Save it first: `cmd; status=$?`.",
    "Relying on `set -e` alone. It doesn't fire inside an `if` condition or a function called from one, which surprises everyone once. Check critical steps explicitly.",
    "A pipe into `while read` loses the loop's variable changes (the subshell quiz above). Redirect a file into `done` instead.",
  ],
  next: [
    { id: "linux-text-processing", label: "Text Processing: grep, sed, awk, cut, sort, uniq and xargs" },
    { id: "linux-cron", label: "Scheduling with cron and systemd Timers" },
  ],
};
