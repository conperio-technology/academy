using System.Reflection;
using System.Reflection.Metadata;
using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
using DsaAcademy.Runner;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Text;

[assembly: System.Runtime.Versioning.SupportedOSPlatform("browser")]

// Nothing to do at startup: the JS side (client/src/csharpWasmWorker.ts) calls the
// [JSExport] methods below once the runtime is up.
Console.WriteLine("csharp-wasm ready");

namespace DsaAcademy.CSharpWasm
{
    // The browser-side twin of runner/Program.cs: compiles the learner's code the same way
    // (a C# *script*, same imports, same `return JsonSerializer.Serialize(call)` per test),
    // rejects it with the same CodePolicy.cs (linked in from runner/), then runs the tests
    // one at a time. It runs inside a Web Worker; the page enforces the per-test timeout by
    // terminating that worker, exactly like the Python runner.
    //
    // One difference in mechanics, not results: the server compiles one script per test.
    // Here the code is compiled ONCE into a script that returns one lambda per test, and
    // every test loads that assembly afresh (Assembly.Load of the same bytes), so each test
    // still starts with fresh statics and re-runs the learner's top-level statements, as on
    // the server, without paying for N compiles.
    public static partial class Runner
    {
        private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

        // The same imports runner/Program.cs gives every script.
        private static readonly string[] Imports = ["System", "System.Linq", "System.Collections.Generic", "System.Text.Json"];

        private static List<MetadataReference>? _references;
        private static byte[]? _image;
        private static int _calls;

        // Compile metadata comes straight from the assemblies already loaded in this runtime
        // (TryGetRawMetadata) -- no separate reference-assembly download. These are kept
        // whole by TrimmerRootAssembly in the .csproj, so the metadata isn't trimmed.
        private static List<MetadataReference> References() => _references ??= LoadReferences();

        private static unsafe List<MetadataReference> LoadReferences()
        {
            Assembly[] assemblies =
            [
                typeof(object).Assembly,                                   // System.Private.CoreLib
                Assembly.Load("System.Runtime"),
                typeof(Enumerable).Assembly,                               // System.Linq
                typeof(Stack<>).Assembly,                                  // System.Collections
                typeof(System.Numerics.BigInteger).Assembly,               // System.Runtime.Numerics
                typeof(System.Text.RegularExpressions.Regex).Assembly,
                typeof(JsonSerializer).Assembly,
                Assembly.Load("System.Memory"),
                Assembly.Load("System.Collections.NonGeneric"),            // Queue, SortedList (System.Collections)
            ];
            // Plus everything those reference, transitively, as far as it's in the bundle: the
            // server's Roslyn scripting resolves the same closure from its references, so the
            // same code compiles (or fails with the same message) on both paths. The ones
            // holding allowed namespaces are rooted in the .csproj; the rest may be trimmed,
            // which only changes the wording of an error for a namespace CodePolicy rejects.
            var list = new List<MetadataReference>();
            var seen = new HashSet<string>();
            var queue = new Queue<Assembly>(assemblies);
            while (queue.TryDequeue(out var assembly))
            {
                var name = assembly.GetName().Name!;
                if (!seen.Add(name)) continue;
                if (!assembly.TryGetRawMetadata(out var blob, out var length))
                    throw new InvalidOperationException($"No metadata for {name}");
                var module = ModuleMetadata.CreateFromMetadata((IntPtr)blob, length);
                list.Add(AssemblyMetadata.Create(module).GetReference(display: name));
                foreach (var reference in assembly.GetReferencedAssemblies())
                {
                    if (seen.Contains(reference.Name!)) continue;
                    try
                    {
                        queue.Enqueue(Assembly.Load(reference));
                    }
                    catch (Exception)
                    {
                        // Not in the bundle (trimmed away entirely): nothing to compile against.
                    }
                }
            }
            return list;
        }

        // Trims an error or compile message like runner/Program.cs does.
        private static string Cap(string text) => text.Length <= RunnerLimits.MaxResultChars
            ? text
            : text[..RunnerLimits.MaxResultChars] + $"... (output truncated: {text.Length:N0} characters)";

