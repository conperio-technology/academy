namespace DsaAcademy.Content.Tools;

public class CardGameInterviewTool : ITool
{
    public string Id => "ood-interview-card-game";
    public string Section => "Software Design & OOP";
    public string Track => "object-oriented design";
    public int Order => 124;
    public string Title => "Design a Deck of Cards and Blackjack (OOD)";
    public string OneLiner => "A reusable deck, then Blackjack on top of it: scoring aces, the dealer's rule, a round of play, and splits as the follow-up.";
    public string KeyTakeaway =>
        "Keep the generic parts (card, deck, hand) free of any one game's rules and put Blackjack scoring in " +
        "its own class. Count aces as 1 and add 10 once if it fits, shuffle with Fisher-Yates and an injected " +
        "Random, and model a player's hands as a list so splitting doesn't need a redesign.";

    public ToolKind ToolKind => ToolKind.DesignCardGame;

    public string Explanation =>
        "Same format as the other OOD walk-throughs: write your answer for each stage first, then compare and " +
        "tick what you covered. The parking lot walk-through explains what an OOD round grades.\n\n" +
        "What's specific to the card game. It's a two-part question on purpose: first a generic deck, then a " +
        "game that uses it. The interviewer is checking whether the generic part stays generic. A Card with a " +
        "BlackjackValue property, or a Deck that knows about dealers, fails that test, because the same deck " +
        "should work for poker. The small classes make it a good place to show judgement about inheritance: " +
        "Player and Dealer extending a shared Participant is fine (one level, a real difference in behaviour), " +
        "while HumanPlayer and BotPlayer subclasses are better as a decision policy the player holds.\n\n" +
        "The code is short, so it's expected to be right. Ace scoring is where most candidates slip (only one " +
        "ace can ever count as 11), shuffling is where people reach for a biased shortcut, and settling a hand " +
        "has an order that matters (a player who busts loses even if the dealer busts too). The classic " +
        "follow-up is splitting pairs, which a design with one hand per player can't take without changes.";
}
