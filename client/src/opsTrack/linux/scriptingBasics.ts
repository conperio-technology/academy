import { src, type OpsLessonData } from "../types.ts";

export const scriptingBasics: OpsLessonData = {
  parts: [
    {
      kind: "code",
      title: "Your first script",
      blocks: [
        {
          lang: "bash",
          label: "greet.sh",
          code: src`
#!/usr/bin/env bash
# greet.sh: say hello to everyone named on the command line
name="$1"
echo "Script: $0"
echo "First argument: $name"
echo "Number of arguments: $#"
echo "All arguments: $@"
`,
        },
        {
          lang: "bash",
          label: "running it",
          code: src`
chmod +x greet.sh
./greet.sh Ana "Bo Li" Cy
`,
          output: src`
Script: ./greet.sh
First argument: Ana
Number of arguments: 3
All arguments: Ana Bo Li Cy
`,
        },
      ],
      notes: [
        "A script is a text file of commands that the shell runs top to bottom, exactly as if you'd typed them. The first line, the shebang (`#!` followed by a program), tells the kernel which program should read the file. `#!/usr/bin/env bash` finds bash wherever it's installed; `#!/bin/sh` asks for the plain POSIX shell, which on Ubuntu is dash and in this course's virtual machine is BusyBox.",
        "`chmod +x` marks the file as executable so you can run it as `./greet.sh`. The `./` matters: the shell only searches the folders in `PATH` for commands, and the current folder isn't one of them. `bash greet.sh` also works and needs no execute permission.",
        "Inside the script, `$1`, `$2` and so on are the arguments, `$#` is how many there are, `$@` is all of them, and `$0` is the script's own name. `\"Bo Li\"` arrived as one argument because the quotes kept it together on the command line.",
      ],
    },
    {
      kind: "code",
      title: "Variables, command substitution and arithmetic",
      blocks: [
        {
          lang: "bash",
          label: "vars.sh",
          code: src`
count=$(printf 'a\nb\nc\n' | wc -l)
echo "There are $count lines"
echo "Next year is $(( 2026 + 1 ))"
x=7
echo "$x squared is $(( x * x ))"
greeting = "hi"
`,
          output: src`
There are 3 lines
Next year is 2027
7 squared is 49
vars.sh: line 6: greeting: command not found
`,
        },
      ],
      notes: [
        "`name=value` with no spaces around `=` sets a variable. With spaces, bash reads `greeting` as a command name and `=` and `\"hi\"` as its arguments, hence `command not found`. Every value is a string; there are no types.",
        "`$(command)` is command substitution: run the command and paste its output in place. `$(( ... ))` is arithmetic on whole numbers (`$(( 7 / 2 ))` is 3); inside it you can drop the `$` from variable names.",
        "By convention, environment variables that other programs see (`PATH`, `HOME`) are UPPER CASE, and your script's own variables are lower case so you never overwrite one by accident. `export NAME=value` passes a variable on to the programs your script starts.",
      ],
    },
    {
      kind: "code",
      title: "Quoting: the rule that prevents most shell bugs",
      blocks: [
        {
          lang: "bash",
          label: "quotes.sh",
          code: src`
file="quarterly report.txt"
echo "Double quotes expand: $file"
echo 'Single quotes do not: $file'
printf '[%s]\n' $file
printf '[%s]\n' "$file"
`,
          output: src`
Double quotes expand: quarterly report.txt
Single quotes do not: $file
[quarterly]
[report.txt]
[quarterly report.txt]
`,
        },
      ],
      notes: [
        "`printf '[%s]\\n'` prints each argument it receives in brackets, which makes the splitting visible: unquoted, the value became two arguments. A command like `rm $file` would try to delete two files called `quarterly` and `report.txt`.",
        "The rule: put double quotes around every `$variable` and `$(substitution)` unless you have a specific reason not to. Use single quotes for text that must reach a command untouched, such as an awk program or a regular expression.",
      ],
    },
    {
      kind: "widget",
      widget: "wordSplitting",
      title: "Try it: how many arguments does the command get?",
      intro: "Change the value and watch what each form hands to the command. Each box is one argument.",
    },
    {
      kind: "code",
      title: "Conditionals: if, test and case",
      blocks: [
        {
          lang: "bash",
          label: "check-disk.sh",
          code: src`
#!/usr/bin/env bash
used=$1   # percent used, passed in for the demo

if [ "$used" -ge 90 ]; then
  echo "CRITICAL: ${"$"}{used}% used"
elif [ "$used" -ge 75 ]; then
  echo "WARNING: ${"$"}{used}% used"
else
  echo "OK: ${"$"}{used}% used"
fi
`,
        },
        {
          lang: "bash",
          code: src`
./check-disk.sh 95; ./check-disk.sh 80; ./check-disk.sh 12
`,
          output: src`
CRITICAL: 95% used
WARNING: 80% used
OK: 12% used
`,
        },
        {
          lang: "bash",
          label: "case.sh",
          code: src`
for env in prod staging dev-ana qa; do
  case "$env" in
    prod)      echo "$env: needs approval" ;;
    staging)   echo "$env: deploy on merge" ;;
    dev-*)     echo "$env: personal sandbox" ;;
    *)         echo "$env: unknown environment" ;;
  esac
done
`,
          output: src`
prod: needs approval
staging: deploy on merge
dev-ana: personal sandbox
qa: unknown environment
`,
        },
      ],
      notes: [
        "`if` runs a command and checks its exit status: 0 means true, anything else false. `[` is a command too (another name for `test`), which is why it needs spaces around it and around every operator: `[ \"$used\" -ge 90 ]`. Braces mark where the variable name ends: `${used}` works the same as `$used` before `%`, but you need them before letters, digits or `_`, as in `${used}MB`.",
        "`case` compares one value against shell patterns (the same wildcards as filenames) and runs the first branch that matches. `;;` ends a branch and `*)` is the catch-all. It reads far better than a long chain of `elif`.",
        "Bash also has `[[ ... ]]`, which doesn't word-split variables and adds `=~` for regular expressions and `&&` and `||` inside the brackets. It isn't POSIX, and neither is bash's `(( ))` arithmetic test, so neither exists in `#!/bin/sh` scripts on every system. The lab's BusyBox shell accepts only a few `[[ ]]` forms (`=`, `=~`, `&&`): it still word-splits variables, reads `<` and `>` as redirections, and has no `(( ))`. In the lab, stick to `[ ]` and `$(( ))`.",
      ],
    },
    {
      kind: "table",
      title: "The test operators you'll use most",
      head: ["Test", "True when", "Example"],
      rows: [
        ["`-e path`", "the path exists (file, folder or anything else)", "`[ -e /etc/hosts ]`"],
        ["`-f path` / `-d path`", "it's a regular file / a directory", "`[ -d \"$backup_dir\" ]`"],
        ["`-r`, `-w`, `-x`", "you can read / write / execute it", "`[ -x ./deploy.sh ]`"],
        ["`-s path`", "the file exists and isn't empty", "`[ -s errors.txt ]`"],
        ["`-z \"$s\"` / `-n \"$s\"`", "the string is empty / not empty", "`[ -z \"$1\" ] && echo 'no argument'`"],
        ["`\"$a\" = \"$b\"` / `!=`", "strings equal / differ", "`[ \"$env\" = prod ]`"],
        ["`-eq -ne -lt -le -gt -ge`", "numeric comparisons", "`[ \"$count\" -gt 0 ]`"],
        ["`! test`", "the test is false", "`[ ! -f lockfile ]`"],
      ],
      notes: ["In bash, `<` and `>` inside `[[ ]]` compare as text, not numbers, so `[[ 10 < 9 ]]` is true. Use `-lt` and friends, or bash's `(( 10 < 9 ))`, for numbers; in the lab's BusyBox shell, use `[ 10 -lt 9 ]`."],
    },
    {
      kind: "lab",
      title: "Hands-on: write and run scripts on a real Linux machine",
      lesson: "scripting",
    },
  ],
  quiz: [
    {
      question: "What does this print?",
      code: src`
name="Ana Li"
echo 'Hello $name'
`,
      answer: "Hello $name",
      distractors: ["Hello Ana Li", "Hello Ana", "Hello"],
      why: "Single quotes switch off every expansion, so the dollar sign and the name are printed literally. Double quotes would give Hello Ana Li.",
    },
    {
      question: "What does this print?",
      code: src`
x=5
y=x+1
echo $y
`,
      answer: "x+1",
      distractors: ["6", "5+1", "an error"],
      why: "Shell variables are strings, and nothing here asks for arithmetic, so y holds the three characters x+1. You'd write y=$(( x + 1 )) to get 6.",
    },
    {
      question: "In a folder containing a file called \"my file.txt\", what does the last line do?",
      code: src`
f="my file.txt"
ls $f
`,
      answer: "Fails twice: ls: cannot access 'my' and ls: cannot access 'file.txt'",
      distractors: ["Lists my file.txt", "Lists every file in the folder", "Prints nothing and succeeds"],
      why: "Unquoted, $f is split on the space into two arguments, my and file.txt, and neither exists. ls exits with status 2. ls \"$f\" would work.",
    },
    {
      question: "In bash, which branch runs?",
      code: src`
if [[ 10 > 9 ]]; then echo bigger; else echo smaller; fi
`,
      answer: "smaller",
      distractors: ["bigger", "neither: it's a syntax error", "both"],
      why: "Inside bash's [[ ]], > compares strings in dictionary order, and \"10\" sorts before \"9\" because 1 comes before 9. For numbers use [ 10 -gt 9 ] or bash's (( 10 > 9 )). The lab's BusyBox shell reads that > as a redirection instead: it creates a file named 9 and prints bigger.",
    },
    {
      question: "A script is run as ./deploy.sh \"web 01\" prod. What is $#?",
      answer: "2",
      distractors: ["3", "1", "0"],
      why: "Quotes on the command line group \"web 01\" into one argument, so there are two: web 01 and prod.",
    },
    {
      question: "What does echo \"Total: $(( 7 / 2 ))\" print?",
      answer: "Total: 3",
      distractors: ["Total: 3.5", "Total: 4", "Total: 7 / 2"],
      why: "Shell arithmetic only does whole numbers and drops the remainder. For decimals, hand the sum to awk or bc.",
    },
  ],
  pitfalls: [
    "Spaces around `=` in an assignment (`x = 5`) run a command called x. Assignments have no spaces; tests with `[ ]` need spaces everywhere.",
    "Unquoted variables. Quote every `\"$var\"` and `\"$(cmd)\"`. The day a filename has a space in it, or a variable is empty, the unquoted version does something you didn't ask for.",
    "Windows line endings. A script saved on Windows has a carriage return at the end of every line, and fails with odd errors like `$'\\r': command not found` or `/usr/bin/env: 'bash\\r': No such file or directory`. Convert it with `dos2unix` or `sed -i 's/\\r$//' script.sh`.",
    "Writing `#!/bin/sh` and then using bash features. On Ubuntu /bin/sh is dash, which doesn't know `[[`, arrays or `(( ))` as a command. Use `#!/usr/bin/env bash` if you use bash.",
  ],
  next: [
    { id: "linux-scripting-robust", label: "Loops, Functions, Exit Codes and set -euo pipefail" },
    { id: "linux-pipes", label: "Pipes, Redirection and Searching Logs" },
  ],
};