        // The script a run compiles: the code (lesson preamble + learner code) followed by one
        // lambda per test call. Diagnose builds exactly the same one.
        private static CSharpCompilation GradingCompilation(string code, string[] calls)
        {
            var lambdas = string.Join(",\n", calls.Select(c => $"() => System.Text.Json.JsonSerializer.Serialize({c})"));
            var source = code + $"\nreturn new System.Func<string>[] {{\n{lambdas}\n}};";

            var tree = CSharpSyntaxTree.ParseText(source, new CSharpParseOptions(LanguageVersion.Latest, kind: SourceCodeKind.Script));
            var options = new CSharpCompilationOptions(
                    OutputKind.DynamicallyLinkedLibrary,
                    usings: Imports,
                    optimizationLevel: OptimizationLevel.Debug,
                    allowUnsafe: false,
                    concurrentBuild: false) // single-threaded runtime
                .WithScriptClassName("Submission#0"); // what Roslyn scripting (the server) uses
            return CSharpCompilation.CreateScriptCompilation(
                "Submission", tree, References(), options, returnType: typeof(object));
        }

        // Returns a JSON RunLine: CompileError set when the code doesn't compile or breaks the
        // policy, otherwise all null (and RunTest can be called once per call).
        [JSExport]
        public static string Compile(string code, string[] calls)
        {
            _image = null;
            _calls = calls.Length;
            if (calls.Length == 0) return Line(null, null, null);

            var compilation = GradingCompilation(code, calls);

            var errors = compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error).ToList();
            if (errors.Count > 0) return Line(Cap(string.Join("; ", errors.Select(d => d.ToString()))), null, null);

            if (CodePolicy.Check(compilation) is { } violation) return Line(violation, null, null);

            using var stream = new MemoryStream();
            var emit = compilation.Emit(stream);
            if (!emit.Success)
            {
                var emitErrors = emit.Diagnostics.Where(d => d.Severity == DiagnosticSeverity.Error);
                return Line(Cap(string.Join("; ", emitErrors.Select(d => d.ToString()))), null, null);
            }
            _image = stream.ToArray();
            return Line(null, null, null);
        }

        // Runs test `index` against the last successful Compile, in a freshly loaded copy of
        // the assembly. Returns a JSON RunLine (ActualJson or Error).
        [JSExport]
        public static string RunTest(int index)
        {
            if (_image is null || index < 0 || index >= _calls) return Line(null, null, "Nothing compiled to run.");
            try
            {
                var assembly = Assembly.Load(_image);
                var factory = assembly.GetType("Submission#0")!.GetMethod("<Factory>", BindingFlags.Public | BindingFlags.Static)!;
                Task<object> task;
                try
                {
                    task = (Task<object>)factory.Invoke(null, [new object?[2]])!;
                }
                catch (TargetInvocationException ex) when (ex.InnerException is not null)
                {
                    throw ex.InnerException;
                }
                // Learner code can't await anything (no Task APIs under CodePolicy), so the
                // script has always finished synchronously by now.
                if (!task.IsCompleted) return Line(null, null, "The script didn't finish synchronously.");
                var funcs = (Func<string>[])task.GetAwaiter().GetResult();
                var actual = funcs[index]();
                if (actual.Length > RunnerLimits.MaxResultChars)
                {
                    return Line(null, actual[..200] + "…",
                        $"Output truncated: the result was {actual.Length:N0} characters, the limit is {RunnerLimits.MaxResultChars:N0}");
                }
                return Line(null, actual, null);
            }
            catch (Exception ex)
            {
                return Line(null, null, Cap(ex.Message));
            }
        }

