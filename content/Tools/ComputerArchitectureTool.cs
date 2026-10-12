namespace DsaAcademy.Content.Tools;

public class ComputerArchitectureTool : ITool
{
    public string Id => "computer-architecture";
    public string Section => "Computer Fundamentals";
    public string Track => "hardware";
    public string Title => "Computer Architecture: CPU, GPU, RAM, Storage & the OS";
    public string OneLiner => "The physical pieces of a computer, what each one actually does, and the layer (the OS) that connects them to the code you write.";
    public string KeyTakeaway =>
        "The CPU computes general-purpose logic, the GPU computes the same operation over massive " +
        "parallel data (graphics, AI), RAM holds what's actively being worked on (fast, but empty the " +
        "instant power is lost), and storage holds everything long-term (slower, survives power-off). " +
        "The further a piece of memory is from the processor, the bigger and cheaper it gets, and the " +
        "slower it gets -- that trade-off, not any single component, is the actual shape of hardware.";

    public ToolKind ToolKind => ToolKind.ComputerArchitecture;

    public string Explanation =>
        "A computer is a small number of physical pieces, each doing one job. The CPU (processor) " +
        "executes instructions -- it's the piece that actually \"does\" general-purpose computation; " +
        "everything else exists to feed it data or store its results. The GPU is a second, more " +
        "specialized processor sitting next to it: a CPU has a handful of powerful cores built for " +
        "doing many DIFFERENT things one after another, while a GPU has thousands of small, simple " +
        "cores built for doing the exact SAME operation across huge amounts of data at once -- " +
        "originally for computing the color of millions of screen pixels in parallel, and for the " +
        "identical reason now also the workhorse behind training AI models, which is the same shape " +
        "of problem (the same math, repeated over huge arrays of numbers). RAM (memory) holds " +
        "whatever the CPU (or GPU) is actively working with -- it's fast but volatile (wiped when " +
        "power is lost), which is why closing an app without saving loses your work. Storage (an SSD, solid-state drive, or an HDD, hard disk drive) holds everything long-term -- " +
        "much slower than RAM, but it survives being powered off, which is why files are still there " +
        "when you turn the computer back on. The motherboard is the wiring (buses) that lets all of " +
        "these talk to each other. Sitting on top of all of it is the operating system (Windows, " +
        "macOS, Linux) -- software whose job is to manage the hardware so that application code (the " +
        "C# or Python you write in this app) doesn't have to know which exact CPU, how much RAM, or " +
        "what kind of disk it's running on. When your code calls something like \"read this file\" or " +
        "\"allocate this memory,\" it's really asking the OS to translate that request into whatever " +
        "the actual hardware underneath needs -- that translation layer is the hardware/software " +
        "boundary. Click through the pieces below, and look at the memory hierarchy table: it's the same " +
        "trade-off (closer to the CPU = faster but smaller and more expensive) repeated at every level, from registers (a handful of tiny storage slots inside the CPU itself, holding the values it is working on this instant) down to disk.";
}
