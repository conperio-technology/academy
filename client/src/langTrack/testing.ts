import { src, type LangLessonData } from "./types.ts";

// The test-framework samples (parts 2 and 4) need xUnit or pytest, so they're marked as
// fragments for the plain snippet checker; they were run with `dotnet test` (xUnit v2)
// and pytest 9 instead, with the code under test from part 1.
export const testing: LangLessonData = {
  parts: [
    {
      kind: "text",
      title: "Why write tests",
      paragraphs: [
        "A unit test is a small piece of code that calls one part of your program, a unit, usually a single function or class, with chosen inputs and checks that the result is what you expect. Each check is an assertion: \"assert that this equals that\". Run all the tests after every change and you find out in seconds if you broke something that used to work (a regression), instead of a user finding out next month.",
        "You've already been on the receiving end: every graded exercise here is checked by a set of tests the server or browser runs against your code. This lesson shows how to write your own, with xUnit, the most common C# test framework, and pytest, the most common Python one. Test frameworks can't run inside the graded exercise editor, so the framework samples below are for your own projects; the questions use plain code.",
      ],
    },
    {
      kind: "code",
      title: "The code we'll test",
      csharp: src`
Console.WriteLine(Grading.Grade(95));   // A
Console.WriteLine(Grading.Grade(49));   // F

public static class Grading
{
    public static string Grade(int score)
    {
        if (score < 0 || score > 100)
            throw new ArgumentOutOfRangeException(nameof(score), "Score must be 0 to 100");
        if (score >= 90) return "A";
        if (score >= 75) return "B";
        if (score >= 50) return "C";
        return "F";
    }
}
`,
      python: src`
# grading.py
def grade(score):
    if not 0 <= score <= 100:
        raise ValueError("score must be 0 to 100")
    if score >= 90:
        return "A"
    if score >= 75:
        return "B"
    if score >= 50:
        return "C"
    return "F"


if __name__ == "__main__":     # only when run directly, not when a test imports it
    print(grade(95))           # A
    print(grade(49))           # F
`,
      notes: [
        "Good units to test are like this one: a clear input, a clear output, and no hidden dependencies on files, clocks or the network. Code shaped like that is easy to test, and code that's easy to test tends to be well designed.",
        "The `if __name__ == \"__main__\":` line lets the same Python file be run as a program or imported by a test without running the demo; the Modules lesson explains it.",
      ],
    },
    {
      kind: "code",
      title: "Tests: one example, many examples, and errors",
      csharp: src`
// GradingTests.cs, in a separate test project
using Xunit;

public class GradingTests
{
    [Fact]
    public void Score_of_95_is_an_A()
    {
        // Arrange
        int score = 95;
        // Act
        string grade = Grading.Grade(score);
        // Assert
        Assert.Equal("A", grade);           // expected value first, then actual
    }

    [Theory]
    [InlineData(90, "A")]
    [InlineData(89, "B")]
    [InlineData(75, "B")]
    [InlineData(74, "C")]
    [InlineData(50, "C")]
    [InlineData(49, "F")]
    public void Boundaries(int score, string expected)
    {
        Assert.Equal(expected, Grading.Grade(score));
    }

    [Fact]
    public void Score_above_100_throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => Grading.Grade(101));
    }
}
`,
      python: src`
# test_grading.py, next to grading.py
import pytest

from grading import grade


def test_score_of_95_is_an_a():
    # Arrange
    score = 95
    # Act
    result = grade(score)
    # Assert
    assert result == "A"


@pytest.mark.parametrize("score, expected", [
    (90, "A"), (89, "B"), (75, "B"), (74, "C"), (50, "C"), (49, "F"),
])
def test_boundaries(score, expected):
    assert grade(score) == expected


def test_score_above_100_raises():
    with pytest.raises(ValueError, match="0 to 100"):
        grade(101)
`,
      captions: { csharp: "C# with xUnit", python: "Python with pytest" },
      fragment: { csharp: true, python: true },
      notes: [
        "Each test follows arrange, act, assert: set up the inputs, call the code once, check the result. One behaviour per test, with a name that says what it checks, so a failing test's name tells you what broke.",
        "xUnit finds test methods by their attributes: `[Fact]` is a single test; `[Theory]` with `[InlineData(...)]` rows is a parametrized test, run once per row. pytest finds files named `test_*.py` and functions named `test_*`, and uses Python's plain `assert` statement, showing both sides when it fails. `@pytest.mark.parametrize` is its version of `[Theory]`.",
        "The rows test the boundaries, 90 and 89, 75 and 74, 50 and 49, because off-by-one mistakes (`>` where `>=` was meant) hide exactly there. `Assert.Throws` and `pytest.raises` check that bad input fails the way it should; `match=` also checks the message, so the test can't pass because of some other ValueError.",
      ],
    },
    {
      kind: "steps",
      title: "Running the tests",
      steps: [
        "C#: create a test project next to your code with `dotnet new xunit -n Grading.Tests`, point it at your project with `dotnet add Grading.Tests reference Grading`, and run `dotnet test`. Visual Studio and VS Code also have a Test Explorer with a run button per test.",
        "Python: install pytest once with `pip install pytest` (ideally inside a virtual environment, see the Modules lesson), then run `pytest` in the folder. `pytest -q` prints less, `pytest -k boundaries` runs only tests whose names match, and `pytest -x` stops at the first failure.",
        "Read a failure from the bottom up: it names the test, the assertion, and the expected and actual values. xUnit prints `Assert.Equal() Failure` with `Expected:` and `Actual:` lines; pytest prints the failing `assert` line and the values on each side, such as `AssertionError: assert 'C' == 'B'`.",
        "Run the tests before every commit, and let your build server run them on every push. Tests that nobody runs catch nothing.",
      ],
    },
    {
      kind: "code",
      title: "Shared setup: constructors and fixtures",
      csharp: src`
using Xunit;

public class CartTests
{
    private readonly List<string> _cart;

    public CartTests()                 // runs before EACH test: a fresh cart every time
    {
        _cart = new List<string> { "bolt" };
    }

    [Fact]
    public void Starts_with_one_item() => Assert.Single(_cart);

    [Fact]
    public void Adding_makes_two()
    {
        _cart.Add("nut");
        Assert.Equal(2, _cart.Count);
    }
}
`,
      python: src`
import pytest


@pytest.fixture
def cart():                        # runs before EACH test that asks for it
    return ["bolt"]


def test_starts_with_one_item(cart):
    assert len(cart) == 1


def test_adding_makes_two(cart):
    cart.append("nut")
    assert len(cart) == 2
`,
      captions: { csharp: "C# with xUnit", python: "Python with pytest" },
      fragment: { csharp: true, python: true },
      notes: [
        "Tests must not depend on each other or on the order they run in. xUnit creates a new instance of the test class for every test, so the constructor is per-test setup (implement `IDisposable` for clean-up). pytest's version is a test fixture: a function marked `@pytest.fixture`, whose result is passed to any test that names it as a parameter, freshly made for each test.",
        "When the code under test talks to a database, a clock or a web service, a test hands it a stand-in object instead, a test double. That's where the interfaces from the Interfaces lesson pay off; the Test Doubles lesson in Professional Dev Skills covers mocks, stubs and fakes.",
      ],
    },
    {
      kind: "table",
      title: "xUnit and pytest side by side",
      head: ["", "xUnit (C#)", "pytest (Python)"],
      rows: [
        ["A test", "`[Fact] public void Name()`", "`def test_name():`"],
        ["Same test, many inputs", "`[Theory]` + `[InlineData(1, 2)]`", "`@pytest.mark.parametrize(\"a, b\", [(1, 2)])`"],
        ["Equal", "`Assert.Equal(expected, actual)`", "`assert actual == expected`"],
        ["True or false", "`Assert.True(x)`, `Assert.False(x)`", "`assert x`, `assert not x`"],
        ["Close enough (floats)", "`Assert.Equal(0.3, x, 9)` (9 decimal places)", "`assert x == pytest.approx(0.3)`"],
        ["Throws", "`Assert.Throws<T>(() => ...)`", "`with pytest.raises(T):`"],
        ["Collections", "`Assert.Contains(x, list)`, `Assert.Empty(list)`", "`assert x in items`, `assert not items`"],
        ["Setup per test", "constructor (and `Dispose`)", "`@pytest.fixture`"],
        ["Run", "`dotnet test`", "`pytest`"],
      ],
      notes: [
        "Other C# frameworks (NUnit, MSTest) and Python's built-in `unittest` work the same way with different spellings. The Test Pyramid and TDD, What to Test, Flaky Tests and Coverage in Professional Dev Skills cover how many tests of which kind to write.",
      ],
    },
  ],
  predict: [
    {
      lang: "python",
      code: src`
def add(a, b):
    return a + b

try:
    assert add(2, 2) == 4
    assert add(0.1, 0.2) == 0.3, "float sum"
    print("all passed")
except AssertionError as e:
    print("failed:", e)
`,
      output: "failed: float sum",
      distractors: ["all passed", "failed:", "failed: 0.30000000000000004 != 0.3"],
      why: "The first assertion passes; the second fails because 0.1 + 0.2 is 0.30000000000000004. The text after the comma becomes the AssertionError's message. Compare floats with a tolerance (`math.isclose`, `pytest.approx`).",
    },
    {
      lang: "python",
      code: src`
import math

print(0.1 + 0.2 == 0.3, math.isclose(0.1 + 0.2, 0.3))
`,
      output: "False True",
      distractors: ["True True", "False False", "True False"],
      why: "Most decimal fractions can't be stored exactly in binary, so exact equality fails. `math.isclose` allows a tiny relative difference, which is what float tests need.",
    },
    {
      lang: "csharp",
      code: src`
double total = 0.1 + 0.2;
Console.WriteLine(total == 0.3);
Console.WriteLine(Math.Abs(total - 0.3) < 1e-9);
`,
      output: "False\nTrue",
      distractors: ["True\nTrue", "False\nFalse", "True\nFalse"],
      why: "Same floating-point issue in C#. Checking that the difference is below a small tolerance is what `Assert.Equal(expected, actual, precision)` does for you.",
    },
    {
      lang: "csharp",
      code: src`
var cases = new (int Score, string Expected)[] { (90, "A"), (89, "B"), (75, "B"), (74, "C") };
int failed = 0;
foreach (var (score, expected) in cases)
    if (Grade(score) != expected) failed++;
Console.WriteLine($"{cases.Length - failed} passed, {failed} failed");

static string Grade(int s) => s >= 90 ? "A" : s > 75 ? "B" : "C";
`,
      output: "3 passed, 1 failed",
      distractors: ["4 passed, 0 failed", "2 passed, 2 failed", "0 passed, 4 failed"],
      why: "The bug is `s > 75` where `>= 75` was meant, so 75 gets a C. Only the boundary case catches it; 89 and 74 pass either way. That's why tests aim at the edges.",
    },
    {
      lang: "python",
      code: src`
def parse_percent(text):
    value = int(text.rstrip("%"))
    if not 0 <= value <= 100:
        raise ValueError("out of range")
    return value

results = []
for text in ["50%", "100%", "101%", "abc"]:
    try:
        results.append(parse_percent(text))
    except ValueError as e:
        results.append(str(e)[:12])
print(results)
`,
      output: "[50, 100, 'out of range', 'invalid lite']",
      distractors: ["[50, 100, 'out of range', 'out of range']", "[50, 100, 101, 'invalid lite']", "[50, 'out of range', 'out of range', 'invalid lite']"],
      why: "Both bad inputs raise ValueError, but for different reasons: \"abc\" fails inside `int()` with \"invalid literal for int()...\". A test with plain `pytest.raises(ValueError)` would pass for either, which is why `match=` is worth adding.",
    },
    {
      lang: "csharp",
      code: src`
static int Clamp(int v, int lo, int hi) => v < lo ? lo : v > hi ? lo : v;

var tests = new[] { (5, 5), (-3, 0), (12, 10), (10, 10) };
foreach (var (input, expected) in tests)
{
    int actual = Clamp(input, 0, 10);
    Console.WriteLine(actual == expected ? "pass" : $"FAIL: Clamp({input}) expected {expected}, got {actual}");
}
`,
      output: "pass\npass\nFAIL: Clamp(12) expected 10, got 0\npass",
      distractors: ["pass\npass\npass\npass", "pass\npass\nFAIL: Clamp(12) expected 10, got 12\npass", "pass\nFAIL: Clamp(-3) expected 0, got -3\nFAIL: Clamp(12) expected 10, got 0\npass"],
      why: "The copy-paste bug returns `lo` for values above the range. Only the input above 10 exposes it, and the message with expected and actual values shows exactly what went wrong, like a test framework's failure report.",
    },
    {
      lang: "python",
      code: src`
cart = []

def test_add_one():
    cart.append("bolt")
    assert len(cart) == 1

def test_add_two():
    cart.append("nut")
    cart.append("washer")
    assert len(cart) == 2

for test in [test_add_one, test_add_two]:
    try:
        test()
        print(test.__name__, "passed")
    except AssertionError:
        print(test.__name__, "failed")
`,
      output: "test_add_one passed\ntest_add_two failed",
      distractors: ["test_add_one passed\ntest_add_two passed", "test_add_one failed\ntest_add_two failed", "test_add_one failed\ntest_add_two passed"],
      why: "Both tests share one list, so the second sees the first one's \"bolt\" and finds 3 items. Each test should build its own data, which is what fixtures and xUnit's per-test constructor are for.",
    },
    {
      lang: "csharp",
      code: src`
var sent = new List<string>();
string Fake(string msg) { sent.Add(msg); return "ok"; }   // stands in for a real service

Report(Fake, "PT-1");
Report(Fake, "TT-2");
Console.WriteLine($"{sent.Count} {sent[^1]}");

static void Report(Func<string, string> send, string tag) => send($"status {tag}");
`,
      output: "2 status TT-2",
      distractors: ["2 TT-2", "1 status TT-2", "0"],
      why: "`Report` takes the sending function as a parameter, so a test can pass a fake that records what it was given instead of contacting a real service. `sent[^1]` is the last item.",
    },
  ],
  pitfalls: [
    "Tests that share data and so depend on running in a particular order.",
    "Comparing floating-point results with exact equality. Use a tolerance.",
    "Only testing the happy path: also test boundaries, empty input and the errors you promise to raise.",
    "Swapping `Assert.Equal`'s arguments. It's (expected, actual); the other way round makes failure messages misleading.",
    "Tests that need a real database, network or clock to pass. Pass in a stand-in instead (see Test Doubles).",
  ],
  next: [
    { id: "test-doubles", label: "Test Doubles: Stubs, Mocks, Fakes and Spies" },
    { id: "test-pyramid", label: "The Test Pyramid: Unit, Integration and End-to-End" },
    { id: "tdd-coverage", label: "TDD, What to Test, Flaky Tests and Coverage" },
    { id: "lang-modules", label: "Modules, Namespaces and Packages" },
  ],
};