        // ---- Live diagnostics ------------------------------------------------------------
        //
        // What the editor underlines while the learner types: the compile errors and warnings
        // a run would hit, plus every CodePolicy violation. The source is built exactly as
        // Compile builds it (`prefix` is the lesson preamble plus its "\n", `calls` the tests'
        // calls), so a squiggle means what a failed run would say; nothing is emitted or run.
        // Positions are character offsets into `code`, the learner's part. An error in the
        // hidden preamble or in the appended test calls (a renamed method, a missing brace)
        // is moved to the first or the last line of the learner's code, saying where it was.
        // Returns a JSON array of { severity, id, message, start, end }.

        private record LiveDiagnostic(string Severity, string Id, string Message, int Start, int End);

        private const int MaxDiagnostics = 100;

        // CS8632, "the annotation for nullable reference types should only be used in code
        // within a '#nullable' annotations context": scripts compile with nullable off, as on
        // the server, but lessons write `Node?` anyway, so it would mark most starters.
        private static readonly HashSet<string> Quiet = ["CS8632"];

        [JSExport]
        public static string Diagnose(string prefix, string code, string[] calls)
        {
            try
            {
                return JsonSerializer.Serialize(DiagnoseAll(prefix, code, calls), Json);
            }
            catch
            {
                return "[]";
            }
        }

        private static List<LiveDiagnostic> DiagnoseAll(string prefix, string code, string[] calls)
        {
            var compilation = GradingCompilation(prefix + code, calls);
            var codeStart = prefix.Length;
            var codeEnd = codeStart + code.Length;
            var firstLineEnd = code.IndexOf('\n') is var nl and >= 0 ? nl : code.Length;
            var lastLineEnd = code.TrimEnd().Length;
            var lastLineStart = lastLineEnd == 0 ? 0 : code.LastIndexOf('\n', lastLineEnd - 1) + 1;

            var list = new List<LiveDiagnostic>();
            var seen = new HashSet<string>();
            void Add(string severity, string id, string message, TextSpan span)
            {
                int start, end;
                if (span.Start < codeStart)
                {
                    if (severity != "error") return;
                    (start, end, message) = (0, firstLineEnd, "In the lesson's hidden setup code: " + message);
                }
                else if (span.Start > codeEnd)
                {
                    if (severity != "error") return;
                    (start, end, message) = (lastLineStart, lastLineEnd, "Where the tests call your code: " + message);
                }
                else
                {
                    start = span.Start - codeStart;
                    end = Math.Min(span.End, codeEnd) - codeStart;
                }
                if (list.Count < MaxDiagnostics && seen.Add($"{start}:{end}:{message}"))
                    list.Add(new LiveDiagnostic(severity, id, message, start, end));
            }

            foreach (var d in compilation.GetDiagnostics())
            {
                if (d.Severity < DiagnosticSeverity.Warning || Quiet.Contains(d.Id) || !d.Location.IsInSource) continue;
                Add(d.Severity == DiagnosticSeverity.Error ? "error" : "warning", d.Id, d.GetMessage(), d.Location.SourceSpan);
            }

            // Every node that names a blocked symbol is reported, so File.ReadAllText(x) hits
            // the call, the member access, File and ReadAllText. Keep the first innermost one
            // per line and message.
            var violations = CodePolicy.FindViolations(compilation).Take(MaxDiagnostics).ToList();
            var lines = new HashSet<string>();
            foreach (var v in violations)
            {
                var span = v.Location.SourceSpan;
                if (violations.Any(o => o != v && span.Contains(o.Location.SourceSpan) && span != o.Location.SourceSpan)) continue;
                if (!lines.Add($"{v.Location.GetLineSpan().StartLinePosition.Line}:{v.Message}")) continue;
                Add("error", "policy", v.Message, span);
            }
            return list;
        }

        // ---- Autocomplete ----------------------------------------------------------------
        //
        // A cheap completion list from the compiler that's already loaded (no
        // Microsoft.CodeAnalysis.Features/Workspaces): the semantic model's LookupSymbols at
        // the caret. After "expr." it lists expr's members (with LINQ and other extension
        // methods), otherwise everything in scope plus keywords. Anything CodePolicy would
        // reject is left out, so the list only offers what a run accepts.
        // Returns a JSON array of { label, kind, detail }.

