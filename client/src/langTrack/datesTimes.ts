import { src, type LangLessonData } from "./types.ts";

export const datesTimes: LangLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Dates and times look simple until a report is an hour off twice a year, a customer in another country sees yesterday's date, or a timer goes negative when the server's clock is corrected. Almost all of these bugs come from mixing up two different things: an instant (a single point in time, the same everywhere) and a local date and time (what a clock on a wall in one place shows).",
        "This lesson gives you the rules that avoid most of them: store and compute in UTC, keep the time zone when it matters, convert to local time only for display, use ISO 8601 in text, and measure durations with a monotonic clock.",
      ],
    },
    {
      kind: "terms",
      title: "The vocabulary",
      terms: [
        { term: "UTC", meaning: "Coordinated Universal Time, the reference every time zone is defined against. It has no daylight saving time, which is why it's the safe choice for storing and comparing instants." },
        { term: "Offset", meaning: "how far a local time is from UTC at a given moment, such as +01:00. An offset is not a time zone: Europe/London is +00:00 in winter and +01:00 in summer." },
        { term: "Time zone", meaning: "a region's rules for its offset over time, including daylight saving changes and their history, named in the IANA database as Area/City: Europe/London, America/New_York, Asia/Kolkata." },
        { term: "Daylight saving time (DST)", meaning: "moving the clocks forward an hour in spring and back in autumn. It creates a local time that doesn't exist (the skipped hour) and one that happens twice (the repeated hour)." },
        { term: "ISO 8601", meaning: "the standard text format: 2026-10-28T14:30:00Z or 2026-10-28T16:30:00+02:00. It sorts correctly as text and nobody confuses the day and month." },
        { term: "Unix time", meaning: "seconds since 1970-01-01T00:00:00Z, ignoring leap seconds. A single number, handy for storage and APIs, but unreadable to people." },
        { term: "Wall clock versus monotonic clock", meaning: "the wall clock tells the time of day and can jump when NTP corrects it or an admin changes it. A monotonic clock only ever moves forward, so it's the one to measure durations with." },
      ],
    },
    {
      kind: "code",
      title: "Instants, zones and conversions",
      csharp: src`
var utc = new DateTimeOffset(2026, 10, 28, 14, 30, 0, TimeSpan.Zero);
Console.WriteLine(utc.ToString("o"));                  // 2026-10-28T14:30:00.0000000+00:00

var london = TimeZoneInfo.FindSystemTimeZoneById("Europe/London");
var newYork = TimeZoneInfo.FindSystemTimeZoneById("America/New_York");
Console.WriteLine(TimeZoneInfo.ConvertTime(utc, london).ToString("yyyy-MM-dd HH:mm zzz"));   // 2026-10-28 14:30 +00:00
Console.WriteLine(TimeZoneInfo.ConvertTime(utc, newYork).ToString("yyyy-MM-dd HH:mm zzz"));  // 2026-10-28 10:30 -04:00

var parsed = DateTimeOffset.Parse("2026-10-28T16:30:00+02:00");
Console.WriteLine(parsed.UtcDateTime.ToString("yyyy-MM-dd HH:mm"));   // 2026-10-28 14:30
Console.WriteLine(parsed == utc);                                    // True: the same instant

// The night the clocks go back in London: 01:30 happens twice
var ambiguous = new DateTime(2026, 10, 25, 1, 30, 0);
Console.WriteLine(london.IsAmbiguousTime(ambiguous));                 // True
// The night they go forward: 01:30 never happens
Console.WriteLine(london.IsInvalidTime(new DateTime(2026, 3, 29, 1, 30, 0)));  // True

// "One day later" across the change: 24 hours, or the same wall-clock time?
var before = TimeZoneInfo.ConvertTime(new DateTimeOffset(2026, 10, 24, 12, 0, 0, TimeSpan.FromHours(1)), london);
var plus24h = TimeZoneInfo.ConvertTime(before.AddHours(24), london);
Console.WriteLine($"{before:dd HH:mm zzz} + 24 h = {plus24h:dd HH:mm zzz}");   // 24 12:00 +01:00 + 24 h = 25 11:00 +00:00
`,
      python: src`
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

utc = datetime(2026, 10, 28, 14, 30, tzinfo=timezone.utc)
print(utc.isoformat())                                   # 2026-10-28T14:30:00+00:00

london, new_york = ZoneInfo("Europe/London"), ZoneInfo("America/New_York")
print(utc.astimezone(london).strftime("%Y-%m-%d %H:%M %z"))     # 2026-10-28 14:30 +0000
print(utc.astimezone(new_york).strftime("%Y-%m-%d %H:%M %z"))   # 2026-10-28 10:30 -0400

parsed = datetime.fromisoformat("2026-10-28T16:30:00+02:00")
print(parsed.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M"))   # 2026-10-28 14:30
print(parsed == utc)                                               # True: the same instant

# The night the clocks go back in London: 01:30 happens twice; fold picks which one
first = datetime(2026, 10, 25, 1, 30, tzinfo=london)
second = datetime(2026, 10, 25, 1, 30, fold=1, tzinfo=london)
print(first.utcoffset(), second.utcoffset())             # 1:00:00 0:00:00

# "One day later" across the change: same wall-clock time, or 24 hours?
before = datetime(2026, 10, 24, 12, 0, tzinfo=london)
print(before + timedelta(days=1))                         # 2026-10-25 12:00:00+00:00 (wall clock: 25 hours passed)
print((before.astimezone(timezone.utc) + timedelta(hours=24)).astimezone(london))   # 2026-10-25 11:00:00+00:00

naive = datetime(2026, 10, 28, 14, 30)
print(naive.tzinfo)                                       # None: a naive datetime, no zone at all
`,
      notes: [
        "In C#, prefer `DateTimeOffset` to `DateTime` for instants: it carries its offset, so it always means one point in time. A `DateTime` has a `Kind` of Utc, Local or Unspecified, and Unspecified values get silently treated as local by some methods. `TimeZoneInfo` looks zones up by IANA name on Linux and macOS, and on Windows 10 and later since .NET 6. For heavy calendar work, the NodaTime library models these ideas explicitly.",
        "In Python, a datetime without `tzinfo` is naive: it has no zone, and comparing it with an aware one raises an error. Use `timezone.utc` and `zoneinfo.ZoneInfo` (Python 3.9+); the older `pytz` library needs its own `localize` call and is best avoided in new code. Adding a `timedelta` to an aware datetime in a zone keeps the wall-clock time, so across a DST change it moves by 23 or 25 real hours; convert to UTC first when you mean exact hours.",
      ],
    },
    {
      kind: "code",
      title: "Unix time, unclear values and measuring durations",
      csharp: src`
using System.Diagnostics;
using System.Globalization;

var fromUnix = DateTimeOffset.FromUnixTimeSeconds(1767225600);
Console.WriteLine(fromUnix.ToString("o"));                 // 2026-01-01T00:00:00.0000000+00:00
Console.WriteLine(fromUnix.ToUnixTimeSeconds());           // 1767225600

var unclear = DateTime.Parse("2026-10-28 14:30", CultureInfo.InvariantCulture);
Console.WriteLine(unclear.Kind);                           // Unspecified: which zone? nobody knows
Console.WriteLine(DateTime.SpecifyKind(unclear, DateTimeKind.Utc).ToString("o"));  // 2026-10-28T14:30:00.0000000Z

// Measuring how long something takes: a monotonic clock, not the wall clock
var sw = Stopwatch.StartNew();
Thread.Sleep(50);
Console.WriteLine(sw.ElapsedMilliseconds >= 50);           // True
`,
      python: src`
import time
from datetime import datetime, timezone

from_unix = datetime.fromtimestamp(1767225600, tz=timezone.utc)
print(from_unix.isoformat())                    # 2026-01-01T00:00:00+00:00
print(int(from_unix.timestamp()))               # 1767225600

# Measuring how long something takes: a monotonic clock, not the wall clock
start = time.monotonic()
time.sleep(0.05)
print(time.monotonic() - start >= 0.05)         # True
`,
      notes: [
        "`DateTime.Now`, `datetime.now()` and `time.time()` read the wall clock. If NTP steps the clock back while you are timing something, `end - start` can come out negative. `Stopwatch` and `time.monotonic()` (or `time.perf_counter()` for short intervals) can't go backwards.",
        "In tests, don't read the clock directly. Pass in the current time, or use .NET 8's `TimeProvider` (with `FakeTimeProvider` in tests) or a function you can replace in Python, so tests about midnight, month ends and DST changes are repeatable.",
      ],
    },
    {
      kind: "table",
      title: "What to store",
      head: ["You have", "Store", "Example"],
      rows: [
        ["Something that happened (an order, a log line, a login)", "the instant in UTC", "2026-10-28T14:30:00Z, or Unix time"],
        ["A future local event (a meeting, a shop's opening time)", "the local date and time plus the IANA zone name", "2027-03-15 09:00, Europe/London"],
        ["A date with no time (a birthday, a holiday)", "just the date", "DateOnly in C#, date in Python"],
        ["A recurring time of day (an alarm at 07:00)", "the time of day plus the zone", "TimeOnly / time, America/New_York"],
        ["A length of time", "a duration", "TimeSpan, timedelta, or seconds as a number"],
      ],
      notes: ["Why not UTC for the future meeting? Time zone rules change: countries drop or move DST with a few months' notice. A meeting stored as UTC would then show at the wrong local time; stored as local time plus zone, it's converted with whatever rules are current."],
    },
  ],
  predict: [
    {
      lang: "csharp",
      code: src`
Console.WriteLine(new DateTime(2026, 1, 31).AddMonths(1).ToString("yyyy-MM-dd"));`,
      output: "2026-02-28",
      distractors: ["2026-03-03", "2026-02-31", "2026-03-01"],
      why: "AddMonths keeps the day when it can and otherwise uses the last day of the month, so 31 January plus a month is 28 February in a non-leap year.",
    },
    {
      lang: "python",
      code: src`
from datetime import datetime
from zoneinfo import ZoneInfo
print(datetime(2026, 3, 8, 12, tzinfo=ZoneInfo("America/New_York")).utcoffset())`,
      output: "-1 day, 20:00:00",
      distractors: ["-5:00:00", "-4:00:00", "-1 day, 19:00:00"],
      why: "US clocks went forward at 02:00 that morning, so noon is on daylight time, UTC-4. A negative timedelta prints as -1 day plus a positive remainder: minus one day plus 20 hours is minus 4 hours.",
    },
  ],
  pitfalls: [
    "Storing local times without a zone, so nobody can tell later which instant they meant.",
    "Assuming every day has 24 hours: DST days have 23 or 25 in many zones.",
    "Using fixed offsets (+01:00) where a time zone (Europe/Berlin) is meant.",
    "Formatting dates for machines with the computer's culture (10/11/2026 is October in the US and November in the UK); use ISO 8601.",
    "Timing code with DateTime.Now or time.time(), which can jump.",
    "Scheduling jobs at 01:30 local time, which runs twice or not at all on DST nights; schedule in UTC.",
  ],
  next: [
    { id: "lang-files-formatting", label: "Files, Formatting and Parsing" },
    { id: "lang-regex", label: "Regular Expressions" },
    { id: "sd-consensus-clocks", label: "Consensus and Logical Clocks: Raft, Quorums, Lamport and Vector Clocks" },
  ],
};
