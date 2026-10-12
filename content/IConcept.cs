namespace DsaAcademy.Content;

// One lesson. Each concept owns its own explanation, visualization, starter code, and
// test cases; the export and the client's graders are generic over this interface, so adding
// a new concept never means touching either.
public interface IConcept
{
    string Id { get; }

    // Top-level sidebar grouping. Defaulted so the existing DSA concepts don't need
    // touching -- only a concept in a different section (none yet) overrides this.
    string Section => "Data Structures & Algorithms";
    string Track { get; }

    // Sidebar sort key within a section (lower = earlier), stable-sorted so ties keep
    // registry order. Defaulted to 100 so almost nothing needs to set this explicitly --
    // it only matters for content that has to appear before everything else regardless
    // of which track/registry position it's declared in, e.g. a Big O lesson that
    // should sit above Fundamentals even though Fundamentals was written first.
    int Order => 100;
    string Title { get; }
    string OneLiner { get; }

    // A single crisp, quotable fact/rule -- the thing you'd want to remember skimming
    // back through lessons later, e.g. "Strings are effectively character arrays, so
    // most array techniques apply directly." Shown as a callout above the full
    // Explanation, not a replacement for it.
    string KeyTakeaway { get; }

    string Explanation { get; }
    VisualizerKind VisualizerKind { get; }

    // Keyed by language id ("csharp", "python"). A language is only offered in the UI
    // if it has both starter code and a function name here.
    Dictionary<string, string> StarterCode { get; }
    Dictionary<string, string> FunctionNames { get; }

    List<TestCase> TestCases { get; }
    List<VisualizationStep> BuildVisualizationSteps();

    // Extra code made available ahead of the user's own code -- e.g. a ListNode class +
    // a helper to build one from an int[], for linked-list concepts. Most concepts
    // don't need one. Both are shipped to the client: the C# preamble is compiled with the
    // user's code by the in-browser grader (wasm-csharp/), the Python one runs before it
    // in Pyodide.
    string? CSharpHarnessPreamble => null;
    string? PythonHarnessPreamble => null;

    // How to invoke the user's solution, with "{input}" standing in for the test
    // case's input array rendered as that language's literal (e.g. "[1, 2, 3]" works
    // as both JSON and a Python list literal; C# additionally needs "new int[] {...}").
    // Most concepts are just "FunctionName({input})"; a concept like linked-list
    // traversal wraps the input first: "traverse_to_array(build_list({input}))".
    string CSharpCallTemplate { get; }
    string PythonCallTemplate { get; }

    // Patterns-track-only (default empty, so Fundamentals concepts don't need to touch
    // this): "if you see X, think this pattern" recognition cues, common mistakes
    // applying it, and the sibling pattern(s) it's easily confused with. They're first-class fields
    // rather than prose inside Explanation so the UI can show them in their own panel.
    List<string> RecognitionSignals => [];
    List<string> Gotchas => [];
    List<string> ConfusableWith => [];

    // A transfer exercise names the lesson it follows: the same idea under a changed
    // requirement or on an unfamiliar problem. The parent then links to it ("Next: transfer
    // problem"), see ConceptRegistry.TransferNext.
    string? TransferOf => null;
}