        private static readonly string[] Keywords =
        [
            "abstract", "as", "base", "bool", "break", "byte", "case", "catch", "char", "checked", "class", "const",
            "continue", "decimal", "default", "delegate", "do", "double", "else", "enum", "explicit", "extern",
            "false", "finally", "fixed", "float", "for", "foreach", "goto", "if", "implicit", "in", "int",
            "interface", "internal", "is", "lock", "long", "nameof", "namespace", "new", "null", "object",
            "operator", "out", "override", "params", "private", "protected", "public", "readonly", "record", "ref",
            "return", "sbyte", "sealed", "short", "sizeof", "static", "string", "struct", "switch", "this",
            "throw", "true", "try", "typeof", "uint", "ulong", "unchecked", "ushort", "using", "var", "virtual",
            "void", "when", "where", "while", "yield", "init", "get", "set", "with", "and", "or", "not",
        ];

        private const int MaxCompletions = 2000;

        private record Completion(string Label, string Kind, string Detail);

        [JSExport]
        public static string Complete(string code, int position)
        {
            try
            {
                return JsonSerializer.Serialize(CompleteAt(code, position), Json);
            }
            catch
            {
                return "[]";
            }
        }

        private static List<Completion> CompleteAt(string code, int position)
        {
            position = Math.Clamp(position, 0, code.Length);
            var tree = CSharpSyntaxTree.ParseText(code, new CSharpParseOptions(LanguageVersion.Latest, kind: SourceCodeKind.Script));
            var options = new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, usings: Imports, concurrentBuild: false)
                .WithScriptClassName("Submission#0");
            var compilation = CSharpCompilation.CreateScriptCompilation("Submission", tree, References(), options, returnType: typeof(object));
            var model = compilation.GetSemanticModel(tree);
            var root = tree.GetCompilationUnitRoot();

            // The token just left of the caret: the word being typed, or the "." itself.
            var token = root.FindToken(Math.Max(0, position - 1));
            if (token.SpanStart >= position) token = token.GetPreviousToken();
            if (token.Span.End == position && (token.IsKind(SyntaxKind.IdentifierToken) || SyntaxFacts.IsKeywordKind(token.Kind())))
                token = token.GetPreviousToken();
            // Inside a comment or string there's nothing sensible to offer.
            var trivia = root.FindTrivia(Math.Max(0, position - 1));
            if (trivia.IsKind(SyntaxKind.SingleLineCommentTrivia) || trivia.IsKind(SyntaxKind.MultiLineCommentTrivia))
                return [];
            var at = root.FindToken(Math.Max(0, position - 1));
            if (at.Span.Contains(position - 1) && (at.IsKind(SyntaxKind.StringLiteralToken) || at.IsKind(SyntaxKind.CharacterLiteralToken)))
                return [];

            IEnumerable<ISymbol> symbols;
            var members = false;
            if (token.IsKind(SyntaxKind.DotToken) && token.Parent is MemberAccessExpressionSyntax access)
            {
                members = true;
                symbols = MembersOf(model, access.Expression, position);
            }
            else if (token.IsKind(SyntaxKind.DotToken) && token.Parent is QualifiedNameSyntax qualified)
            {
                // "nums." followed by a name on the next line parses as a qualified type name
                // ("nums.var y = ..."), so bind the left side as an expression instead.
                members = true;
                symbols = MembersOf(model, qualified.Left, position, speculative: true);
            }
            else if (token.IsKind(SyntaxKind.DotToken) && token.Parent is MemberBindingExpressionSyntax binding
                     && binding.FirstAncestorOrSelf<ConditionalAccessExpressionSyntax>() is { } conditional)
            {
                members = true; // x?.Member
                symbols = MembersOf(model, conditional.Expression, position);
            }
            else if (token.IsKind(SyntaxKind.DotToken) || token.IsKind(SyntaxKind.DotDotToken) || token.IsKind(SyntaxKind.NumericLiteralToken))
            {
                return []; // "1." or ".." : no member list
            }
            else
            {
                symbols = model.LookupSymbols(position);
            }

