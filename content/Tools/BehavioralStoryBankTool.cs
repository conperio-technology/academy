namespace DsaAcademy.Content.Tools;

public class BehavioralStoryBankTool : ITool
{
    public string Id => "behavioral-story-bank";
    public string Section => "Behavioral Interviews";
    public string Track => "behavioral";
    public int Order => 2;
    public string Title => "Your Story Bank";
    public string OneLiner => "Write eight to ten of your own stories in STAR form and check they cover every competency interviewers probe.";
    public string KeyTakeaway =>
        "You can't invent a good story under pressure, but you can prepare eight to ten in advance that between them " +
        "cover every common question. Most questions are variations on about a dozen themes, so the work is choosing " +
        "and rehearsing the stories, not memorising answers to hundreds of questions.";

    public ToolKind ToolKind => ToolKind.BehavioralStoryBank;

    public string Explanation =>
        "Strong candidates walk in with a prepared set of stories and adapt them to whatever is asked. A single " +
        "good story, such as a difficult project you led, can answer \"your biggest impact\", \"a conflict with a " +
        "colleague\" and \"a decision with incomplete data\", depending on which part you emphasise.\n\n" +
        "Write each story in STAR form below and tag the competencies it shows. The coverage grid tells you which " +
        "themes you have no story for yet. Aim for at least one per theme and two for the ones that come up in " +
        "almost every loop: conflict, failure, and impact. In a full day of interviews you may be asked about " +
        "conflict three times by three different people, and you should be able to give each a different story.\n\n" +
        "Good source material: projects from your last two or three years (older ones sound stale), incidents, " +
        "launches that slipped, disagreements about design or priorities, people you helped, and things you " +
        "changed that nobody asked you to. Write the Action part in detail even though you'll only say a fraction " +
        "of it; the detail is what you'll need for follow-up questions.\n\n" +
        "Your stories are saved in this browser only, not on the server. Use \"Copy all as text\" to keep a copy " +
        "somewhere safer. The Behavioral Mock Round uses these stories, so you can practise choosing the right one " +
        "for each question.";
}
