public class Solution
{
    public static Result<Endpoint> ParseEndpoint(string text)
    {
        int colon = text.LastIndexOf(':');
        if (colon < 0) return Result<Endpoint>.Fail("missing port");
        string host = text[..colon];
        string portText = text[(colon + 1)..];
        if (host.Length == 0) return Result<Endpoint>.Fail("empty host");
        if (portText.Length == 0 || !portText.All(char.IsAsciiDigit)) return Result<Endpoint>.Fail("port is not a number");
        string digits = portText.TrimStart('0');                   // "08080" is 8080; no int overflow below
        int port = digits.Length is > 0 and <= 5 ? int.Parse(digits) : digits.Length == 0 ? 0 : int.MaxValue;
        if (port is < 1 or > 65535) return Result<Endpoint>.Fail("port out of range");
        return Result<Endpoint>.Ok(new Endpoint(host, port));
    }

    public static Result<List<Endpoint>> ParseAll(string[] lines)
    {
        var endpoints = new List<Endpoint>();
        var errors = new List<string>();
        for (int i = 0; i < lines.Length; i++)
        {
            var result = ParseEndpoint(lines[i]);
            if (result.IsOk) endpoints.Add(result.Value!);
            else errors.Add($"line {i + 1}: {result.Error}");
        }
        return errors.Count == 0
            ? Result<List<Endpoint>>.Ok(endpoints)
            : Result<List<Endpoint>>.Fail(string.Join("; ", errors));
    }
}
