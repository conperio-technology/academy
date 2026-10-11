import { src, type OpsLessonData } from "../types.ts";

export const textProcessing: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "The pipes lesson introduced grep, sort, uniq and awk on a log file. This lesson fills in the rest of the toolbox and the options you actually reach for. Each tool reads lines of text (from files or from a pipe), does one job, and writes lines of text, so they combine freely.",
      ],
    },
    {
      kind: "table",
      title: "Which tool for which job",
      head: ["Tool", "Job", "Most-used options"],
      rows: [
        ["`grep`", "keep lines that match a pattern", "`-i` ignore case, `-v` invert, `-c` count, `-n` line numbers, `-r` search folders, `-E` extended regex, `-o` only the matching part, `-q` quiet (just the exit code)"],
        ["`cut`", "pull out columns by delimiter or character position", "`-d,` delimiter, `-f1,3` fields, `-c1-10` characters"],
        ["`sort`", "sort lines", "`-n` numeric, `-h` human sizes (2K, 1G), `-r` reverse, `-t,` delimiter, `-k3` by field 3, `-u` unique"],
        ["`uniq`", "collapse adjacent repeated lines", "`-c` count, `-d` only duplicates. Sort first."],
        ["`sed`", "edit a stream: substitute, delete or print lines", "`s/old/new/g`, `-n '5,10p'`, `'/pattern/d'`, `-i` edit the file in place, `-E` extended regex"],
        ["`awk`", "a small language for column-based text", "`-F,` field separator, `$1` fields, `NR` line number, `NF` field count, `BEGIN` and `END` blocks"],
        ["`tr`", "translate or delete single characters", "`tr a-z A-Z`, `tr -d '\\r'`, `tr -s ' '` squeeze repeats"],
        ["`xargs`", "turn input lines into command arguments", "`-n1` one per command, `-I{}` placeholder, `-0` null-separated input, `-P4` four at a time"],
        ["`head`, `tail`, `wc`", "first lines, last lines, counts", "`head -n 20`, `tail -n +2` (from line 2), `tail -f` (follow), `wc -l`"],
      ],
    },
    {
      kind: "widget",
      widget: "textToolbox",
      title: "Try it: one CSV, fifteen commands",
      intro: "Pick a command to see its real output against servers.csv, a small inventory of servers. Open the file first to see what's in it.",
    },
    {
      kind: "code",
      title: "Regular expressions in one minute",
      blocks: [
        {
          lang: "bash",
          code: src`
printf '%s\n' "2026-10-08 08:00:00 ERROR 10.0.0.5" | sed -E 's/^([0-9-]+) ([0-9:]+) ([A-Z]+).*/\3 at \2 on \1/'
echo "user=ana id=42" | grep -oE 'id=[0-9]+'
`,
          output: src`
ERROR at 08:00:00 on 2026-10-08
id=42
`,
        },
      ],
      notes: [
        "A regular expression (regex) is a pattern for text. The pieces you need most: `.` any character, `*` zero or more of the previous thing, `+` one or more, `[0-9]` any digit, `[^,]` anything except a comma, `^` start of line, `$` end of line, `(...)` a group, `a|b` either.",
        "grep and sed default to basic regular expressions, where `+`, `|` and `( )` need backslashes. `-E` switches to extended syntax, which is what most people expect. In sed, `\\1` to `\\9` in the replacement are what the groups matched.",
        "Wrap patterns in single quotes so the shell leaves `*`, `$` and `|` alone.",
      ],
    },
    {
      kind: "code",
      title: "Counting things: the sort | uniq -c | sort -rn idiom",
      blocks: [
        {
          lang: "bash",
          code: src`
printf 'b\na\nb\nc\na\nb\n' | sort | uniq -c | sort -rn
`,
          output: src`
      3 b
      2 a
      1 c
`,
        },
      ],
      notes: [
        "\"What are the most common X?\" is the most frequent question you'll ask of a log. Extract X (with awk, cut or grep -o), sort so duplicates sit together, count them with `uniq -c`, then sort the counts numerically, biggest first. Add `| head` for a top ten.",
      ],
    },
    {
      kind: "code",
      title: "xargs and find: acting on many files safely",
      blocks: [
        {
          lang: "bash",
          code: src`
find . -name '*.csv' -print0 | xargs -0 wc -l
printf 'x.log\ny.log\n' | xargs -n1 echo gzip
`,
          output: src`
8 ./servers.csv
gzip x.log
gzip y.log
`,
        },
      ],
      notes: [
        "`find -print0` ends each name with a null byte instead of a newline, and `xargs -0` splits on null bytes. Null can't appear in a filename, so this is the one combination that copes with spaces, quotes and even newlines in names.",
        "Put `echo` in front of the real command to see what xargs would run before you let it loose. `find` can often do the job alone: `find /var/log -name '*.gz' -mtime +30 -delete` removes compressed logs older than 30 days.",
      ],
    },
    {
      kind: "lab",
      title: "Hands-on: answer questions about servers.csv and the app log",
      lesson: "text",
    },
  ],
  quiz: [
    {
      question: "What does this print?",
      code: "printf '10\\n9\\n100\\n' | sort",
      answer: "10, 100, 9 (one per line)",
      distractors: ["9, 10, 100 (one per line)", "100, 10, 9 (one per line)", "10, 9, 100 (one per line)"],
      why: "Plain sort compares text character by character, and \"1\" sorts before \"9\". sort -n compares numbers and gives 9, 10, 100.",
    },
    {
      question: "What does this print?",
      code: "printf 'b\\na\\nb\\n' | uniq",
      answer: "b, a, b (one per line)",
      distractors: ["a, b (one per line)", "b, a (one per line)", "b (just once)"],
      why: "uniq only merges repeated lines that are next to each other. The two b lines aren't neighbours, so both stay. That's why it's almost always sort | uniq.",
    },
    {
      question: "What does this print?",
      code: "echo \"one two two\" | sed 's/two/2/'",
      answer: "one 2 two",
      distractors: ["one 2 2", "one two two", "2"],
      why: "s/// replaces only the first match on each line. Add the g flag, s/two/2/g, to replace every match.",
    },
    {
      question: "What does this print?",
      code: "echo hello world | awk '{print $2, $1}'",
      answer: "world hello",
      distractors: ["worldhello", "hello world", "$2 $1"],
      why: "awk splits each line on whitespace into $1, $2 and so on. A comma in print inserts the output separator, a space by default. Without the comma the fields would be glued together.",
    },
    {
      question: "You want the number of lines containing ERROR in app.log. Which is the odd one out?",
      answer: "grep ERROR app.log | uniq -c",
      distractors: ["grep -c ERROR app.log", "grep ERROR app.log | wc -l", "awk '/ERROR/ { n++ } END { print n }' app.log"],
      why: "The other three all count matching lines. uniq -c prints each distinct line with a count of its adjacent repeats, which isn't a total.",
    },
    {
      question: "Why use find ... -print0 | xargs -0 rm rather than find ... | xargs rm?",
      answer: "So filenames containing spaces or newlines are passed as single arguments",
      distractors: ["It's faster on large folders", "-0 makes rm ask before deleting", "Plain xargs can only handle one file"],
      why: "xargs normally splits its input on whitespace, so \"old report.log\" would become two arguments. Null-separated names can't be split by mistake.",
    },
  ],
  pitfalls: [
    "`sed -i` on macOS needs an argument (`sed -i '' 's/a/b/' f`); on Linux it doesn't. Scripts that must run on both use a temporary file or perl.",
    "`cut` and `awk -F,` don't understand CSV quoting: a field like `\"Oslo, Norway\"` splits in two. For real CSV, use a proper parser (Python's csv module, or `mlr`/`csvkit` if installed).",
    "`sort` order depends on the locale (language settings). For stable byte-order sorting in scripts, use `LC_ALL=C sort`.",
    "`grep pattern *` doesn't look in subfolders; use `grep -r pattern .`. And remember grep's exit status is 1 when nothing matched, which `set -e` treats as a failure.",
  ],
  next: [
    { id: "linux-pipes", label: "Pipes, Redirection and Searching Logs (the basics)" },
    { id: "linux-disks-logs", label: "Disks, Filesystems and Logs" },
  ],
};
