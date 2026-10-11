using System.Collections.Concurrent;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using DsaAcademy.Content;
using DsaAcademy.Runner;

namespace DsaAcademy.Execution;

// Runs learner-submitted C# against a concept's test cases. The code never runs inside
// this process: each submission gets its own short-lived `runner` process (see
// runner/Program.cs), which first rejects anything outside a plain-computation allowlist
// (runner/CodePolicy.cs -- no files, network, processes, reflection, threads) and then
// runs the tests one by one. From out here, every run is bounded by:
//   - a per-test timeout -- the process is killed, which actually stops a CPU-bound
//     infinite loop (cancelling a Roslyn script in-process never did);
//   - a GC heap cap on the child, so a runaway allocation fails there, not here;
//   - a cap on concurrent runs, so a burst of submissions can't starve the API, with
//     at most one run per user and a bounded wait for a free slot;
//   - a cap on how much output is read back (per line and per run), so a huge return
//     value can't make this process buffer it.
// A stack overflow or crash also only ever takes down the child.
//
// Settings (appsettings.json "Runner" section, or Runner__* env vars): see RunnerOptions.
public sealed class CSharpExecutor(RunnerOptions options, ILogger<CSharpExecutor> logger)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    private readonly SemaphoreSlim _slots = new(options.MaxConcurrentRuns);

    // Users with a run in flight (or waiting for a slot).
    private readonly ConcurrentDictionary<string, byte> _activeUsers = new();

    // Rejected is set (and nothing ran) when this user already has a run going, or no
    // runner slot freed up within SlotWaitTimeout.
    public async Task<(RunRejection? Rejected, bool AllPassed, List<TestResult> Results, string? CompileError)> RunTests(
        string userId, IConcept concept, string userCode, CancellationToken cancellationToken)
    {
        var preamble = concept.CSharpHarnessPreamble is { } p ? p + "\n" : "";
        var request = new RunRequest(
            preamble + userCode,
            concept.TestCases.Select(t => concept.CSharpCallTemplate.Replace("{input}", t.InputLiteral)).ToList());

        if (!_activeUsers.TryAdd(userId, 0)) return (RunRejection.AlreadyRunning, false, [], null);
        try
        {
            if (!await _slots.WaitAsync(options.SlotWaitTimeout, cancellationToken)) return (RunRejection.Busy, false, [], null);
            try
            {
                var (allPassed, results, compileError) = await Run(concept, request, cancellationToken);
                return (null, allPassed, results, compileError);
            }
            finally
            {
                _slots.Release();
            }
        }
        finally
        {
            _activeUsers.TryRemove(userId, out _);
        }
    }

    private async Task<(bool, List<TestResult>, string?)> Run(IConcept concept, RunRequest request, CancellationToken cancellationToken)
    {
        var results = new List<TestResult>();
        using var process = new Process { StartInfo = StartInfo() };
        process.Start();
        // Drain stderr so a crash dump (a stack overflow prints a long trace) can't fill
        // the pipe and block the child.
        process.ErrorDataReceived += (_, _) => { };
        process.BeginErrorReadLine();

        var output = new BoundedLineReader(process.StandardOutput, options.MaxRunOutputChars);
        try
        {
            await process.StandardInput.WriteAsync(JsonSerializer.Serialize(request, Json));
            process.StandardInput.Close();

            foreach (var test in concept.TestCases)
            {
                // The first line also pays for process startup and compiling the code (about
                // 2 s on an idle machine, several times that with parallel compiles on few
                // CPUs), so it gets a bigger budget; later tests keep the tight TestTimeout.
                var timeout = results.Count == 0 ? options.FirstTestTimeout : options.TestTimeout;
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                cts.CancelAfter(timeout);

                string? lineText;
                bool tooLong;
                try
                {
                    (lineText, tooLong) = await output.ReadLineAsync(RunnerLimits.MaxLineChars, cts.Token);
                }
                catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
                {
                    Kill(process);
                    results.Add(new TestResult(test.InputLiteral, test.ExpectedJson, null, false, "Timed out (infinite loop?)"));
                    break;
                }

                if (tooLong)
                {
                    // The runner trims results itself, so this only happens if it misbehaves.
                    results.Add(new TestResult(test.InputLiteral, test.ExpectedJson, null, false,
                        "Output truncated: the run produced more output than the limit"));
                    if (output.OverBudget)
                    {
                        Kill(process);
                        break;
                    }
                    continue;
                }

                if (lineText is null)
                {
                    // The child died mid-run: stack overflow, hitting the memory cap, etc.
                    results.Add(new TestResult(test.InputLiteral, test.ExpectedJson, null, false,
                        "The run crashed (very deep recursion, or using too much memory?)"));
                    break;
                }

                var line = JsonSerializer.Deserialize<RunLine>(lineText, Json)!;
                if (line.CompileError is not null) return (false, results, line.CompileError);

                var passed = line.ActualJson is not null && JsonEquals(line.ActualJson, test.ExpectedJson);
                results.Add(new TestResult(test.InputLiteral, test.ExpectedJson, line.ActualJson, passed, line.Error));
            }

            // Anything left after a timeout or crash never ran.
            foreach (var test in concept.TestCases.Skip(results.Count))
                results.Add(new TestResult(test.InputLiteral, test.ExpectedJson, null, false, "Skipped -- an earlier test didn't finish"));

            return (results.All(r => r.Passed), results, null);
        }
        finally
        {
            Kill(process);
        }
    }

    // Reads the runner's stdout one line at a time without ever holding more than
    // maxLineChars of a line (the rest of an over-long line is read and dropped), and
    // stops reading altogether once the whole run has produced maxTotalChars.
    private sealed class BoundedLineReader(StreamReader reader, long maxTotalChars)
    {
        private readonly char[] _buffer = new char[8192];
        private int _pos, _len;
        private long _total;

        public bool OverBudget => _total > maxTotalChars;

        // Line is null at the end of the output; TooLong when the line was cut short.
        public async Task<(string? Line, bool TooLong)> ReadLineAsync(int maxLineChars, CancellationToken cancellationToken)
        {
            var line = new StringBuilder();
            var tooLong = false;
            while (true)
            {
                if (_pos == _len)
                {
                    if (OverBudget) return (null, true);
                    _len = await reader.ReadAsync(_buffer, cancellationToken);
                    _pos = 0;
                    if (_len == 0) return (line.Length > 0 ? line.ToString() : null, tooLong);
                    _total += _len;
                }

                var newline = Array.IndexOf(_buffer, '\n', _pos, _len - _pos);
                var end = newline < 0 ? _len : newline;
                var take = Math.Min(end - _pos, maxLineChars - line.Length);
                line.Append(_buffer, _pos, take);
                if (take < end - _pos) tooLong = true;
                _pos = end;
                if (newline < 0) continue;

                _pos++;
                if (line.Length > 0 && line[^1] == '\r') line.Length--;
                return (line.ToString(), tooLong);
            }
        }
    }

    private ProcessStartInfo StartInfo()
    {
        var info = new ProcessStartInfo(options.DotnetPath)
        {
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };
        info.ArgumentList.Add(options.RunnerPath ?? Path.Combine(AppContext.BaseDirectory, "runner.dll"));
        info.Environment["DOTNET_GCHeapHardLimit"] = $"0x{options.MemoryLimitMb * 1024L * 1024L:X}";
        // Nothing the child needs from our environment (connection strings, keys, etc).
        foreach (var key in info.Environment.Keys.Where(k => k.StartsWith("ASPNETCORE_") || k.StartsWith("ConnectionStrings")).ToList())
            info.Environment.Remove(key);
        return info;
    }

    private void Kill(Process process)
    {
        try
        {
            if (!process.HasExited) process.Kill(entireProcessTree: true);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Couldn't kill runner process {Pid}", process.Id);
        }
    }

    private static bool JsonEquals(string a, string b)
    {
        try
        {
            return JsonNode.DeepEquals(JsonNode.Parse(a), JsonNode.Parse(b));
        }
        catch
        {
            return false;
        }
    }
}

public enum RunRejection { AlreadyRunning, Busy }

public sealed class RunnerOptions
{
    // `dotnet` on PATH works locally and in the container image.
    public string DotnetPath { get; set; } = "dotnet";

    // Defaults to runner.dll next to the API's own build output.
    public string? RunnerPath { get; set; }

    public int MaxConcurrentRuns { get; set; } = 4;
    public int MemoryLimitMb { get; set; } = 256;
    public int MaxCodeLength { get; set; } = 20_000;
    // Most output read back from one run; beyond it the run is stopped.
    public long MaxRunOutputChars { get; set; } = 1024 * 1024;
    // How long a run waits for one of the MaxConcurrentRuns slots before giving up as busy.
    public TimeSpan SlotWaitTimeout { get; set; } = TimeSpan.FromSeconds(30);
    public TimeSpan FirstTestTimeout { get; set; } = TimeSpan.FromSeconds(20);
    public TimeSpan TestTimeout { get; set; } = TimeSpan.FromSeconds(5);
}
