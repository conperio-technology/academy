namespace DsaAcademy.Content.Tools;

public class LangTestingTool : ITool
{
    public string Id => "lang-testing";
    public string Section => "Programming in C# & Python";
    public string Track => "intermediate";
    public int Order => 1900;
    public string Title => "Unit Testing with xUnit and pytest";
    public string OneLiner => "Writing your first unit tests: arrange, act, assert, xUnit's Fact and Theory next to pytest functions and parametrize, testing for exceptions, per-test setup with constructors and fixtures, running the tests and reading failures.";
    public string KeyTakeaway =>
        "A unit test calls one small piece of code with chosen inputs and asserts the result. Test the boundaries and the " +
        "errors, not just the happy path; keep tests independent (fresh data for each); compare floats with a tolerance; " +
        "and run the whole suite on every change, with dotnet test or pytest.";

    public ToolKind ToolKind => ToolKind.LangTesting;

    public string Explanation =>
        "A unit test is a small, automatic check of one piece of your code: call this function with these inputs and " +
        "assert that the result is that. A good set of tests runs in seconds and tells you immediately when a change " +
        "breaks something that used to work, which is what lets teams change code confidently.\n\n" +
        "The lesson writes the same tests twice: with xUnit, the most widely used C# test framework, and pytest, the most " +
        "widely used Python one. Both find your tests by convention, run each one separately, and report exactly which " +
        "assertion failed with what values. You'll see single tests, parametrized tests that run the same check over a " +
        "table of inputs, tests that check an exception is raised, and per-test setup (an xUnit constructor, a pytest " +
        "test fixture).\n\n" +
        "Test frameworks can't run inside the exercise editor, so the framework samples were run with dotnet test and " +
        "pytest for this lesson and are meant for your own projects, while the predict-the-output questions use plain " +
        "code to show the ideas: boundaries, tolerances for floats, error messages and test isolation. Every graded " +
        "exercise in this app is itself a set of unit tests run against your code.";
}
