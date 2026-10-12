namespace DsaAcademy.Content.Tools;

public class KernelModeSyscallsTool : ITool
{
    public string Id => "kernel-mode-syscalls";
    public string Section => "Computer Fundamentals";
    public string Track => "operating systems and runtimes";
    public string Title => "User Mode, Kernel Mode, System Calls and Interrupts";
    public string OneLiner => "Why your code can't touch the disk directly, how it asks the kernel to, and how hardware gets the CPU's attention.";
    public string KeyTakeaway =>
        "The CPU runs your code in user mode, where privileged instructions and other processes' memory are off limits. " +
        "To read a file, send a packet or start a process, code makes a system call: a special instruction that switches " +
        "the CPU into kernel mode at a fixed entry point the kernel controls. Interrupts are how devices and the timer get " +
        "the CPU's attention, and exceptions such as page faults are how the CPU reports a problem with the current " +
        "instruction. All three enter the kernel the same way: through a table of handlers the kernel set up at boot.";

    public ToolKind ToolKind => ToolKind.KernelModeSyscalls;

    public string Explanation =>
        "Modern CPUs have at least two privilege levels. On x86 these are rings: the kernel runs in ring 0 (kernel " +
        "mode), applications in ring 3 (user mode). ARM calls them exception levels, EL1 and EL0. In user mode the CPU refuses " +
        "privileged instructions, such as disabling interrupts, changing page tables (the OS's map of which memory each process may use) or talking to I/O devices directly, and the page tables mark kernel memory as off limits. Try one anyway and the CPU raises an exception, " +
        "the kernel takes over, and your process is usually killed. That hardware enforcement is what makes processes " +
        "isolated from each other and from the kernel, rather than isolated by convention.\n\n" +
        "A system call is the controlled door between the two. Your C# File.ReadAllBytes eventually calls the C library's " +
        "read wrapper, which puts a syscall number and arguments in registers (the CPU's own tiny storage slots) and executes the syscall instruction (svc on " +
        "ARM64). The CPU switches to kernel mode and jumps to the kernel's entry point, never to an address the caller " +
        "chose. The kernel checks the arguments (is this file descriptor, the number the OS handed out for an open file, yours; is that buffer, the block of memory the data goes into, in your memory), does the " +
        "work, puts a result or error code in a register, and returns to user mode. On Linux, open, read, write, mmap, fork, " +
        "execve and exit are all system calls; on Windows, programs call documented Win32 APIs that wrap undocumented " +
        "Nt* system calls.\n\n" +
        "A system call costs a mode switch, roughly a hundred nanoseconds to a microsecond with today's security " +
        "mitigations, which is far more than a function call. That's why buffered I/O exists (one write of 64 KB instead " +
        "of 65,536 writes of one byte) and why Linux maps some read-only calls such as clock_gettime into user space " +
        "through the vDSO, so they need no mode switch at all. A mode switch isn't a context switch: the same thread keeps " +
        "running, just with more privilege. A context switch only happens if the kernel decides to run a different thread, " +
        "for example because the read has to wait for the disk.\n\n" +
        "Interrupts are asynchronous: a device raises one when something happens, such as a key press, a packet " +
        "arriving or a disk read completing. The CPU finishes its current instruction, saves where it was, switches to " +
        "kernel mode and runs that interrupt's handler from the interrupt descriptor table. The timer interrupt matters " +
        "most to scheduling: it fires every few milliseconds, which is how the kernel takes the CPU back from a thread " +
        "that never makes a system call. Exceptions are synchronous: the current instruction caused them. A page fault (touching " +
        "memory that isn't currently mapped in), a divide by zero and a breakpoint are all exceptions, and on x86 the int3 breakpoint and the old int 0x80 system " +
        "call path are called traps because they're deliberate.\n\n" +
        "Interview framing: user programs request privileged work through system calls, the hardware enforces the " +
        "boundary, and the kernel is entered only through system calls, interrupts and exceptions. Virtual memory, " +
        "which is what makes another process's memory unreachable, is covered in Virtual Memory, Paging and Cache Locality.";
}
