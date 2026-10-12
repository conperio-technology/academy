namespace DsaAcademy.Content.Tools;

public class AiRisksLimitsTool : ITool
{
    public string Id => "ai-risks-limits";
    public string Section => "AI & Machine Learning";
    public string Track => "using AI";
    public int Order => 70;
    public string Title => "Risks and Limits: Hallucination, Prompt Injection, Privacy and Cost";
    public string OneLiner => "Where AI tools go wrong and how to use them safely at work, plus where machine learning does and does not belong on the plant floor.";
    public string KeyTakeaway =>
        "Treat model output as a draft from a fast, fluent colleague who is sometimes confidently wrong: verify it. " +
        "Treat any text the model reads (web pages, emails, documents, tool results) as untrusted input that may " +
        "contain instructions. Never paste secrets, credentials or customer-confidential data into a tool your " +
        "company has not approved for it. In industrial systems ML can advise and monitor, but safety functions stay " +
        "deterministic and certified.";

    public ToolKind ToolKind => ToolKind.AiRisksLimits;

    public string Explanation =>
        "Hallucination. Models produce text that is plausible, not text that is checked. Typical failures: an API " +
        "method or package that does not exist, a configuration flag from a different version, a citation to a paper " +
        "that was never written, arithmetic slips, and a confident summary of a document that subtly reverses one " +
        "detail. Defences: ask for sources and open them, run the code and its tests, give the model the real " +
        "documentation instead of relying on its memory, and be most careful exactly where you are least able to " +
        "check.\n\n" +
        "Prompt injection. A model cannot reliably tell the instructions you gave it from instructions that appear " +
        "inside the content it is processing. A web page, a ticket, a PDF or a code comment can contain \"ignore your " +
        "previous instructions and...\" and the model may follow it. That matters most when the model also has tools " +
        "or access to private data: an agent that reads an attacker's email and can send email can be talked into " +
        "leaking your inbox. There is no complete fix today. Mitigations are layered: give agents the fewest " +
        "permissions they need, require a human to confirm consequential actions, keep untrusted content clearly " +
        "separated and labelled, restrict where data can be sent, and log what agents do.\n\n" +
        "Data privacy. What you paste into a tool leaves your machine and is handled under that service's terms: it " +
        "may be stored, reviewed or, on some consumer plans, used for training. Use the tools and accounts your " +
        "company has approved, and keep passwords, API keys, private keys, personal data, and customer-confidential " +
        "material (including customer PLC programs, network layouts and site details) out of anything that is not " +
        "approved for it. When in doubt, strip it out or ask first. A leaked key must be rotated; deleting the chat " +
        "is not enough.\n\n" +
        "Bias. Models learn from human-written data and reproduce its skews, which matters when outputs feed " +
        "decisions about people (hiring, performance, support priority). Do not let a model make those decisions " +
        "unreviewed.\n\n" +
        "Cost and latency. You pay per token, input and output, and output is generated one token at a time, so " +
        "long answers are slow. Larger models are generally more capable and more expensive and slower; a smaller " +
        "model is often good enough for classification or extraction. Long prompts resent on every call (big system " +
        "prompts, whole files, long chat histories) are the usual hidden cost; prompt caching, trimming context and " +
        "routing easy requests to smaller models help. Use the calculator below with your provider's current prices.\n\n" +
        "AI in industrial settings. Machine learning earns its place on the plant floor in advisory and monitoring " +
        "roles: anomaly detection on sensor streams (a pump drawing slightly more current than its normal pattern), " +
        "predictive maintenance (estimating when a bearing or motor is likely to fail so it can be serviced at a " +
        "planned stop), visual inspection, and helping engineers search manuals or draft code. Safety-critical " +
        "control is different. Emergency stops, interlocks and safety PLCs must behave identically every scan, be " +
        "analysable, and be certified against functional safety standards such as IEC 61508 (and, for machinery, IEC 62061 or ISO 13849), which " +
        "assume deterministic, verifiable logic. A statistical model that is right 99.9% of the time, cannot " +
        "explain itself and may behave differently on an input it has never seen does not meet that bar. The " +
        "pattern is: ML can recommend, alert and optimise set points within limits; hard-wired and certified safety " +
        "logic always has the final say. The Safety & Redundancy lesson in the Industrial section covers that " +
        "design approach.";
}
