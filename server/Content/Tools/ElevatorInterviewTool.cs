namespace DsaAcademy.Content.Tools;

public class ElevatorInterviewTool : ITool
{
    public string Id => "ood-interview-elevator";
    public string Section => "Software Design & OOP";
    public string Track => "object-oriented design";
    public int Order => 121;
    public string Title => "Design an Elevator System (OOD)";
    public string OneLiner => "N floors, M cars: which car answers a call, what order a car stops in, and how fire mode fits in later.";
    public string KeyTakeaway =>
        "Split the problem in two: a dispatch strategy decides which car takes a hall call, and each car orders " +
        "its own stops with a sweep (keep going while there are stops ahead, then reverse). Feed every button " +
        "press through one control loop so car state has a single writer.";

    public ToolKind ToolKind => ToolKind.DesignElevator;

    public string Explanation =>
        "Same format as the parking lot: write your answer for each of the seven stages first, then compare it " +
        "with the model answer and tick what you covered. See the parking lot walk-through for what an OOD " +
        "round is and how it's graded.\n\n" +
        "What's specific to the elevator. Most of the difficulty is behaviour over time rather than data, so " +
        "the interviewer wants to see the algorithm as code: how a car keeps its stops, how it moves one floor, " +
        "when it reverses or goes idle. Candidates often merge two different decisions, which car answers a " +
        "floor's call and in what order one car visits its stops, into one tangled method. Keeping them apart " +
        "is the main design point, and it's what makes a new dispatch policy (zoning, rush hour, destination " +
        "dispatch) a single new class.\n\n" +
        "Expect the State pattern question: is the car's direction a state machine? For direction alone an " +
        "enum is enough; for modes that change how the car reacts to everything (fire service, maintenance, " +
        "overload) separate mode classes start to pay. Have a view either way and say what would change your " +
        "mind. Concurrency comes up too: buttons are pressed from many places at once, and the simplest " +
        "correct answer is a queue in front of one control loop rather than locks inside every car.";
}
