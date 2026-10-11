namespace DsaAcademy.Content;

// A single frame in a canned, step-through visualization. Kept generic (a small bag of
// named values) so new concepts can add whatever fields their renderer needs without
// changing this type.
public record VisualizationStep(
    Dictionary<string, object> State,
    int[] HighlightIndices,
    string Message
);

// Which frontend renderer a concept's VisualizationSteps are meant for. Add a case here
// (and a matching React component) when a concept's data shape doesn't fit the existing
// ones -- e.g. "Tree", "Graph" later.
public enum VisualizerKind
{
    Array,
    LinkedList,
    Stack,
    HashMap,
    CallStack,
    Tree,
    Graph,
    Grid,
}

// A test case is one call: a literal that's valid source in C#, Python, AND as JSON
// (see Content/Lit.cs) for the argument(s), plus the expected return value as JSON. The
// executor compares actual vs. expected as *parsed* JSON, not raw text, so formatting
// differences (spacing, Python's `True` vs C#'s `true` both lowering to JSON `true`)
// don't cause false failures. Multi-argument calls just join their literals with a
// comma via Lit.Args -- {input} is substituted as one blob either way.
public record TestCase(string InputLiteral, string ExpectedJson);

public record TestResult(string InputDisplay, string ExpectedJson, string? ActualJson, bool Passed, string? Error);

// One row in the sidebar, covering both lesson kinds (IConcept "practice" lessons and
// ITool "tool" lessons) -- Kind tells the frontend which detail endpoint to call
// (/api/lessons/{id} vs /api/tools/{id}) and which view component to render.
// Completed is always false for tools; there's no pass/fail for a calculator.
public record NavItem(string Id, string Kind, string Section, string Track, string Title, string OneLiner, bool Completed);

public record TestCaseDisplay(string InputDisplay, string ExpectedJson);

public record ConceptDetail(
    string Id,
    string Section,
    string Track,
    string Title,
    string OneLiner,
    string KeyTakeaway,
    string Explanation,
    VisualizerKind VisualizerKind,
    Dictionary<string, string> StarterCode,
    Dictionary<string, string> FunctionNames,
    List<TestCaseDisplay> TestCases,
    List<VisualizationStep> VisualizationSteps,
    bool Completed,
    string? PythonHarnessPreamble,
    string? PythonCallTemplate,
    // Only used by the "Run in browser (beta)" C# prototype (wasm-csharp/), which needs
    // what the server runner gets: the C# preamble and how to call the solution.
    string? CSharpHarnessPreamble,
    string? CSharpCallTemplate,
    // Patterns-track-only content (empty for ordinary Fundamentals concepts): the
    // recognition cues, common mistakes, and easily-confused sibling patterns that
    // "here's the trick that makes it click" is supposed to carry.
    List<string> RecognitionSignals,
    List<string> Gotchas,
    List<string> ConfusableWith,
    ComplexityInfo? Complexity,
    // Keyed by language id, like StarterCode. Sent with the lesson but only shown once
    // the reveal unlocks (passed, or Attempts reaches the client's threshold).
    Dictionary<string, string> ReferenceSolutions,
    // Total runs across languages for the current user -- drives that unlock.
    int Attempts,
    // How the current user has practised it (guided or bare passes, reference seen).
    DsaAcademy.Data.LessonEvidence Evidence,
    // Transfer exercises: the lesson this one follows, and the one that follows this.
    LessonLink? TransferOf,
    LessonLink? TransferNext
);

public record LessonLink(string Id, string Title);
