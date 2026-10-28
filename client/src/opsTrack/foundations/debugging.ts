import { src, type OpsLessonData } from "../types.ts";

export const debugging: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Debugging is finding out why the program does what it does instead of what you meant. Guessing and changing things until the symptom goes away is slow, and it often hides the bug rather than fixing it. A systematic approach is faster: reproduce the failure, narrow down where it happens, form a hypothesis, test it, and fix the cause.",
        "This lesson walks through that loop and the tools for each step: reading a stack trace, breakpoints and watches in a debugger, logging, binary search through history with git bisect, and explaining the problem out loud.",
      ],
    },
    {
      kind: "steps",
      title: "The debugging loop",
      steps: [
        "Reproduce it. Find the exact input, data and steps that make it fail, and make the reproduction as small and fast as you can. A bug you can trigger in one command is half fixed. If it only happens sometimes, note what differs between runs: timing, data, environment, load.",
        "Read the evidence. The full error message and stack trace, the logs around the time, what changed recently (a deploy, a dependency, a config value). Read the actual message; it often says exactly what is wrong.",
        "Narrow it down. Halve the search space each step: comment out half the code, bisect the commits, feed half the input, check the value at the midpoint of the pipeline. Binary search beats reading every line.",
        "Form a hypothesis and test it. \"The price is null because the plum entry is missing from the table\" predicts something you can check. If the check disagrees, the hypothesis was wrong; don't bend the evidence to fit it.",
        "Fix the cause, not the symptom. Catching and ignoring the exception makes the error go away and keeps the bug. Ask why the bad value got there.",
        "Prove it with a test: write a failing test that reproduces the bug before fixing it, so it can never quietly come back. Then look for the same mistake elsewhere.",
      ],
    },
    {
      kind: "code",
      title: "Reading a stack trace",
      blocks: [
        {
          lang: "python",
          label: "orders.py",
          code: src`
def load_prices():
    return {"apple": 0.5, "pear": 0.75}


def line_total(item, qty, prices):
    return prices[item] * qty


def order_total(order):
    prices = load_prices()
    return sum(line_total(item, qty, prices) for item, qty in order)


print(order_total([("apple", 4), ("pear", 2)]))
print(order_total([("apple", 1), ("plum", 3)]))`,
          output: src`
3.5
Traceback (most recent call last):
  File ".../orders.py", line 15, in <module>
    print(order_total([("apple", 1), ("plum", 3)]))
          ~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File ".../orders.py", line 11, in order_total
    return sum(line_total(item, qty, prices) for item, qty in order)
  File ".../orders.py", line 11, in <genexpr>
    return sum(line_total(item, qty, prices) for item, qty in order)
               ~~~~~~~~~~^^^^^^^^^^^^^^^^^^^
  File ".../orders.py", line 6, in line_total
    return prices[item] * qty
           ~~~~~~^^^^^^
KeyError: 'plum'`,
        },
      ],
      notes: [
        "Run with Python 3.13; the folder in the paths is shortened to `...`. Read a Python traceback from the bottom up: the last line is the error (a KeyError for the key 'plum'), and the frame just above it is where it was raised, line 6 in line_total. Each frame above that is a caller, back to the line that started it. The ^^^ markers point at the exact expression.",
        "A .NET stack trace lists the same frames the other way round: the exception type and message first, then `at Namespace.Class.Method() in File.cs:line 6`, with the innermost call at the top. Build in Debug, or ship the .pdb files, to get file names and line numbers. Look for the first frame in your own code; frames inside the framework are rarely where the mistake is.",
        "The bug here isn't line 6; it's that an order can contain an item with no price. Whether the fix is validating orders, a default price, or a clear error is a product decision, which is why the trace alone doesn't tell you.",
      ],
    },
    {
      kind: "terms",
      title: "Debugger tools",
      terms: [
        { term: "Breakpoint", meaning: "pause the program when it reaches a line, so you can look at every variable. Set one just before the failure, not at the start of main." },
        { term: "Conditional breakpoint", meaning: "pause only when a condition is true, such as item == \"plum\" or i == 9999, instead of clicking Continue thousands of times." },
        { term: "Step over, step into, step out", meaning: "run the next line; go inside the function it calls; finish the current function and stop in its caller." },
        { term: "Watch and locals", meaning: "the values of chosen expressions and all local variables at the paused line, updated as you step." },
        { term: "Call stack window", meaning: "the same frames as a stack trace, live: click a caller to see its variables at the moment it made the call." },
        { term: "Exception breakpoints", meaning: "break the moment an exception is thrown, even if something catches it later, which finds errors that are swallowed." },
        { term: "Logpoint (tracepoint)", meaning: "a breakpoint that prints a message instead of pausing; useful when pausing changes the timing and hides the bug." },
        { term: "Attach to process and post-mortem", meaning: "connect the debugger to an already running program, or open a crash dump (dotnet-dump, a core file, pdb.pm()) to inspect the state at the crash." },
      ],
    },
    {
      kind: "text",
      title: "Logging and printf debugging",
      paragraphs: [
        "A quick print of a value is a legitimate tool, especially for code that runs remotely, in a loop or in parallel, where stepping through is awkward. Print the values you are unsure about, with labels, and delete the prints when you're done. In production you can't attach a debugger, so the logs you wrote beforehand are all you have: log at the boundaries (requests in and out, calls to other services, decisions taken), with an id that ties together the lines of one request, and at the right level (debug, information, warning, error).",
      ],
    },
    {
      kind: "code",
      title: "Finding the commit that broke it: git bisect",
      blocks: [
        {
          lang: "bash",
          code: src`
git bisect start
git bisect bad                 # the current commit is broken
git bisect good HEAD~7         # this old one worked
git bisect run python3 test_tax.py
git bisect reset`,
          output: src`
status: waiting for both good and bad commits
status: waiting for good commit(s), bad commit known
Bisecting: 3 revisions left to test after this (roughly 2 steps)
[6f44848bd10ff5d9cfab84de405763c8e30c7717] Change 4
running 'python3' 'test_tax.py'
Bisecting: 1 revision left to test after this (roughly 1 step)
[b12378bcfe25350a88aff9e38fb863021e6bb568] Change 6
running 'python3' 'test_tax.py'
Bisecting: 0 revisions left to test after this (roughly 0 steps)
[cfa4d1a95cf31c7d8e51943fd89cfc31ade4cbfd] Change 5
running 'python3' 'test_tax.py'
b12378bcfe25350a88aff9e38fb863021e6bb568 is the first bad commit
commit b12378bcfe25350a88aff9e38fb863021e6bb568
Author: Dev <dev@example.com>
Date:   Tue Oct 6 12:00:00 2026 +0000

    Change 6

 notes.txt | 1 +
 tax.py    | 2 +-
 2 files changed, 2 insertions(+), 1 deletion(-)
bisect found first bad commit
Previous HEAD position was cfa4d1a Change 5
Switched to branch 'main'`,
        },
      ],
      notes: [
        "The repository has eight commits; somewhere a VAT rate of 20 became 2. `test_tax.py` exits 0 when vat(100) is 20 and 1 otherwise, and `git bisect run` uses that exit code to mark each commit good or bad. It found the culprit in three test runs instead of eight; a thousand commits would take about ten.",
        "Without a script, run `git bisect good` or `git bisect bad` by hand after testing each commit it checks out. `git bisect skip` handles a commit that doesn't build.",
      ],
    },
    {
      kind: "text",
      title: "When you're stuck",
      paragraphs: [
        "Explain the problem out loud, line by line, to a colleague or to a rubber duck on your desk. Saying what each line should do forces you to check assumptions you skipped while reading, and the bug often appears halfway through the explanation. Writing the question for a colleague or a forum does the same.",
        "Then question the assumptions: are you running the code you think you're running (saved, rebuilt, deployed, the right branch)? Is the configuration what you expect in that environment? Is the input really what you think it is? Take a break; a surprising number of bugs are found on the walk back to the desk.",
      ],
    },
    {
      kind: "table",
      title: "Bugs with a recognisable shape",
      head: ["Symptom", "Often caused by"],
      rows: [
        ["Works on my machine, fails elsewhere", "a different config, environment variable, data, OS, culture or time zone, or a missing file"],
        ["Fails only sometimes", "a race condition, timing, test order, randomness, caching, or an external service"],
        ["Off by one, first or last item wrong", "< versus <=, an inclusive versus exclusive range, an empty list"],
        ["A number slightly wrong", "floating-point rounding, integer division, an overflow"],
        ["Worked yesterday", "a deploy, a dependency update, data that changed, a certificate that expired"],
        ["Fails at midnight, month end or twice a year", "time zones and daylight saving"],
      ],
    },
  ],
  quiz: [
    {
      question: "A bug happens for one customer's data only. What is the most useful first step?",
      answer: "Reproduce it with that data in a test or locally",
      distractors: ["Add try/catch around the failing call", "Rewrite the function more cleanly", "Deploy more logging and wait"],
      why: "Until you can reproduce it you can't test a hypothesis or prove a fix. Logging helps when reproduction is impossible, but it is slower.",
    },
    {
      question: "Where in a Python traceback is the line that raised the error?",
      answer: "The last frame, just above the error message at the bottom",
      distractors: ["The first frame at the top", "The middle frame", "It isn't shown"],
      why: "Python prints the outermost call first and the innermost last. .NET prints the innermost frame first, under the exception message.",
    },
    {
      question: "A test passed in release 4.1 and fails in 4.2, with 600 commits between them. How many test runs does git bisect need, roughly?",
      answer: "About 10",
      distractors: ["About 600", "About 300", "About 25"],
      why: "Each step halves the range, and 2^10 = 1024 is more than 600.",
    },
    {
      question: "A loop fails on iteration 9,412 of 10,000. What debugger feature helps most?",
      answer: "A conditional breakpoint that stops when i == 9412",
      distractors: ["A breakpoint at the start of the loop", "Stepping into every call", "Reading the code from the top"],
      why: "It pauses exactly where things go wrong, with every variable available, instead of clicking Continue thousands of times.",
    },
  ],
  pitfalls: [
    "Changing several things at once, so you can't tell which one mattered.",
    "Fixing the symptom: catching and ignoring the exception, or special-casing the one input that failed.",
    "Not reading the whole error message, or reading only the first line of a stack trace.",
    "Debugging code you aren't actually running: unsaved, not rebuilt, or the wrong environment.",
    "Fixing a bug without a test that reproduces it, so it returns in a later change.",
  ],
  next: [
    { id: "tdd-coverage", label: "TDD, What to Test, Flaky Tests and Coverage" },
    { id: "git-branching", label: "Git Branching & Merging" },
    { id: "race-conditions", label: "Race Conditions: Why count++ Isn't Safe" },
  ],
};
