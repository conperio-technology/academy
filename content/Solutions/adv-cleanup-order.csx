public class Solution
{
    public static void RunSteps(string[] names, string failOn, List<string> log)
    {
        var opened = new List<Resource>();
        try
        {
            foreach (var name in names) opened.Add(new Resource(name, failOn, log));
            log.Add("work");
            if (failOn == "work") throw new InvalidOperationException("work failed");
        }
        finally
        {
            for (int i = opened.Count - 1; i >= 0; i--) opened[i].Dispose();
        }
    }
}