            var items = new List<Completion>();
            foreach (var group in symbols.Where(Offerable).GroupBy(s => s.Name).OrderBy(g => g.Key, StringComparer.Ordinal))
            {
                var first = group.First();
                var count = group.Count();
                var detail = first.ToDisplayString(SymbolDisplayFormat.CSharpShortErrorMessageFormat);
                if (count > 1) detail += $" (+{count - 1} overload{(count > 2 ? "s" : "")})";
                items.Add(new Completion(first.Name, KindOf(first), detail));
                if (items.Count >= MaxCompletions) break;
            }
            if (!members)
            {
                var taken = items.Select(i => i.Label).ToHashSet();
                items.AddRange(Keywords.Where(k => !taken.Contains(k)).Select(k => new Completion(k, "keyword", "keyword")));
            }
            return items;
        }

        // Members reachable through `expression.`: static members (and nested types) when it
        // names a type, child namespaces and types when it names a namespace, otherwise the
        // instance members of its type, extension methods included.
        private static IEnumerable<ISymbol> MembersOf(SemanticModel model, ExpressionSyntax expression, int position, bool speculative = false)
        {
            ISymbol? symbol;
            ITypeSymbol? type;
            if (speculative)
            {
                var asExpression = SyntaxFactory.ParseExpression(expression.ToString());
                symbol = model.GetSpeculativeSymbolInfo(expression.SpanStart, asExpression, SpeculativeBindingOption.BindAsExpression).Symbol;
                type = model.GetSpeculativeTypeInfo(expression.SpanStart, asExpression, SpeculativeBindingOption.BindAsExpression).Type;
            }
            else
            {
                symbol = model.GetSymbolInfo(expression).Symbol;
                type = model.GetTypeInfo(expression).Type;
            }
            if (symbol is INamespaceSymbol ns)
                return model.LookupNamespacesAndTypes(position, ns);
            if (symbol is INamedTypeSymbol named)
                return model.LookupStaticMembers(position, named);

            if (type is null or IErrorTypeSymbol) return [];
            return model.LookupSymbols(position, type, includeReducedExtensionMethods: true).Where(s => !s.IsStatic || s is IMethodSymbol { ReducedFrom: not null });
        }

        private static bool Offerable(ISymbol symbol)
        {
            if (!symbol.CanBeReferencedByName || symbol.IsImplicitlyDeclared) return false;
            if (symbol.Name.StartsWith('<') || symbol.Name.Contains('#')) return false;
            if (symbol is INamespaceSymbol ns)
            {
                // Only namespaces on the allowlist ("System" is one).
                return CodePolicy.IsAllowedNamespace(ns.ToDisplayString());
            }
            return CodePolicy.IsAllowed(symbol);
        }

        private static string KindOf(ISymbol symbol) => symbol switch
        {
            IMethodSymbol { MethodKind: MethodKind.ReducedExtension } => "extension",
            IMethodSymbol => "method",
            IPropertySymbol => "property",
            IFieldSymbol { IsConst: true } or IFieldSymbol { ContainingType.TypeKind: TypeKind.Enum } => "constant",
            IFieldSymbol => "field",
            IEventSymbol => "event",
            ILocalSymbol or IRangeVariableSymbol => "variable",
            IParameterSymbol => "variable",
            INamespaceSymbol => "namespace",
            INamedTypeSymbol { TypeKind: TypeKind.Interface } => "interface",
            INamedTypeSymbol { TypeKind: TypeKind.Enum } => "enum",
            INamedTypeSymbol { TypeKind: TypeKind.Struct } => "struct",
            INamedTypeSymbol => "class",
            _ => "text",
        };

        // Managed heap size, for the prototype's measurements.
        [JSExport]
        public static double ManagedHeapBytes() => GC.GetTotalMemory(false);

        private static string Line(string? compileError, string? actualJson, string? error) =>
            JsonSerializer.Serialize(new RunLine(compileError, actualJson, error), Json);
    }
}
