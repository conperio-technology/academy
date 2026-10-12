namespace DsaAcademy.Content.Tools;

public class GlossaryFlashCardsTool : ITool
{
    public string Id => "glossary-flash-cards";
    public string Section => "Glossary";
    public string Track => "industry terms";
    public int Order => 2;
    public string Title => "Flash Cards";
    public string OneLiner => "Flip through terms by topic, mark each one Got it or Not yet, and see the ones you miss more often.";
    public string KeyTakeaway =>
        "Trying to recall the answer before you flip the card is what makes it stick. Re-reading feels productive " +
        "but fades within days; spaced recall, where cards you know come back less often, lasts.";

    public ToolKind ToolKind => ToolKind.GlossaryFlashCards;

    public string Explanation =>
        "Pick one or more topics. Each card shows a term; say the definition out loud (or in your head), then flip " +
        "it and be honest about whether you had it. Reverse mode shows the definition and asks for the term, which " +
        "is harder and closer to what happens in a real conversation.\n\n" +
        "Cards use Leitner boxes, a simple form of spaced repetition. A new card starts in box 1. Got it moves the " +
        "card up a box, and Not yet sends it back to box 1. Box 1 is due every day, box 2 after 2 days, box 3 after " +
        "4, box 4 after 8 and box 5 after 16, so you spend your time on the terms you don't know yet.\n\n" +
        "Your boxes are saved in this browser only, not on the server.";
}
