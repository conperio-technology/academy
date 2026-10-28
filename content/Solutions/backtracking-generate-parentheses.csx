public class Solution
{
    public static List<string> GenerateParenthesis(int n)
    {
        var result = new List<string>();

        void Build(string current, int open, int close)
        {
            if (current.Length == 2 * n)
            {
                result.Add(current);
                return;
            }
            if (open < n) Build(current + "(", open + 1, close);
            if (close < open) Build(current + ")", open, close + 1); // only close an open one
        }

        Build("", 0, 0);
        return result;
    }
}
