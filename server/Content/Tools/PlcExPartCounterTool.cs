namespace DsaAcademy.Content.Tools;

// PLC programming track (graded exercise). The interactive part is
// client/src/plc/exercises.ts, keyed by this Id.
public class PlcExPartCounterTool : ITool
{
    public string Id => "plc-ex-part-counter";
    public string Section => "Industrial & Embedded Systems";
    public string Track => "plc programming";
    public int Order => 255;
    public string Title => "Exercise: Part Counter with Reset";
    public string OneLiner => "Count parts passing a photo-eye in batches of ten, with a reset button, so that a part sitting in front of the sensor still counts once.";
    public string KeyTakeaway =>
        "A CTU counts edges, resets on R (which wins over counting) and flags the batch with Q when CV reaches PV.";

    public ToolKind ToolKind => ToolKind.PlcStExercise;

    public string Explanation =>
        "A photo-eye on a conveyor sees parts go past, and the line packs them in tens. Count the parts, flag " +
        "a full batch, and let the operator reset the count. Parts can stop in front of the eye, so count " +
        "each part's arrival, not the time it spends there.";
}
