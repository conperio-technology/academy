namespace DsaAcademy.Content.Tools;

public class LangDatesTimesTool : ITool
{
    public string Id => "lang-dates-times";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1760;
    public string Title => "Dates, Times and Time Zones";
    public string OneLiner => "Instants versus local times, UTC, offsets and IANA time zones, ISO 8601, daylight saving gaps and repeats, Unix time, what to store, and measuring durations with a monotonic clock.";
    public string KeyTakeaway => "Store instants in UTC (DateTimeOffset, aware datetimes), convert to a time zone only to display, and write ISO 8601. Keep future local events as local time plus an IANA zone name. Expect days of 23 and 25 hours, never use naive or Unspecified values for instants, and time code with Stopwatch or time.monotonic().";

    public ToolKind ToolKind => ToolKind.LangDatesTimes;

    public string Explanation =>
        "Date and time bugs come from mixing up an instant, the same moment everywhere, with what a clock shows in one place. This lesson separates the two and shows the C# and Python types for each." +
        "\n\n" +
        "The samples convert between zones, walk through the nights the clocks change, and show the right clock for measuring how long something takes. A table at the end says what to store for each kind of date and time.";
}
