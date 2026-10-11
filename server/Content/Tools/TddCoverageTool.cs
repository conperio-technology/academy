namespace DsaAcademy.Content.Tools;

public class TddCoverageTool : ITool
{
    public string Id => "tdd-coverage";
    public string Section => "Professional Dev Skills";
    public string Track => "testing";
    public string Title => "TDD, What to Test, Flaky Tests and Coverage";
    public string OneLiner => "Red, green, refactor; choosing the tests that matter; why tests flake; and what a coverage number does and doesn't prove.";
    public string KeyTakeaway =>
        "Test-driven development is a loop: write a failing test (red), write the least code that passes it (green), " +
        "then clean up with the tests as a safety net (refactor). Test behaviour through the public interface, with " +
        "extra care at boundaries and error paths. Flaky tests come from hidden nondeterminism such as time, ordering, " +
        "shared state and real networks, and the fix is to remove it, not retry it. Coverage tells you what code ran, not " +
        "what was checked: 100% coverage with a missing boundary test still ships the bug.";

    public ToolKind ToolKind => ToolKind.TddCoverage;

    public string Explanation =>
        "Kent Beck's test-driven development (TDD) repeats a short cycle. Red: write one small test for behaviour that " +
        "doesn't exist yet, and watch it fail, which proves the test can fail. Green: write the simplest code that makes " +
        "it pass, even if it's naive. Refactor: improve names and structure while every test stays green. Each step is " +
        "minutes long. TDD pushes you toward small, decoupled, injectable code because hard-to-test code is painful to " +
        "write test-first, and it leaves a regression suite behind (tests that catch old bugs coming back). It's less useful for exploratory spikes and UI " +
        "layout, and many strong teams write tests just after the code instead; what matters in an interview is that " +
        "you can explain the cycle and its trade-offs.\n\n" +
        "What to test: behaviour, through the public API, not private methods or the exact sequence of internal calls, " +
        "so refactoring doesn't break tests. Cover the happy path, then the edges where bugs live: empty and null input, " +
        "one element, many elements, exact boundaries (the value at a limit and one either side), negative numbers, " +
        "duplicates, very large inputs, and text outside ASCII. Test error paths and the exceptions callers rely on. When " +
        "you fix a bug, first write a test that reproduces it. Skip trivial getters and the framework's own behaviour.\n\n" +
        "A flaky test passes and fails on the same code. The usual causes are: reading the real clock (DateTime.Now; " +
        "inject TimeProvider and use FakeTimeProvider in tests), waiting with Thread.Sleep instead of awaiting a " +
        "condition, tests sharing static state or a database row so their order matters, random data without a fixed " +
        "seed, real network calls, races in concurrent code, and culture or time-zone differences between machines. " +
        "Automatic retries hide the problem and teach the team to ignore red builds; quarantine the test, find the " +
        "nondeterminism and remove it.\n\n" +
        "Code coverage measures which lines (line coverage) or which branch outcomes (branch coverage) ran during the " +
        "tests; in .NET, Coverlet collects it with dotnet test --collect:\"XPlat Code Coverage\". It's good at showing what " +
        "is definitely untested. It can't show what is well tested: a test with no assertions still counts, and a suite " +
        "can execute every line and branch without trying the one input that exposes a bug. Mutation testing (Stryker.NET " +
        "for C#) asks the better question: it makes small changes to your code, such as >= to >, and checks whether any " +
        "test fails. A surviving mutant is a bug your tests would miss. Treat coverage as a smoke alarm, not a target; " +
        "once a percentage becomes a goal, people write tests that raise it without checking anything.";
}
