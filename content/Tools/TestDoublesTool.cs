namespace DsaAcademy.Content.Tools;

public class TestDoublesTool : ITool
{
    public string Id => "test-doubles";
    public string Section => "Professional Dev Skills";
    public string Track => "testing";
    public string Title => "Test Doubles: Stubs, Mocks, Fakes and Spies";
    public string OneLiner => "Stand-ins for real dependencies, the difference between checking state and checking interactions, and when not to mock at all.";
    public string KeyTakeaway =>
        "A test double replaces a real dependency so a test is fast and deterministic. A dummy only fills a parameter. " +
        "A stub returns canned answers so the code under test can run, and you assert on the result. A spy records how " +
        "it was called so you can check afterwards. A mock is set up with expected calls and the test fails if they don't " +
        "happen. A fake is a working but simplified implementation, such as an in-memory repository. Stubs and fakes " +
        "support state checks; spies and mocks check interactions, which couples tests to implementation, so use them " +
        "only when the call itself is the behaviour.";

    public ToolKind ToolKind => ToolKind.TestDoubles;

    public string Explanation =>
        "Code under test usually depends on things that are slow, nondeterministic (can give different results on different runs) or have side effects (change something outside the code, like sending an email): a database, " +
        "an email service, the clock, a payment API. A test double, Gerard Meszaros' term from xUnit Test Patterns, " +
        "takes the dependency's place in the test. It only works if the code receives its dependencies through an " +
        "interface, usually by constructor injection (see Services and Dependency Injection), rather than creating " +
        "them with new.\n\n" +
        "There are five kinds. A dummy is passed only because a signature needs it and is never used, such as a null " +
        "logger. A stub answers calls with canned values (\"the exchange rate is 1.1\", \"this user exists\") so the " +
        "code can run, and the test asserts on the code's output or state. A spy also records the calls it receives, " +
        "and the test inspects that record after the act step. A mock is configured up front with the calls it expects, " +
        "and verifying it fails the test if the interaction didn't happen as specified. A fake is a real, working " +
        "implementation that takes a shortcut unsuitable for production: an in-memory repository backed by a " +
        "Dictionary, SQLite in memory instead of SQL Server, or .NET 8's FakeTimeProvider for a controllable clock.\n\n" +
        "The important split is state verification versus behaviour verification. With a stub or fake, you check what " +
        "came out: the returned total, the saved order. With a mock or spy, you check what the code did to its " +
        "collaborators: Send was called once with this address. Interaction checks are the right tool when the " +
        "interaction is the point (an email must be sent, a payment must not be charged twice), but they break whenever " +
        "the implementation changes even if behaviour didn't. Over-mocked tests that restate the implementation line " +
        "by line are a common code-review complaint.\n\n" +
        "Libraries blur the vocabulary. Moq calls every object it creates a Mock, whether you use it as a stub " +
        "(Setup and Returns) or a mock (Verify). NSubstitute uses Substitute.For<T>(), Returns() and Received(). " +
        "Interviewers care that you know the roles, not the library's names. Two widely used rules: don't mock types " +
        "you don't own (wrap a third-party SDK in your own small interface and double that), and don't mock values or " +
        "simple data classes, just create real ones. Where a fake is cheap, it usually makes tests more readable and less " +
        "brittle than a mock.";
}
