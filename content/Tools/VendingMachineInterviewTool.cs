namespace DsaAcademy.Content.Tools;

public class VendingMachineInterviewTool : ITool
{
    public string Id => "ood-interview-vending-machine";
    public string Section => "Software Design & OOP";
    public string Track => "object-oriented design";
    public int Order => 122;
    public string Title => "Design a Vending Machine (OOD)";
    public string OneLiner => "The State pattern question: coins, selection, change, cancel and jams, with each state's rules in one class.";
    public string KeyTakeaway =>
        "A vending machine is a state machine, and the State pattern keeps each state's rules in one class " +
        "instead of a switch in every method. Hold the customer's coins in escrow so cancel always works, and " +
        "plan change before dispensing but only commit it after the product drops.";

    public ToolKind ToolKind => ToolKind.DesignVendingMachine;

    public string Explanation =>
        "Same format as the other OOD walk-throughs: write your answer for each stage first, then compare and " +
        "tick what you covered. The parking lot walk-through explains what an OOD round grades.\n\n" +
        "What's specific to the vending machine. Interviewers pick it to see whether you recognise a state " +
        "machine and can say why the State pattern helps: the same input (a coin, a button) means something " +
        "different when the machine is idle, has credit, is dispensing or is out of service. Without the " +
        "pattern each public method grows a switch over the state, and adding a state means editing all of " +
        "them. With it, each state is a small class and a new state is a new class. Be ready to say what the " +
        "pattern costs too: more classes, and states that need access to the machine's internals.\n\n" +
        "The other depth is money. What happens when the machine can't make change? What does cancel give " +
        "back? What if the product jams after payment? The model answer keeps inserted coins in escrow, which " +
        "makes refunds trivial, and shows why greedy change making can fail when the machine is short of some " +
        "coins. Those details separate a pattern recital from a design that would work.";
}
