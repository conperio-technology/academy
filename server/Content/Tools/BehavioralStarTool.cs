namespace DsaAcademy.Content.Tools;

public class BehavioralStarTool : ITool
{
    public string Id => "behavioral-star";
    public string Section => "Behavioral Interviews";
    public string Track => "behavioral";
    public int Order => 1;
    public string Title => "STAR Answers: What Interviewers Listen For";
    public string OneLiner => "The same questions answered badly and well, with each part of the strong answer taken apart.";
    public string KeyTakeaway =>
        "A behavioral answer is one specific story told in about two minutes: a short Situation and Task, a long " +
        "Action section in the first person, a Result with a number in it, and one sentence on what you learned. " +
        "Interviewers are scoring the Actions; everything else is there to make them make sense.";

    public ToolKind ToolKind => ToolKind.BehavioralStar;

    public string Explanation =>
        "Behavioral questions (\"tell me about a time you...\") assume that how you behaved in the past is the best " +
        "predictor of how you'll behave on their team. The interviewer has a list of signals to collect, such as " +
        "ownership, handling conflict, or dealing with ambiguity, and each question is a way of getting you to show one. " +
        "They write down what you did, not what you say you're like, which is why claims such as \"I'm a great " +
        "communicator\" score nothing on their own.\n\n" +
        "STAR is the standard shape for an answer: Situation (where and when, one or two sentences), Task (your role " +
        "and what you had to achieve), Action (what you did and why, which should be at least half the answer), and " +
        "Result (what happened, measured if possible). Many interviewers also listen for a fifth part: what you " +
        "learned, or what you'd do differently. That's what the L stands for in this lesson's examples.\n\n" +
        "The mistakes are remarkably consistent. Answering with a generalisation (\"I usually...\") instead of one " +
        "real event. Saying \"we\" all the way through, so the interviewer can't tell what you did. Spending a minute " +
        "on background and thirty seconds on actions. Ending with \"and it went well\" instead of a result. Choosing a " +
        "fake weakness or a failure that wasn't really yours. And running past three minutes, which leaves no time for " +
        "the follow-up questions where most of the scoring happens.\n\n" +
        "Below are three common questions, each with a weak answer and a strong one. Try to spot what's wrong with the " +
        "weak answer before revealing the list, then read the strong answer aloud and time it. Then write your own " +
        "stories in Your Story Bank.";
}
