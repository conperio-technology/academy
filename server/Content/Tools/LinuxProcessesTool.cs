namespace DsaAcademy.Content.Tools;

public class LinuxProcessesTool : ITool
{
    public string Id => "linux-processes";
    public string Section => "Linux & the Command Line";
    public string Track => "terminal";
    public int Order => 4;
    public string Title => "Processes and Signals";
    public string OneLiner => "See what's running, run things in the background, and stop what's stuck.";
    public string KeyTakeaway =>
        "Every running program is a process with a PID. ps and top show them; & runs a command in the " +
        "background; kill PID asks a process to stop (SIGTERM), and kill -9 forces it (SIGKILL) when it won't. " +
        "nice and renice set how politely a process shares the CPU.";

    public ToolKind ToolKind => ToolKind.LinuxProcesses;

    public string Explanation =>
        "A process is a running program: your shell (the program that reads and runs the commands you type), the sleep you start, the web server on a real box. " +
        "Each has a process ID (PID), an owner, and a parent that started it. ps lists processes (ps aux on " +
        "most full Linux systems; plain ps here), and top shows a live view sorted by CPU use -- press q to " +
        "leave it. Combine ps with grep to find one by name.\n\n" +
        "Normally the shell waits for a command to finish. Put & on the end and it runs in the background " +
        "instead, giving you your prompt back; jobs lists your background jobs, fg brings one back to the " +
        "front, and Ctrl+C stops whatever is in the front. $! holds the PID of the last background job.\n\n" +
        "kill doesn't necessarily kill: it sends a signal. The default, SIGTERM, asks the process to shut " +
        "down cleanly -- finish writing files, close connections. Well-behaved programs (and container " +
        "platforms like Kubernetes) rely on that. kill -9 sends SIGKILL, which the process can't catch or " +
        "ignore; use it when SIGTERM didn't work, knowing the program gets no chance to clean up. killall " +
        "name signals every process with that name.\n\n" +
        "Priority is set by a nice value from -20 (greediest) to 19 (most polite); normal is 0. nice -n 10 " +
        "command starts something politely, and renice 10 -p PID sets a running one's value (BusyBox's " +
        "renice -n 10 adds 10 to the current value instead). Ordinary users " +
        "can make their processes nicer but only root can make them greedier.";
}
