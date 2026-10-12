namespace DsaAcademy.Content.Tools;

public class WinProcessesServicesTool : ITool
{
    public string Id => "win-processes-services";
    public string Section => "Windows & PowerShell";
    public string Track => "windows";
    public int Order => 1;
    public string Title => "Windows for IT: Processes, Services and the Registry";
    public string OneLiner => "How Windows runs background services, how to manage them from PowerShell, and where Windows keeps its configuration.";
    public string KeyTakeaway => "A service is a background program started by the Service Control Manager, with a startup type (Automatic, Delayed, Manual, Disabled), an account it runs as, dependencies and recovery actions. Get-Service, Set-Service and Start-Service manage them. The registry is Windows' configuration database: HKLM for the machine, HKCU for the user.";

    public ToolKind ToolKind => ToolKind.WinProcessesServices;

    public string Explanation =>
        "Windows servers and PCs run much of their work as services: background programs with no window that start at boot, run as a service account and restart according to their recovery settings. Knowing how startup types, dependencies and service accounts work explains most \"it was running yesterday\" tickets." +
        "\n\n" +
        "This lesson covers processes and services from PowerShell and the command prompt, a simulator of the Service Control Manager where you start, stop, crash and reboot services with dependencies, and the registry: its root keys, value types and the handful of locations IT people actually visit." +
        "\n\n" +
        "Windows, PowerShell and Active Directory can't run in this app, so the PowerShell output shown here follows the documented formats and is marked as not captured.";
}
