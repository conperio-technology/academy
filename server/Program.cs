using DsaAcademy.Content;
using DsaAcademy.Data;
using DsaAcademy.Execution;
using Microsoft.EntityFrameworkCore;

// `--export-content <dir>`: write the lesson content as static JSON for the static site
// (Content/ContentExport.cs) and exit, without opening a database or a port.
if (args is ["--export-content", var exportDir])
{
    ContentExport.Write(exportDir);
    return;
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(
        new System.Text.Json.Serialization.JsonStringEnumConverter(System.Text.Json.JsonNamingPolicy.CamelCase)));

// Next to the app by default; the container points this at a mounted volume instead
// (DbPath env var), since the image's own filesystem doesn't survive a restart.
var dbPath = builder.Configuration["DbPath"] ?? Path.Combine(builder.Environment.ContentRootPath, "progress.db");
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite($"Data Source={dbPath}"));

var runnerOptions = builder.Configuration.GetSection("Runner").Get<RunnerOptions>() ?? new RunnerOptions();
builder.Services.AddSingleton(runnerOptions);
builder.Services.AddSingleton<CSharpExecutor>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientDev", policy =>
    {
        // Permissive on purpose: there's no real auth here (see CurrentUserId below),
        // no cookies, nothing sensitive -- and the client may be reached as localhost,
        // 127.0.0.1, a LAN IP, or this machine's hostname depending on which device
        // it's opened from -- matching an exact origin list would break whichever of
        // those isn't enumerated. Every request still has to hit port 5173 specifically
        // (Vite's dev port), just not a specific hostname on it.
        policy.SetIsOriginAllowed(origin => Uri.TryCreate(origin, UriKind.Absolute, out var uri) && uri.Port == 5173)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Identity is never verified by this app -- it trusts whatever an upstream reverse
// proxy already decided: for example a Traefik ingress with a forward-auth middleware
// that handles the real Microsoft Entra ID login and injects an identity header on
// every request it forwards. This app just reads that header (name configurable via
// the UserHeader setting/env var, defaulting to Microsoft Entra Application Proxy's
// own "x-ms-client-principal-name") and treats its value as the current user's id.
// Locally or on the LAN -- anywhere that isn't behind that specific ingress -- nothing
// ever sets the header, so every request falls back to the literal string "guest": a
// single shared, not-really-anyone's-personal-progress bucket, since there's no way to
// tell two different guests apart without a real identity anyway.
var userHeaderName = builder.Configuration["UserHeader"] ?? "x-ms-client-principal-name";

string CurrentUserId(HttpContext ctx)
{
    var value = ctx.Request.Headers[userHeaderName].FirstOrDefault();
    return string.IsNullOrWhiteSpace(value) ? "guest" : value;
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    SchemaUpgrade.Apply(db);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("ClientDev");

// In the container image the built client is copied into wwwroot, so the UI and the API
// share one origin and one port. Locally wwwroot doesn't exist and Vite serves the UI.
app.UseDefaultFiles();
// The in-browser C# runtime: brotli and long-lived caching (Execution/CSharpWasmFiles.cs).
app.UseCSharpWasmFiles();
app.UseStaticFiles(CSharpWasmFiles.StaticFileOptions());

// So the sidebar can show who (if anyone real) it thinks you are -- "guest" is the
// honest, expected answer for any local/LAN run.
app.MapGet("/api/me", (HttpContext ctx) => Results.Ok(new { userId = CurrentUserId(ctx) }));

// ---- Lessons -------------------------------------------------------------

// Unified nav listing across both lesson kinds (practice concepts + reference tools),
// so the sidebar renders from one call instead of two.
app.MapGet("/api/lessons", async (HttpContext ctx, AppDbContext db) =>
{
    var userId = CurrentUserId(ctx);
    var completedIds = await db.ProgressEntries
        .Where(p => p.UserId == userId && p.CompletedAt != null)
        .Select(p => p.ConceptId)
        .ToListAsync();
    var completedSet = completedIds.ToHashSet();

    return ContentExport.NavItems(completedSet.Contains);
});

app.MapGet("/api/lessons/{id}", async (string id, HttpContext ctx, AppDbContext db) =>
{
    var concept = ConceptRegistry.Find(id);
    if (concept is null) return Results.NotFound();

    var userId = CurrentUserId(ctx);
    var rows = await db.ProgressEntries
        .Where(p => p.UserId == userId && p.ConceptId == id)
        .ToListAsync();

    return Results.Ok(concept.ToDetail(
        rows.Any(r => r.CompletedAt != null), rows.Sum(r => r.Attempts), ProgressService.Evidence(id, rows)));
});

// Spaced repetition: lessons the current user completed that are now due to be re-solved
// (see ProgressService for the ladder). Titles/tracks resolved here so the dashboard and
// sidebar don't need a second lookup per item.
app.MapGet("/api/review", async (HttpContext ctx, AppDbContext db, CancellationToken ct) =>
{
    var due = await ProgressService.GetDue(db, CurrentUserId(ctx), ct);
    return due
        .Select(d => (Due: d, Concept: ConceptRegistry.Find(d.ConceptId)))
        .Where(x => x.Concept is not null)
        .Select(x => new
        {
            conceptId = x.Due.ConceptId,
            title = x.Concept!.Title,
            section = x.Concept.Section,
            track = x.Concept.Track,
            dueSince = x.Due.DueSince,
            stage = x.Due.Stage,
            daysOverdue = x.Due.DaysOverdue,
        })
        .ToList();
});

app.MapGet("/api/tools/{id}", (string id) =>
{
    var tool = ToolRegistry.Find(id);
    return tool is null ? Results.NotFound() : Results.Ok(tool.ToDetail());
});

// ---- Execution -------------------------------------------------------------

app.MapPost("/api/execute/csharp", async (ExecuteRequest req, HttpContext ctx, AppDbContext db, CSharpExecutor executor, CancellationToken ct) =>
{
    var concept = ConceptRegistry.Find(req.LessonId);
    if (concept is null) return Results.NotFound();
    if (req.Code.Length > runnerOptions.MaxCodeLength)
        return Results.Ok(new ExecuteResponse(false, [], $"Code is too long (limit {runnerOptions.MaxCodeLength:N0} characters)."));

    var (rejected, allPassed, results, compileError) = await executor.RunTests(CurrentUserId(ctx), concept, req.Code, ct);
    if (rejected == RunRejection.AlreadyRunning)
        return Results.Json(new { error = "You already have a run in progress. Wait for it to finish, then try again." }, statusCode: 429);
    if (rejected == RunRejection.Busy)
        return Results.Json(new { error = "The code runner is busy right now. Try again in a moment." }, statusCode: 503);

    await ProgressService.RecordAttempt(db, CurrentUserId(ctx), req.LessonId, "csharp", req.Code, allPassed && compileError is null, req.Mode, ct);

    return Results.Ok(new ExecuteResponse(allPassed, results, compileError));
});

// Python (and any future client-executed language) runs entirely in the browser via
// Pyodide -- this just persists the attempt/result the client already computed.
app.MapPost("/api/progress/record", async (RecordProgressRequest req, HttpContext ctx, AppDbContext db, CancellationToken ct) =>
{
    if (ConceptRegistry.Find(req.LessonId) is null) return Results.NotFound();

    await ProgressService.RecordAttempt(db, CurrentUserId(ctx), req.LessonId, req.Language, req.Code, req.Passed, req.Mode, ct);
    return Results.Ok();
});

// The learner opened a lesson's reference solution: a pass in the following week counts
// as assisted, not independent (see ProgressService.RevealCooldown).
app.MapPost("/api/progress/reveal", async (RevealRequest req, HttpContext ctx, AppDbContext db, CancellationToken ct) =>
{
    if (ConceptRegistry.Find(req.LessonId) is null) return Results.NotFound();

    await ProgressService.RecordReveal(db, CurrentUserId(ctx), req.LessonId, req.Language, ct);
    return Results.Ok();
});

// Per-lesson evidence (attempted, reference seen, assisted / independent / timed passes) for
// the readiness view: lighter than /api/progress, which carries the submitted code.
app.MapGet("/api/progress/evidence", async (HttpContext ctx, AppDbContext db, CancellationToken ct) =>
{
    var userId = CurrentUserId(ctx);
    var rows = await db.ProgressEntries.Where(p => p.UserId == userId).ToListAsync(ct);
    return rows.GroupBy(r => r.ConceptId).Select(g => ProgressService.Evidence(g.Key, g)).ToList();
});

// ---- Progress -------------------------------------------------------------

app.MapGet("/api/progress", async (HttpContext ctx, AppDbContext db) =>
{
    var userId = CurrentUserId(ctx);
    return await db.ProgressEntries.Where(p => p.UserId == userId).OrderByDescending(p => p.UpdatedAt).ToListAsync();
});

// Resets one lesson (all languages) back to not-started -- for "let me redo this from
// scratch" rather than treating a completed concept as permanent. Scoped to the
// current user only -- resetting your own progress never touches anyone else's.
app.MapDelete("/api/progress/{conceptId}", async (string conceptId, HttpContext ctx, AppDbContext db, CancellationToken ct) =>
{
    var userId = CurrentUserId(ctx);
    var rows = await db.ProgressEntries.Where(p => p.UserId == userId && p.ConceptId == conceptId).ToListAsync(ct);
    db.ProgressEntries.RemoveRange(rows);
    await db.SaveChangesAsync(ct);
    return Results.Ok();
});

// Wipes all progress for the current user only. Used by the sidebar's "Reset all
// progress" control -- deliberately does not touch other users' rows.
app.MapDelete("/api/progress", async (HttpContext ctx, AppDbContext db, CancellationToken ct) =>
{
    var userId = CurrentUserId(ctx);
    var rows = await db.ProgressEntries.Where(p => p.UserId == userId).ToListAsync(ct);
    db.ProgressEntries.RemoveRange(rows);
    await db.SaveChangesAsync(ct);
    return Results.Ok();
});

// Client-side routes (if any are ever added) still land on the SPA; a no-op locally.
app.MapFallbackToFile("index.html");

app.Run();

// Mode: "guided", "bare" or "timed" (see ProgressService.NormalizeMode); missing means guided.
record ExecuteRequest(string LessonId, string Code, string? Mode = null);
record ExecuteResponse(bool AllPassed, List<TestResult> Results, string? CompileError);
record RecordProgressRequest(string LessonId, string Language, string Code, bool Passed, string? Mode = null);
record RevealRequest(string LessonId, string Language);
