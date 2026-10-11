namespace DsaAcademy.Content.Tools;

public class PaymentSystemInterviewTool : ITool
{
    public string Id => "sd-interview-payment-system";
    public string Section => "System Design";
    public string Track => "interview walk-throughs";
    public int Order => 30;
    public string Title => "Design a Payment System";
    public string OneLiner => "Take payments for an online marketplace through an external payment processor, as a 45-minute design round: idempotency, exactly-once effects, a ledger and reconciliation.";
    public string KeyTakeaway =>
        "Payments are a correctness problem first and a scale problem second. Every request carries an idempotency key so a " +
        "retry can never charge twice, every state change is a step in an explicit state machine, money movements are recorded " +
        "in an append-only double-entry ledger, the external processor is treated as unreliable and slow, and a daily " +
        "reconciliation against the processor's settlement files catches anything the online path missed.";

    public ToolKind ToolKind => ToolKind.DesignPaymentSystem;

    public string Explanation =>
        "Same format as the other walk-throughs: write your answer for each stage first, then compare it with the model answer " +
        "and tick what you covered.\n\n" +
        "Most design rounds reward availability and speed; this one rewards care. The traffic is modest (hundreds of payments " +
        "a second even for a large marketplace), but a duplicate charge, a lost refund or money that appears in a seller's " +
        "balance without having been collected are all serious bugs. And the core of the system, moving money between cards " +
        "and banks, happens in someone else's system (a payment service provider such as Stripe, Adyen or Braintree) that " +
        "times out, answers late through webhooks and occasionally disagrees with you.\n\n" +
        "The ideas interviewers listen for: idempotency keys on every call into the system and every call out of it; a payment " +
        "state machine where an unknown outcome is a real state, not an error; why you never retry a timed-out charge blindly; a " +
        "double-entry ledger (every movement written as matching debit and credit entries that sum to zero) as the source of " +
        "truth for balances; the transactional outbox for events; reconciliation; and keeping card numbers out of your systems " +
        "entirely so most of them stay out of PCI DSS scope. \"Exactly once\" here means exactly-once effects: the network may " +
        "deliver a request many times, and the design makes the extra ones harmless.";
}
