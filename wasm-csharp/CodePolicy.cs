using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace DsaAcademy.Runner;

// What learner code is allowed to touch. Lessons only ever need plain computation --
// collections, LINQ, strings, math -- so everything is checked against a namespace
// allowlist using Roslyn's own semantic model, before any of it runs. That blocks the
// file system, network, processes, reflection, threads, and interop outright rather than
// trying to catch them at runtime.
//
// This is the "don't let a learner (or a typo) touch the host" level of protection
// for a learning app, not a hardened sandbox: the code runs in the learner's own browser
// tab, in a Web Worker the page terminates after a per-test timeout (csharpWasmRunner.ts).
public static class CodePolicy
{
    private static readonly HashSet<string> AllowedNamespaces =
    [
        "System",
        "System.Collections",
        "System.Collections.Generic",
        "System.Linq",
        "System.Numerics",
        "System.Text",
        "System.Text.Json",
        "System.Text.RegularExpressions",
    ];

    // Types inside an otherwise-allowed namespace that reach outside plain computation.
    private static readonly HashSet<string> BlockedTypes =
    [
        "System.Activator",
        "System.AppContext",
        "System.AppDomain",
        "System.Console",
        "System.Environment",
        "System.GC",
        "System.Type",
    ];

    // The first violation, worded as the grader reports it, or
    // null when the code is fine.
    public static string? Check(Compilation compilation) => FindViolations(compilation).FirstOrDefault()?.Text;

    // One rule break. Text is what Check reports; Message is the same without the
    // "(line N)" suffix; Location is where it is. FindViolations is lazy, so Check still
    // stops at the first one; the in-browser editor's live diagnostics
    // (wasm-csharp/Program.cs Diagnose) list them all.
    public sealed record PolicyViolation(string Text, string Message, Location Location);

    public static IEnumerable<PolicyViolation> FindViolations(Compilation compilation)
    {
        foreach (var tree in compilation.SyntaxTrees)
        {
            var root = tree.GetCompilationUnitRoot();
            if (root.GetReferenceDirectives().Any() || root.GetLoadDirectives().Any())
            {
                const string directives = "#r and #load directives aren't allowed here.";
                SyntaxNode directive = (SyntaxNode?)root.GetReferenceDirectives().FirstOrDefault() ?? root.GetLoadDirectives().First();
                yield return new PolicyViolation(directives, directives, directive.GetLocation());
                yield break;
            }

            var model = compilation.GetSemanticModel(tree);
            foreach (var node in root.DescendantNodes())
            {
                if (node is UsingDirectiveSyntax) continue;

                var info = model.GetSymbolInfo(node);
                foreach (var symbol in info.Symbol is { } s ? [s] : info.CandidateSymbols)
                {
                    if (Violation(symbol) is { } message)
                    {
                        var location = node.GetLocation();
                        yield return new PolicyViolation(
                            $"{message} (line {location.GetLineSpan().StartLinePosition.Line + 1})", message, location);
                        break;
                    }
                }

                if (node is ExpressionSyntax expr && model.GetTypeInfo(expr).Type?.TypeKind == TypeKind.Dynamic)
                {
                    const string dynamic = "'dynamic' isn't allowed here.";
                    yield return new PolicyViolation(dynamic, dynamic, node.GetLocation());
                }
            }
        }
    }

    // True when learner code may use this symbol. The in-browser editor's autocomplete
    // (wasm-csharp/Program.cs) uses it so it only suggests what Check would accept.
    public static bool IsAllowed(ISymbol symbol) => Violation(symbol) is null;

    public static bool IsAllowedNamespace(string name) => AllowedNamespaces.Contains(name);

    private static string? Violation(ISymbol symbol)
    {
        if (symbol is INamespaceSymbol) return null;

        // Methods/properties/fields are judged by the type that declares them; extension
        // methods by their static class (Enumerable for LINQ, etc).
        var type = symbol as INamedTypeSymbol ?? symbol.ContainingType;
        if (symbol is IMethodSymbol { ReducedFrom: { } original }) type = original.ContainingType;
        if (type is null) return null; // locals, parameters, labels

        for (var outer = type; outer.ContainingType is { } parent; outer = parent) type = parent;
        var ns = type.ContainingNamespace;

        // Anything the learner (or the lesson preamble) declared lives in the script's
        // global namespace -- always fine.
        if (ns is null || ns.IsGlobalNamespace) return null;

        var nsName = ns.ToDisplayString();
        var fullName = $"{nsName}.{type.MetadataName}";
        if (BlockedTypes.Contains(fullName) || !AllowedNamespaces.Contains(nsName))
            return $"'{type.ToDisplayString()}' isn't available in lessons -- stick to collections, LINQ, strings, and math.";

        return null;
    }
}
