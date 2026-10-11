# runner/ (sandboxed C# runner)

A console app the API starts once per C# submission (`server/Execution/CSharpExecutor.cs`).
C# is now graded in the browser by default (`../wasm-csharp/`), which compiles `CodePolicy.cs`
and `RunnerProtocol.cs` in from here; this runner is the fallback. A change to either file
applies to both paths (rebuild with `wasm-csharp/build.sh`).
Built automatically by `dotnet build server/server.csproj`; `runner.dll` lands next to the
API's own output.

- `RunnerProtocol.cs`: the API writes one `RunRequest { Code, Calls }` as JSON on stdin; the
  runner writes one `RunLine` JSON per line on stdout: a single compile error, or one result
  per call in order (so results before a hang or crash survive). Results are capped at
  `RunnerLimits.MaxResultChars`.
- `Program.cs`: compiles the preamble + learner code as a Roslyn script, checks it with
  `CodePolicy`, then evaluates each call and serializes the result to JSON.
- `CodePolicy.cs`: the allowlist. Only these namespaces: `System`, `System.Collections`,
  `System.Collections.Generic`, `System.Linq`, `System.Numerics`, `System.Text`,
  `System.Text.Json`, `System.Text.RegularExpressions` (child namespaces are not included).
  Blocked inside them: `Activator`, `AppContext`, `AppDomain`, `Console`, `Environment`, `GC`,
  `Type`. Also rejected: `#r`/`#load`, `dynamic`. `IsAllowed`/`IsAllowedNamespace` let the
  browser editor's autocomplete offer only what `Check` accepts; `FindViolations` (which
  `Check` takes the first of) gives the browser editor's live squiggles every violation
  with its location.

Consequences for content: graded exercises can't use `System.Threading`,
`System.Threading.Tasks` (no async/await, Task, Parallel), `System.Collections.Concurrent`,
`System.Reflection`, `System.IO`, or `Console.WriteLine`. Those topics are taught in tool
lessons, not graded. Exercises return a value; they don't print.

The API adds the outer limits (per-test timeout that kills the process, GC heap cap,
concurrency cap, output cap). In the browser the page terminates the worker after 5 s per
test, and results are capped with the same `RunnerLimits`. Changing the allowlist is a
security decision: say so explicitly in the PR and keep `CodePolicy` and this file in sync.
