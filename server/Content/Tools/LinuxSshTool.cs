namespace DsaAcademy.Content.Tools;

public class LinuxSshTool : ITool
{
    public string Id => "linux-ssh";
    public string Section => "Linux & the Command Line";
    public string Track => "administration";
    public int Order => 12;
    public string Title => "SSH and Keys";
    public string OneLiner => "Log in to remote machines with keys instead of passwords, understand known_hosts, and fix the errors everyone meets.";
    public string KeyTakeaway => "SSH checks the server's identity against known_hosts, then checks yours: the server holds your public key in authorized_keys, and you prove you have the matching private key by signing, so no secret crosses the network. Keep private keys at mode 600 with a passphrase, one key per person, and never ignore a changed host key.";

    public ToolKind ToolKind => ToolKind.LinuxSsh;

    public string Explanation =>
        "SSH is the front door to every Linux server, and the transport under Git, Ansible and most deployment tools. Using it well means using keys: they're both safer and more convenient than passwords once set up." +
        "\n\n" +
        "This lesson generates a real key pair, walks through what happens when you connect, and gives you a model laptop and server to experiment with: first connections, installing a key with ssh-copy-id, a private key with the wrong permissions, password logins switched off, and a rebuilt server whose host key changed. Then ~/.ssh/config, jump hosts and the everyday commands for copying files and forwarding ports.";
}
