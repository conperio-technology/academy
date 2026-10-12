namespace DsaAcademy.Content.Tools;

public class RunningAProgramTool : ITool
{
    public string Id => "running-a-program";
    public string Section => "Computer Fundamentals";
    public string Track => "operating systems and runtimes";
    public string Title => "What Happens When You Run a Program";
    public string OneLiner => "From typing ./hello to the shell prompt coming back: fork, exec, the loader, main, exit and the process lifecycle.";
    public string KeyTakeaway =>
        "On Unix, a shell starts a program in two steps. fork() clones the shell into a child process (cheaply, with " +
        "copy-on-write pages), and the child calls execve() to replace its memory with the new program while keeping its " +
        "PID and open files. The kernel's loader maps the executable, the dynamic linker loads shared libraries, and only " +
        "then does main run. When the program exits it becomes a zombie until its parent collects the exit status with wait().";

    public ToolKind ToolKind => ToolKind.RunningAProgram;

    public string Explanation =>
        "When you type ./hello in bash, the shell (the program that reads and runs the commands you type) first parses the line and resolves the program (a name without a slash " +
        "would be looked up in each PATH directory). Then it calls fork(). The kernel creates a new process with a new PID " +
        "(process ID), whose address space (the range of memory the process can see) is a copy of the shell's. The copy is lazy: parent and child share the same physical " +
        "pages, marked read-only, and a page is duplicated only when one of them writes to it (copy-on-write). fork " +
        "returns twice, once in each process: the child's PID in the parent, 0 in the child. That return value is how the " +
        "same code knows which side it's on.\n\n" +
        "The child then calls execve(\"./hello\", argv, envp). exec doesn't create a process; it replaces the program " +
        "running in the current one. The kernel checks permissions, reads the ELF header (Windows uses the PE format), " +
        "throws away the child's copy of bash's memory, and maps the new program's segments: code read-only and " +
        "executable, data read-write, plus a fresh stack holding argc, argv and the environment. The PID stays the same, " +
        "and open file descriptors carry over unless they're marked close-on-exec. That's how the child inherits the terminal " +
        "as stdin, stdout and stderr (the standard input, output and error streams), and how a shell sets up a redirect: it changes file descriptor 1 in the " +
        "child between fork and exec. Splitting the work into fork then exec is what gives the shell that gap.\n\n" +
        "Most programs are dynamically linked, so the ELF file names an interpreter, the dynamic linker " +
        "(ld-linux-x86-64.so.2 on Linux). The kernel starts that first. It maps the shared libraries the program needs, such as " +
        "libc.so.6, resolves symbols like printf to addresses, applies relocations and runs library initializers. " +
        "Finally it jumps to the program's entry point, _start, which sets up the C runtime and calls main(argc, argv). " +
        "A .NET app adds layers: a native host (the apphost or dotnet) loads hostfxr and the runtime (coreclr), which loads " +
        "your assembly and JIT-compiles Main before running it.\n\n" +
        "Meanwhile the process moves through the classic lifecycle. It's new while being created, ready when it could " +
        "run but is waiting for a core, running when on a CPU, waiting (blocked) while it waits for I/O or an event, and " +
        "terminated when done. When main returns, the C runtime calls exit, which flushes stdio buffers and makes the " +
        "exit_group system call. The kernel frees the memory and closes the files, but keeps a small entry with the exit " +
        "status: the process is now a zombie. The kernel sends the parent SIGCHLD, a signal (a small notification the kernel delivers to a process), and the parent's wait() or waitpid() " +
        "reads the status and removes the zombie, which is called reaping. That status is what $? shows in bash. A parent " +
        "that never waits leaks zombies; a parent that exits first leaves an orphan, which the kernel re-parents to init " +
        "(PID 1) or a designated subreaper, and init reaps it.\n\n" +
        "Windows has no fork. CreateProcess builds the new process and loads the program in one call, and .NET's " +
        "Process.Start uses CreateProcess on Windows and fork or vfork plus exec on Linux. What a process owns once it's " +
        "running, and how its threads share it, is in Threads vs Processes and the Scheduler.";
}
