namespace DsaAcademy.Content.Tools;

public class JobSchedulerInterviewTool : ITool
{
    public string Id => "sd-interview-job-scheduler";
    public string Section => "System Design";
    public string Track => "interview walk-throughs";
    public int Order => 29;
    public string Title => "Design a Distributed Job Scheduler";
    public string OneLiner => "Run millions of one-off and recurring jobs on time across a fleet of workers, as a 45-minute design round: leases, retries, at-least-once and no double runs that matter.";
    public string KeyTakeaway =>
        "A job scheduler is a durable store of due times, a way to find what is due without scanning everything, and a work " +
        "queue whose workers hold leases. Delivery is at least once, so jobs must be idempotent or carry a fencing token; " +
        "recurring jobs are stored as their next run time, not expanded forever; and the interesting failures are a worker that " +
        "stalls mid-job and a scheduler that fires the same job twice.";

    public ToolKind ToolKind => ToolKind.DesignJobScheduler;

    public string Explanation =>
        "Same format as the other walk-throughs: write your answer for each stage first, then compare it with the model answer " +
        "and tick what you covered.\n\n" +
        "This problem looks like cron with more machines, and that is the trap. The hard parts are not parsing schedules but " +
        "correctness under failure: a worker that takes a job and then crashes, freezes in a long garbage collection pause or " +
        "loses its network; a scheduler node that fires a batch of jobs and dies before recording it; and a midnight peak when " +
        "half the world's daily jobs are due in the same second. A strong answer separates the parts that decide when a job is " +
        "due from the parts that run it, uses leases with heartbeats rather than locks held forever, and is honest that " +
        "delivery is at least once.\n\n" +
        "Interviewers usually push on four things: how you find due jobs without scanning a huge table (time-bucketed indexes " +
        "or partitions), what happens when a worker dies or stalls (lease expiry, retries with backoff, fencing tokens), how " +
        "you stop one tenant's million jobs from starving everyone else (per-tenant queues and quotas), and how recurring " +
        "schedules and time zones work. It builds on the Message Queues, Distributed Async Systems and Timeouts, Retries and " +
        "Circuit Breakers lessons, and it is closely related to designing a notification system or a web crawler's frontier.";
}
