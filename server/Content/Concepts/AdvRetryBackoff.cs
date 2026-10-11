namespace DsaAcademy.Content.Concepts;

public class AdvRetryBackoff : IConcept
{
    public string Id => "adv-retry-backoff";
    public string Section => Basics.Section;
    public string Track => Adv.Track;
    public int Order => 2801;
    public string Title => "Retry with Exponential Backoff";
    public string OneLiner => "Write a retry helper that retries only timeouts, waits base, 2 x base, 4 x base and so on up to a cap between attempts, gives up after a set number of attempts, and lets other errors through at once.";
    public string KeyTakeaway =>
        "Retry only transient failures, and only a limited number of times. Double the wait after each failure, cap it, " +
        "don't wait after the final attempt, and rethrow the last error when you give up. Taking the sleep function as " +
        "a parameter makes the helper testable without real waiting.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write Retry(action, maxAttempts, baseDelayMs, maxDelayMs, sleep). Call action() and return its result if it " +
        "succeeds. If it throws TimeoutException (C#) or TimeoutError (Python), that's a transient failure: if attempts " +
        "remain, call sleep(delay) and try again, where the delay after the first failure is baseDelayMs, then doubles " +
        "each time (base, 2 x base, 4 x base, ...) but never exceeds maxDelayMs. After maxAttempts calls, stop and let " +
        "the last TimeoutException propagate, without a final sleep. Any other exception is permanent: let it " +
        "propagate straight away, without retrying or sleeping. maxAttempts is at least 1.\n\n" +
        "The tests drive a fake device through a script of outcomes, one per call: \"timeout\" throws a timeout, " +
        "\"fail\" throws a permanent error (InvalidOperationException / ValueError), and a number is returned as the " +
        "result. The checker reports [outcome, number of calls, the delays passed to sleep], where the outcome is the " +
        "result as text, \"gave up\" for a timeout that came out of Retry, or \"failed\" for a permanent error. So the " +
        "script [\"timeout\", \"timeout\", \"42\"] with 4 attempts, base 100 and cap 1000 gives [\"42\", 3, [100, 200]].\n\n" +
        "In C#, a for loop with a try / catch (TimeoutException) when (attempt < maxAttempts) is neat: the exception " +
        "filter lets the final timeout escape untouched. Compute the delay with Math.Min(maxDelayMs, baseDelayMs * " +
        "2^(attempt - 1)), using a long or stopping the doubling once it reaches the cap, so many attempts can't " +
        "overflow. In Python, catch TimeoutError, and use a bare raise on the last attempt. The sleep parameter is a " +
        "function, Action<int> or a callable: production code would pass Thread.Sleep or time.sleep.";

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Solution\n" +
            "{\n" +
            "    public static int Retry(Func<int> action, int maxAttempts, int baseDelayMs, int maxDelayMs, Action<int> sleep)\n" +
            "    {\n" +
            "        // TODO: retry timeouts with doubling, capped delays; give up after maxAttempts.\n" +
            "        return action();\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def retry(action, max_attempts, base_delay_ms, max_delay_ms, sleep):\n" +
            "    # TODO: retry TimeoutError with doubling, capped delays; give up after max_attempts.\n" +
            "    return action()\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Solution.Retry",
        ["python"] = "retry",
    };

    public string? CSharpHarnessPreamble =>
        "public static class RetryCheck\n" +
        "{\n" +
        "    public static List<object> Check(string[] script, int maxAttempts, int baseDelayMs, int maxDelayMs)\n" +
        "    {\n" +
        "        int calls = 0;\n" +
        "        var delays = new List<int>();\n" +
        "        string outcome;\n" +
        "        try\n" +
        "        {\n" +
        "            int result = Solution.Retry(() =>\n" +
        "            {\n" +
        "                string next = script[calls++];\n" +
        "                if (next == \"timeout\") throw new TimeoutException(\"no reply\");\n" +
        "                if (next == \"fail\") throw new InvalidOperationException(\"bad request\");\n" +
        "                return int.Parse(next);\n" +
        "            }, maxAttempts, baseDelayMs, maxDelayMs, delays.Add);\n" +
        "            outcome = result.ToString();\n" +
        "        }\n" +
        "        catch (TimeoutException) { outcome = \"gave up\"; }\n" +
        "        catch (InvalidOperationException) { outcome = \"failed\"; }\n" +
        "        return [outcome, calls, delays];\n" +
        "    }\n" +
        "}\n";

    public string? PythonHarnessPreamble =>
        "def check_retry(script, max_attempts, base_delay_ms, max_delay_ms):\n" +
        "    calls = 0\n" +
        "    delays = []\n" +
        "\n" +
        "    def action():\n" +
        "        nonlocal calls\n" +
        "        step = script[calls]\n" +
        "        calls += 1\n" +
        "        if step == \"timeout\":\n" +
        "            raise TimeoutError(\"no reply\")\n" +
        "        if step == \"fail\":\n" +
        "            raise ValueError(\"bad request\")\n" +
        "        return int(step)\n" +
        "\n" +
        "    try:\n" +
        "        outcome = str(retry(action, max_attempts, base_delay_ms, max_delay_ms, delays.append))\n" +
        "    except TimeoutError:\n" +
        "        outcome = \"gave up\"\n" +
        "    except ValueError:\n" +
        "        outcome = \"failed\"\n" +
        "    return [outcome, calls, delays]\n";

    public List<TestCase> TestCases =>
    [
        new TestCase(Lit.Args(Basics.StrArray("timeout", "timeout", "42"), Lit.Int(4), Lit.Int(100), Lit.Int(1000)), "[\"42\", 3, [100, 200]]"),
        new TestCase(Lit.Args(Basics.StrArray("7"), Lit.Int(3), Lit.Int(100), Lit.Int(1000)), "[\"7\", 1, []]"),
        new TestCase(Lit.Args(Basics.StrArray("timeout", "timeout", "timeout"), Lit.Int(3), Lit.Int(100), Lit.Int(1000)), "[\"gave up\", 3, [100, 200]]"),
        new TestCase(Lit.Args(Basics.StrArray("timeout", "fail", "5"), Lit.Int(5), Lit.Int(50), Lit.Int(1000)), "[\"failed\", 2, [50]]"),
        new TestCase(Lit.Args(Basics.StrArray("timeout", "timeout", "timeout", "timeout", "timeout", "9"), Lit.Int(6), Lit.Int(100), Lit.Int(500)), "[\"9\", 6, [100, 200, 400, 500, 500]]"),
        new TestCase(Lit.Args(Basics.StrArray("timeout", "3"), Lit.Int(1), Lit.Int(100), Lit.Int(1000)), "[\"gave up\", 1, []]"),
        new TestCase(Lit.Args(Basics.StrArray("fail", "1"), Lit.Int(3), Lit.Int(100), Lit.Int(1000)), "[\"failed\", 1, []]"),
        new TestCase(Lit.Args(Basics.StrArray("timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout",
            "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout",
            "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout",
            "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "timeout", "1"), Lit.Int(40), Lit.Int(1000), Lit.Int(30000)),
            "[\"1\", 40, [1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000, 30000]]"),
    ];

    public string CSharpCallTemplate => "RetryCheck.Check({input})";
    public string PythonCallTemplate => "check_retry({input})";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        object[] script = ["timeout", "timeout", "42"];
        return
        [
            Basics.Step(script, [0], "[]", "delays", "Attempt 1 times out. Attempts remain, so wait the base delay, 100 ms."),
            Basics.Step(script, [1], "[100]", "delays", "Attempt 2 times out too. Double the wait: 200 ms (never more than the cap)."),
            Basics.Step(script, [2], "[100, 200]", "delays", "Attempt 3 succeeds: return 42. Total waiting 300 ms, three calls."),
            Basics.Step(script, [], "[100, 200]", "delays", "Had attempt 3 been the last allowed and timed out, Retry would rethrow at once, with no pointless final wait. A \"fail\" would escape immediately: it isn't transient."),
        ];
    }
}
