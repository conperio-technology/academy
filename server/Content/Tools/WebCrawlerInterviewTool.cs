namespace DsaAcademy.Content.Tools;

public class WebCrawlerInterviewTool : ITool
{
    public string Id => "sd-interview-web-crawler";
    public string Section => "System Design";
    public string Track => "interview walk-throughs";
    public int Order => 25;
    public string Title => "Design a Web Crawler";
    public string OneLiner => "A search engine crawler as a 45-minute design round: the URL frontier, politeness, deduplication and recrawl scheduling.";
    public string KeyTakeaway =>
        "A crawler's raw throughput is modest; what makes it hard is fetching politely from millions of hosts while " +
        "always working on the most valuable URLs. Split the frontier into priority queues and per-host queues, " +
        "partition hosts across machines so politeness needs no coordination, and deduplicate both URLs and content " +
        "so the fetch budget isn't wasted.";

    public ToolKind ToolKind => ToolKind.DesignWebCrawler;

    public string Explanation =>
        "Same format as the other walk-throughs: write your answer for each stage first, then compare it with the " +
        "model answer and tick what you covered. The 45-minute flow is the same; what changes is where the " +
        "difficulty sits.\n\n" +
        "A crawler has no users waiting on it and sets its own pace, so the usual worries about read latency and " +
        "traffic peaks mostly disappear. A billion pages a month is only about 400 fetches a second, which a few " +
        "dozen machines handle. The estimation stage should show that the pressure is elsewhere: around 20,000 " +
        "extracted links a second that each need a \"seen before?\" check, a frontier holding ten times more URLs " +
        "than the monthly budget, and a politeness rule (roughly one request per host every few seconds) that " +
        "forces the crawler to spread its work across tens of thousands of hosts at once.\n\n" +
        "The deep dive almost always starts with the URL frontier: how to combine priority with per-host rate " +
        "limits, which is what Mercator's front and back queues do. From there interviewers move to robots.txt and " +
        "DNS, URL normalisation and Bloom filters, near-duplicate content with SimHash, deciding when to recrawl a " +
        "page, and crawler traps. Pick the ones they react to and explain the mechanism, not just the name. Expect " +
        "follow-ups such as \"a site starts returning 503s halfway through: what does your crawler do?\" or \"one " +
        "site generates a new URL for every calendar day forever: how do you notice?\"";
}
