using System.Text.RegularExpressions;
using Microsoft.AspNetCore.StaticFiles;

namespace DsaAcademy.Execution;

// Serving the in-browser C# runtime (wasm-csharp/build.sh copies it into
// client/public/csharp-wasm/_framework, so it ends up in the web root next to the client):
//   - the precompressed .br variant when the browser accepts brotli (about 5 MB instead of
//     18 MB), with the original file's content type;
//   - fingerprinted files (name.<hash>.wasm/.js) cached as immutable for a year, and
//     dotnet.js, which isn't fingerprinted and lists the others' hashes, revalidated on
//     every load (no-cache, answered with a 304 while it hasn't changed).
// Everything else in the web root is served exactly as before.
public static partial class CSharpWasmFiles
{
    private const string Prefix = "/csharp-wasm/_framework/";

    [GeneratedRegex(@"\.[a-z0-9]{8,16}\.(wasm|js|dat|json)$")]
    private static partial Regex Fingerprinted();

    public static void UseCSharpWasmFiles(this WebApplication app)
    {
        var root = app.Environment.WebRootFileProvider;
        app.Use(async (context, next) =>
        {
            var path = context.Request.Path.Value;
            if (path is not null && path.StartsWith(Prefix, StringComparison.Ordinal) && !path.EndsWith(".br", StringComparison.Ordinal)
                && (HttpMethods.IsGet(context.Request.Method) || HttpMethods.IsHead(context.Request.Method))
                && AcceptsBrotli(context.Request) && root.GetFileInfo(path + ".br").Exists)
            {
                context.Request.Path = path + ".br";
                context.Response.Headers.ContentEncoding = "br";
                context.Response.Headers.Vary = "Accept-Encoding";
            }
            await next();
        });
    }

    public static StaticFileOptions StaticFileOptions() => new()
    {
        ContentTypeProvider = new BrotliAwareContentTypes(),
        OnPrepareResponse = context =>
        {
            var path = context.Context.Request.Path.Value;
            if (path is null || !path.StartsWith(Prefix, StringComparison.Ordinal)) return;
            var name = path.EndsWith(".br", StringComparison.Ordinal) ? path[..^3] : path;
            context.Context.Response.Headers.CacheControl = Fingerprinted().IsMatch(name)
                ? "public, max-age=31536000, immutable"
                : "no-cache";
        },
    };

    private static bool AcceptsBrotli(HttpRequest request) =>
        request.Headers.AcceptEncoding.Any(v => v is not null && v.Contains("br", StringComparison.OrdinalIgnoreCase));

    // "x.wasm.br" under the runtime folder is served as "x.wasm" (its Content-Encoding says br).
    private sealed class BrotliAwareContentTypes : IContentTypeProvider
    {
        private readonly FileExtensionContentTypeProvider _inner = new();

        public bool TryGetContentType(string subpath, out string contentType)
        {
            if (subpath.StartsWith(Prefix, StringComparison.Ordinal) && subpath.EndsWith(".br", StringComparison.Ordinal))
                subpath = subpath[..^3];
            return _inner.TryGetContentType(subpath, out contentType!);
        }
    }
}
