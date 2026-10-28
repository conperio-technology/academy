import { src, type LangLessonData } from "./types.ts";

export const regex: LangLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "A regular expression (regex) is a small pattern language for describing the shape of text: \"four digits, a dash, two digits\", or \"a word made of letters and hyphens followed by an equals sign\". You hand the pattern and some text to a regex engine, and it finds, checks, extracts, replaces or splits for you. Both languages build it in: System.Text.RegularExpressions in C#, the re module in Python, with almost the same syntax.",
        "Regexes are excellent for log lines, identifiers, simple validation and cleaning up data. They are a poor fit for nested formats such as HTML or JSON, and a carelessly written pattern can take exponential time. This lesson covers the syntax you'll use every day, the two APIs side by side, greedy versus lazy matching, and how to avoid catastrophic backtracking.",
      ],
    },
    {
      kind: "table",
      title: "The syntax you'll use most",
      head: ["Pattern", "Matches", "Example"],
      rows: [
        ["abc", "those characters literally", "WARN matches WARN"],
        [".", "any character except a newline", "a.c matches abc, a-c"],
        ["\\d, \\w, \\s", "a digit, a word character (letter, digit, _), whitespace", "\\d\\d matches 42"],
        ["\\D, \\W, \\S", "anything except a digit, word character, whitespace", "\\S+ matches a run of non-spaces"],
        ["[abc], [a-z0-9], [^,]", "one character from a set, a range, or not in the set", "[^,]+ matches up to the next comma"],
        ["*, +, ?", "0 or more, 1 or more, 0 or 1 of the previous item", "colou?r matches color and colour"],
        ["{4}, {2,5}, {3,}", "exactly 4, between 2 and 5, 3 or more", "\\d{4} matches 2026"],
        ["^ and $", "start and end of the text (of each line with Multiline)", "^\\d+$ means the whole text is digits"],
        ["\\b", "a word boundary: between a word character and anything else", "\\bcat\\b finds cat but not concat"],
        ["a|b", "either alternative", "WARN|ERROR"],
        ["(...)", "a capture group: remember this part", "(\\d+)-(\\d+) captures both numbers"],
        ["(?:...)", "a group that doesn't capture, just for | or a quantifier", "(?:ab)+ matches abab"],
        ["(?<name>...) in C#, (?P<name>...) in Python", "a named capture group", "(?<year>\\d{4})"],
        ["*?, +?, ??", "lazy: as few as possible instead of as many as possible", "<.+?> stops at the first >"],
        ["\\. \\( \\\\", "a special character, escaped to mean itself", "\\d+\\.\\d+ matches 4.2"],
      ],
      notes: ["Write patterns as verbatim strings in C# (@\"\\d+\") and raw strings in Python (r\"\\d+\"). Otherwise the language reads the backslashes first, and \"\\b\" becomes a backspace character instead of a word boundary."],
    },
    {
      kind: "code",
      title: "Checking, finding and extracting",
      csharp: src`
using System.Text.RegularExpressions;

string line = "2026-10-28 09:14:03 WARN pump-7 pressure=4.2bar";

Console.WriteLine(Regex.IsMatch(line, @"WARN|ERROR"));        // True: found somewhere
Console.WriteLine(Regex.IsMatch("2026-10-28", @"^\d{4}-\d{2}-\d{2}$")); // True: the whole string

Match m = Regex.Match(line, @"(\d{4})-(\d{2})-(\d{2})");
Console.WriteLine($"{m.Value} year={m.Groups[1].Value} month={m.Groups[2].Value}");
// 2026-10-28 year=2026 month=10

var named = Regex.Match(line, @"(?<level>[A-Z]+) (?<device>[\w-]+) (?<key>\w+)=(?<value>[\d.]+)");
Console.WriteLine($"{named.Groups["level"].Value} {named.Groups["device"].Value} {named.Groups["value"].Value}");
// WARN pump-7 4.2

foreach (Match t in Regex.Matches("a=1, b=22, c=333", @"(\w)=(\d+)"))
    Console.Write($"{t.Groups[1].Value}:{t.Groups[2].Value} ");
Console.WriteLine();   // a:1 b:22 c:333
`,
      python: src`
import re

line = "2026-10-28 09:14:03 WARN pump-7 pressure=4.2bar"

print(bool(re.search(r"WARN|ERROR", line)))               # True: found somewhere
print(bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", "2026-10-28")))  # True: the whole string

m = re.search(r"(\d{4})-(\d{2})-(\d{2})", line)
print(m.group(0), "year=" + m.group(1), "month=" + m.group(2))
# 2026-10-28 year=2026 month=10

named = re.search(r"(?P<level>[A-Z]+) (?P<device>[\w-]+) (?P<key>\w+)=(?P<value>[\d.]+)", line)
print(named["level"], named["device"], named["value"])
# WARN pump-7 4.2

print(re.findall(r"(\w)=(\d+)", "a=1, b=22, c=333"))   # [('a', '1'), ('b', '22'), ('c', '333')]
`,
      notes: [
        "Python has three ways to start: `re.search` finds the pattern anywhere, `re.match` only at the start, and `re.fullmatch` requires the whole string. C# has `Regex.IsMatch` and `Regex.Match`, which search anywhere, so anchor with `^...$` to check a whole string. Both return a match object, or `null` / `None` when nothing matched, so check before reading groups.",
        "`re.findall` returns the matched strings when the pattern has no groups, and tuples of the groups when it does. In C#, `Regex.Matches` always returns Match objects, and `m.Value` is the whole match. Group 0 is the whole match in both languages; groups are numbered from 1 by their opening parenthesis.",
      ],
    },
    {
      kind: "code",
      title: "Greedy and lazy, replacing and splitting",
      csharp: src`
using System.Text.RegularExpressions;

string html = "<b>bold</b> and <i>italic</i>";
Console.WriteLine(Regex.Match(html, "<.+>").Value);    // <b>bold</b> and <i>italic</i>
Console.WriteLine(Regex.Match(html, "<.+?>").Value);   // <b>
Console.WriteLine(Regex.Match(html, "<[^>]+>").Value); // <b>

// Replace, using groups in the replacement: swap 28/10/2026 into 2026-10-28
Console.WriteLine(Regex.Replace("due 28/10/2026, paid 01/11/2026", @"(\d{2})/(\d{2})/(\d{4})", "$3-$2-$1"));
// due 2026-10-28, paid 2026-11-01

// Split on any run of commas, semicolons or spaces
Console.WriteLine(string.Join("|", Regex.Split("a, b;;c  d", @"[,;\s]+")));   // a|b|c|d

// Options: ignore case, and ^ $ at every line with Multiline
string log = "ok\nError: disk\nerror: fan";
Console.WriteLine(Regex.Matches(log, @"^error: (\w+)$", RegexOptions.IgnoreCase | RegexOptions.Multiline).Count); // 2
`,
      python: src`
import re

html = "<b>bold</b> and <i>italic</i>"
print(re.search(r"<.+>", html).group())     # <b>bold</b> and <i>italic</i>
print(re.search(r"<.+?>", html).group())    # <b>
print(re.search(r"<[^>]+>", html).group())  # <b>

# Replace, using groups in the replacement: swap 28/10/2026 into 2026-10-28
print(re.sub(r"(\d{2})/(\d{2})/(\d{4})", r"\3-\2-\1", "due 28/10/2026, paid 01/11/2026"))
# due 2026-10-28, paid 2026-11-01

# Split on any run of commas, semicolons or spaces
print("|".join(re.split(r"[,;\s]+", "a, b;;c  d")))   # a|b|c|d

# Flags: ignore case, and ^ $ at every line with MULTILINE
log = "ok\nError: disk\nerror: fan"
print(len(re.findall(r"^error: (\w+)$", log, re.IGNORECASE | re.MULTILINE)))  # 2
`,
      notes: [
        "Quantifiers are greedy: `.+` grabs as much as it can and gives back only what it must, so `<.+>` runs from the first < to the last >. Adding ? makes it lazy (as little as possible). A negated set such as `[^>]+` is often clearer and faster than a lazy dot, because it can't run past the character you care about.",
        "Replacement strings refer to groups as `$1` in C# and `\\1` in Python (or `${name}` and `\\g<name>` for named groups). If you use a regex many times, build it once: `new Regex(pattern, RegexOptions.Compiled)` in C# (or the `[GeneratedRegex]` source generator), `re.compile(pattern)` in Python, which also caches recent patterns for you.",
      ],
    },
    {
      kind: "text",
      title: "Catastrophic backtracking (ReDoS)",
      paragraphs: [
        "The .NET and Python engines are backtracking engines: when a path fails, they go back and try another way to split the text among the quantifiers. For most patterns that is fast. But nested quantifiers that can match the same characters in many ways, such as (a+)+, (a|aa)* or (\\w+\\s?)*, give the engine an exponential number of ways to try when the input almost matches and then fails at the end. Each extra character can double the time.",
        "If a pattern like that checks user input, a single crafted string can pin a CPU core for minutes: a regular expression denial of service (ReDoS). It has taken down real services, including Cloudflare in 2019 and Stack Overflow in 2016. The defences: avoid nested quantifiers over overlapping sets, set a match timeout in .NET, or use .NET's NonBacktracking option, which guarantees linear time (at the cost of some features, such as backreferences and lookarounds).",
      ],
    },
    {
      kind: "code",
      title: "Seeing the blow-up, and the defences",
      csharp: src`
using System.Diagnostics;
using System.Text.RegularExpressions;

string evil = new string('a', 30) + "!";   // almost matches, then fails at the end

var guarded = new Regex(@"^(a+)+$", RegexOptions.None, TimeSpan.FromMilliseconds(200));
try { guarded.IsMatch(evil); }
catch (RegexMatchTimeoutException) { Console.WriteLine("backtracking: gave up after 200 ms"); }

var sw = Stopwatch.StartNew();
bool ok = Regex.IsMatch(evil, @"^(a+)+$", RegexOptions.NonBacktracking);
Console.WriteLine($"NonBacktracking: {ok} in under a second: {sw.ElapsedMilliseconds < 1000}");
// NonBacktracking: False in under a second: True

Console.WriteLine(Regex.IsMatch(evil, @"^a+$"));   // False, instantly: same language, no nesting
`,
      python: src`
import re, time

for n in [18, 20, 22, 24]:
    evil = "a" * n + "!"   # almost matches, then fails at the end
    start = time.perf_counter()
    re.fullmatch(r"(a+)+", evil)
    print(n, f"{time.perf_counter() - start:.2f} s")
# 18 0.01 s / 20 0.03 s / 22 0.13 s / 24 0.52 s (one run; each 2 more characters is about 4x slower)

start = time.perf_counter()
re.fullmatch(r"a+", "a" * 1_000_000 + "!")      # the same language without nesting
print("a+ on a million characters:", time.perf_counter() - start < 0.5)   # True
`,
      notes: [
        "Python's re module has no timeout. Rewrite the pattern so each character can be matched in only one way (here `a+` instead of `(a+)+`), limit the input length before matching, or use the third-party `regex` module, which accepts a timeout. Python 3.11 added possessive quantifiers (`a++`) and atomic groups (`(?>...)`), which never backtrack into what they matched.",
      ],
    },
    {
      kind: "steps",
      title: "When not to use a regex",
      steps: [
        "Nested or structured formats: parse HTML with an HTML parser, JSON with a JSON library, CSV with a CSV reader (quoted fields with commas defeat simple patterns).",
        "Email addresses and URLs: a full validator is enormous; check for something@something and send a confirmation email, or use Uri.TryCreate / urllib.parse.",
        "Dates and numbers: parse them with DateTime.TryParseExact or datetime.strptime and int.TryParse or int(), which also check that the values are valid (no 31 February).",
        "Simple fixed checks: s.StartsWith, s.Contains, s.Split(',') and str.isdigit() are clearer and faster than a pattern.",
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
import re
print(re.findall(r"\d+", "a1b22c333"))`,
      output: "['1', '22', '333']",
      distractors: ["['1', '2', '2', '3', '3', '3']", "['122333']", "1"],
      why: "\\d+ is greedy, so each run of digits is one match, and findall with no groups returns the matched strings in order.",
    },
    {
      lang: "python",
      code: src`
import re
print(re.findall(r"(\d+)-(\d+)", "1-2 and 30-40"))`,
      output: "[('1', '2'), ('30', '40')]",
      distractors: ["['1-2', '30-40']", "['1', '2', '30', '40']", "[('1-2',), ('30-40',)]"],
      why: "With two groups in the pattern, findall returns a tuple of the groups for each match, not the whole matched text.",
    },
    {
      lang: "csharp",
      code: src`
using System.Text.RegularExpressions;
Console.WriteLine(Regex.Match("price: 1,250.50 EUR", @"[\d,]+\.\d+").Value);`,
      output: "1,250.50",
      distractors: ["1,250", "250.50", "price: 1,250.50"],
      why: "The set [\\d,]+ takes digits and commas, then \\. needs a literal dot and \\d+ the decimals. The search starts at the first place the whole pattern fits.",
    },
    {
      lang: "csharp",
      code: src`
using System.Text.RegularExpressions;
Console.WriteLine(Regex.Replace("aaa", "a*", "x"));`,
      output: "xx",
      distractors: ["x", "xxx", "xxxx"],
      why: "a* first matches all three a's, then matches the empty string at the end of the text, so there are two replacements. Python's re.sub gives the same. Patterns that can match nothing often surprise.",
    },
  ],
  pitfalls: [
    "Forgetting the anchors when validating: \\d{4} also matches inside 123456; use ^\\d{4}$ or fullmatch.",
    "Writing patterns in normal strings, so \\b turns into a backspace and \\d into an error or a warning.",
    "A greedy .* that swallows far more than intended; use a negated set or a lazy quantifier.",
    "Running a pattern with nested quantifiers on user input with no timeout or length limit.",
    "Using \\d when only ASCII digits are acceptable; it matches other scripts' digits too.",
  ],
  next: [
    { id: "inter-extract-error-codes", label: "Exercise: Extract Error Codes From a Log" },
    { id: "dp-regex-matching", label: "Exercise: Regular Expression Matching (. and *)" },
    { id: "lang-dates-times", label: "Dates, Times and Time Zones" },
  ],
};
