using System.Text.Json;
using DsaAcademy.Runner;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

// Runs one learner submission in its own short-lived process, so an infinite loop, a
// stack overflow, or a runaway allocation takes down this process instead of the API.
// See RunnerProtocol.cs for the stdin/stdout format and CodePolicy.cs for what the code
// is allowed to use.

var json = new JsonSerializerOptions(JsonSerializerDefaults.Web);
var stdout = Console.Out;
Console.SetOut(TextWriter.Null);
Console.SetError(TextWriter.Null);

var request = JsonSerializer.Deserialize<RunRequest>(Console.In.ReadToEnd(), json)
    ?? throw new InvalidOperationException("Empty run request");

void Emit(RunLine line)
{
    stdout.WriteLine(JsonSerializer.Serialize(line, json));
    stdout.Flush();
}

// Trims an error or compile message to RunnerLimits.MaxResultChars.
string Cap(string text) => text.Length <= RunnerLimits.MaxResultChars
    ? text
    : text[..RunnerLimits.MaxResultChars] + $"... (output truncated: {text.Length:N0} characters)";

var options = ScriptOptions.Default
    .WithReferences(
        typeof(object).Assembly,
        typeof(Enumerable).Assembly,
        typeof(List<>).Assembly,
        typeof(System.Numerics.BigInteger).Assembly,
        typeof(System.Text.RegularExpressions.Regex).Assembly,
        typeof(JsonSerializer).Assembly)
    .WithImports("System", "System.Linq", "System.Collections.Generic", "System.Text.Json")
    .WithAllowUnsafe(false)
    .WithMetadataResolver(ScriptMetadataResolver.Default.WithSearchPaths())
    .WithSourceResolver(ScriptSourceResolver.Default.WithSearchPaths());

string Script(string call) => request.Code + $"\nreturn System.Text.Json.JsonSerializer.Serialize({call});";

// Every call shares the same learner code, so checking the first script covers them all.
if (request.Calls.Count > 0)
{
    var compilation = CSharpScript.Create<string>(Script(request.Calls[0]), options).GetCompilation();
    var errors = compilation.GetDiagnostics()
        .Where(d => d.Severity == Microsoft.CodeAnalysis.DiagnosticSeverity.Error)
        .ToList();
    if (errors.Count > 0)
    {
        Emit(new RunLine(Cap(string.Join("; ", errors.Select(d => d.ToString()))), null, null));
        return;
    }

    if (CodePolicy.Check(compilation) is { } violation)
    {
        Emit(new RunLine(violation, null, null));
        return;
    }
}

foreach (var call in request.Calls)
{
    try
    {
        var actual = await CSharpScript.EvaluateAsync<string>(Script(call), options);
        if (actual.Length > RunnerLimits.MaxResultChars)
        {
            // Too big to send back (and certainly not the expected answer): show the start of it.
            Emit(new RunLine(null, actual[..200] + "…",
                $"Output truncated: the result was {actual.Length:N0} characters, the limit is {RunnerLimits.MaxResultChars:N0}"));
            continue;
        }
        Emit(new RunLine(null, actual, null));
    }
    catch (CompilationErrorException ex)
    {
        Emit(new RunLine(Cap(string.Join("; ", ex.Diagnostics.Select(d => d.ToString()))), null, null));
        return;
    }
    catch (Exception ex)
    {
        Emit(new RunLine(null, null, Cap(ex.Message)));
    }
}
