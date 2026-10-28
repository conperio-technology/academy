namespace DsaAcademy.Content.Concepts;

public class StringEncodeDecode : IConcept
{
    public string Id => "string-encode-decode";
    public string Track => "patterns";
    public string Title => "Strings: Encode and Decode a List of Strings";
    public string OneLiner => "Pack a list of arbitrary strings into one string and unpack it again. Prefix each string with its length and a separator, so the content is never scanned for delimiters.";
    public string KeyTakeaway =>
        "Any delimiter character can also appear inside the strings, so don't search for one. Write each " +
        "string as length + '#' + string. To decode, read digits up to the next '#', which gives the length " +
        "L, then take exactly the next L characters, whatever they contain. That is length-prefixed framing, " +
        "the same idea network protocols use.";
    public VisualizerKind VisualizerKind => VisualizerKind.Array;

    public string Explanation =>
        "Write Encode, which turns a list of strings into a single string, and Decode, which turns that " +
        "string back into the original list. The strings may contain any characters, including commas, " +
        "digits, # and nothing at all (empty strings). The grader checks that Decode(Encode(list)) gives the " +
        "same list back.\n\n" +
        "Joining with a separator, such as a comma, breaks the moment a string contains a comma: [\"a,b\"] and " +
        "[\"a\", \"b\"] encode the same. Escaping the separator works but is fiddly. The robust approach is to " +
        "never look inside the strings at all: write each one's length in front of it.\n\n" +
        "Encode: for each s, append s.Length, then '#', then s. [\"lint\", \"code\"] becomes \"4#lint4#code\". " +
        "Decode: start at i = 0. Find the next '#' from i, at j. The digits s[i..j) are the length L. The " +
        "string is the L characters after the '#': s[j + 1 .. j + 1 + L). Append it and continue from i = j + " +
        "1 + L. A '#' inside a string is harmless, because by the time you reach it you are copying L " +
        "characters, not searching.\n\n" +
        "Why the '#' is safe to search for: you only ever search for it right after the previous string " +
        "ended, where the encoder wrote digits, so the first '#' you meet is always the one after the length. " +
        "Both directions are O(n) in the total number of characters. HTTP's Content-Length header and most " +
        "binary protocols frame messages exactly this way.\n\n" +
        "The visualization encodes [\"a#b\", \"\", \"#x\"] and decodes it again, piece by piece.";

    public List<string> RecognitionSignals => [
        "Serialize a list of arbitrary strings, or frame messages on a stream, where any delimiter could also be data.",
        "\"Design an encoding\" with no restrictions on the characters in the input.",
    ];

    public List<string> Gotchas => [
        "Using a delimiter alone breaks on strings that contain it.",
        "Empty strings must survive: \"0#\" encodes one, and [] must encode to something that decodes to [].",
        "Lengths can have several digits (12#...), so read up to the '#', not one character.",
    ];

    public List<string> ConfusableWith => [
        "Serialize and Deserialize a Binary Tree also round-trips a structure through a string; there the tokens are numbers, so a comma separator is safe.",
        "Run-length encoding compresses repeated characters; this is about unambiguous framing, not size.",
    ];

    public Dictionary<string, string> StarterCode => new()
    {
        ["csharp"] =
            "public class Codec\n" +
            "{\n" +
            "    public static string Encode(string[] strs)\n" +
            "    {\n" +
            "        // TODO: for each s, append s.Length, then '#', then s (a StringBuilder helps).\n" +
            "        return \"\";\n" +
            "    }\n" +
            "\n" +
            "    public static List<string> Decode(string s)\n" +
            "    {\n" +
            "        var result = new List<string>();\n" +
            "        // TODO: i = 0. While i < s.Length: j = s.IndexOf('#', i); length = int.Parse(s[i..j]);\n" +
            "        // add s.Substring(j + 1, length); i = j + 1 + length.\n" +
            "        return result;\n" +
            "    }\n" +
            "}\n",
        ["python"] =
            "def encode(strs):\n" +
            "    # TODO: for each s, write len(s), then \"#\", then s.\n" +
            "    return \"\"\n" +
            "\n" +
            "\n" +
            "def decode(s):\n" +
            "    result = []\n" +
            "    # TODO: i = 0. While i < len(s): j = s.index(\"#\", i); length = int(s[i:j]);\n" +
            "    # append s[j + 1:j + 1 + length]; i = j + 1 + length.\n" +
            "    return result\n",
    };

    public Dictionary<string, string> FunctionNames => new()
    {
        ["csharp"] = "Codec.Encode",
        ["python"] = "encode",
    };

    public List<TestCase> TestCases =>
    [
        new TestCase("[\"lint\", \"code\", \"love\", \"you\"]", "[\"lint\",\"code\",\"love\",\"you\"]"),
        new TestCase("[\"we\", \"say\", \":\", \"yes\"]", "[\"we\",\"say\",\":\",\"yes\"]"),
        new TestCase("[]", "[]"),
        new TestCase("[\"\"]", "[\"\"]"),
        new TestCase("[\"\", \"\"]", "[\"\",\"\"]"),
        new TestCase("[\"a#b\", \"3#x\", \"#\"]", "[\"a#b\",\"3#x\",\"#\"]"),
        new TestCase("[\"hello, world\", \"12#34\"]", "[\"hello, world\",\"12#34\"]"),
        new TestCase("[\"4#abcd\"]", "[\"4#abcd\"]"),
    ];

    public string CSharpCallTemplate => "Codec.Decode(Codec.Encode({input}))";
    public string PythonCallTemplate => "decode(encode({input}))";

    public List<VisualizationStep> BuildVisualizationSteps()
    {
        string[] original = ["a#b", "", "#x"];
        var encoded = string.Concat(original.Select(s => $"{s.Length}#{s}"));
        var steps = new List<VisualizationStep>
        {
            new(new() { ["array"] = original }, [], $"Encode [\"a#b\", \"\", \"#x\"] as length # string: \"{encoded}\". The # inside the strings will not confuse the decoder."),
        };
        var result = new List<string>();
        var i = 0;
        while (i < encoded.Length)
        {
            var j = encoded.IndexOf('#', i);
            var length = int.Parse(encoded[i..j]);
            result.Add(encoded.Substring(j + 1, length));
            steps.Add(new(new() { ["array"] = result.Select(r => $"\"{r}\"").ToArray() }, [result.Count - 1],
                $"At {i}: digits up to the # at {j} say length {length}. Copy the next {length} characters without looking at them: \"{result[^1]}\". Continue at {j + 1 + length}."));
            i = j + 1 + length;
        }
        steps.Add(new(new() { ["array"] = result.Select(r => $"\"{r}\"").ToArray() }, [], "Decoded the same three strings, including the empty one."));
        return steps;
    }
}
