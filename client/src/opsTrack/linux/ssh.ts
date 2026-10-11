import { src, type OpsLessonData } from "../types.ts";

export const ssh: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "SSH (Secure Shell) is how you get a terminal on a remote Linux machine, copy files to it, and how tools like Git, Ansible and CI pipelines reach servers. The client (`ssh`) connects to a server daemon (`sshd`, listening on TCP port 22) over an encrypted channel. Before you type anything, two questions get answered: is this really the server I meant (host key check), and are you allowed in (user authentication)?",
        "Both answers use key pairs. A key pair is two linked keys: a private key that never leaves its owner, and a public key you can hand to anyone. Something signed with the private key can be checked with the public key, but the public key can't be used to forge a signature. The server proves its identity with its host key pair; you prove yours with your user key pair.",
      ],
    },
    {
      kind: "code",
      title: "Make a key pair",
      blocks: [
        {
          lang: "bash",
          code: 'ssh-keygen -t ed25519 -C "ana@conperio" -f ~/.ssh/id_ed25519',
          output: src`
Generating public/private ed25519 key pair.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/ana/.ssh/id_ed25519
Your public key has been saved in /home/ana/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:mDMJPk4J/BlungX/xmAtgbzJSphTv9fCe2C5Bc6U3Ts ana@conperio
The key's randomart image is:
+--[ED25519 256]--+
|                 |
| . . .           |
|  + * .o .       |
| + B X+*. .      |
|+ . #+%oS  .     |
| o * B*O. E      |
|  . =.++=  .     |
|     ..+.        |
|      ..         |
+----[SHA256]-----+
`,
        },
        {
          lang: "bash",
          code: "cat ~/.ssh/id_ed25519.pub",
          output: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPArOBPcFFHyVGTvqcG4EUllQXrjVVj9oEQSbo98t3Fc ana@conperio",
        },
      ],
      notes: [
        "Ed25519 is the modern default: short keys, fast, and strong. Use RSA (`-t rsa -b 4096`) only for old systems that don't support it. `-C` is a comment to help you recognise the key later; `-f` names the file (this is also the default name).",
        "The passphrase encrypts the private key on disk, so a stolen laptop backup doesn't hand over your server access. `ssh-agent` remembers the unlocked key for your session so you only type the passphrase once.",
        "`id_ed25519` is the private key (mode 600: only you can read it). `id_ed25519.pub` is the public key, one line you can paste anywhere. The fingerprint is a short hash of the public key for comparing keys by eye.",
      ],
    },
    {
      kind: "steps",
      title: "What happens when you run ssh deploy@web01",
      steps: [
        "The client connects to port 22, and both sides agree on a shared session key using a key exchange (Diffie-Hellman style): neither side ever sends it, so an eavesdropper can't work it out. Everything after this is encrypted.",
        "The server signs the exchange with its host private key. The client checks that signature against the host's public key stored in `~/.ssh/known_hosts`. First connection: no entry yet, so ssh shows the fingerprint and asks you to confirm. Mismatch: ssh refuses loudly, because either the server was rebuilt or someone is in the middle.",
        "The client offers your public key. The server looks for it in `~deploy/.ssh/authorized_keys`. If it's there, the client signs data unique to this session with your private key, the server checks the signature with the public key, and you're in. The private key never crossed the network.",
        "If no key works and the server allows it, ssh falls back to a password. Most hardened servers turn that off (`PasswordAuthentication no` in `/etc/ssh/sshd_config`), leaving keys as the only way in.",
      ],
    },
    {
      kind: "widget",
      widget: "sshLogin",
      title: "Try it: keys, known_hosts and the errors you'll meet",
      intro:
        "Generate a key, try to connect, install the key with ssh-copy-id, then break things: loosen the private key's permissions, switch off password logins, rebuild the server.",
    },
    {
      kind: "code",
      title: "~/.ssh/config: stop typing long commands",
      blocks: [
        {
          lang: "text",
          label: "~/.ssh/config",
          code: src`
Host web01
  HostName 10.20.0.11
  User deploy
  Port 2222
  IdentityFile ~/.ssh/id_ed25519

Host *.plant.local
  User ops
  ProxyJump bastion.conperio.example
`,
        },
        {
          lang: "bash",
          label: "what ssh will actually use (-G prints the settings and exits)",
          code: src`
ssh -G web01 | grep -E "^(user|hostname|port|identityfile) "
ssh -G line3.plant.local | grep -E "^(user|hostname|proxyjump) "
`,
          output: src`
user deploy
hostname 10.20.0.11
port 2222
identityfile ~/.ssh/id_ed25519
user ops
hostname line3.plant.local
proxyjump bastion.conperio.example
`,
        },
      ],
      notes: [
        "Now `ssh web01` means `ssh -p 2222 -i ~/.ssh/id_ed25519 deploy@10.20.0.11`, and `scp`, `rsync` and `git` use the same settings. The first matching value for each setting wins, so put specific hosts above wildcard ones.",
        "`ProxyJump` connects through a bastion host (a single hardened machine that's the only SSH entry point into a network), the usual way into plant and production networks: `ssh -J bastion target` does the same on the command line.",
      ],
    },
    {
      kind: "code",
      title: "Managing known_hosts",
      blocks: [
        {
          lang: "bash",
          code: src`
ssh-keygen -F web02 -f known_hosts     # is there an entry for web02?
ssh-keygen -R web01 -f known_hosts     # remove web01's entry (after a confirmed rebuild)
`,
          output: src`
# Host web02 found: line 2
web02 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE1wQC07X+hg2iwudO546clfvm4VjV2ONQ0giGoiQDDT
# Host web01 found: line 3
known_hosts updated.
Original contents retained as known_hosts.old
`,
        },
      ],
      notes: [
        "Without `-f` both work on `~/.ssh/known_hosts`. Only remove an entry once you know why the key changed. Many companies publish host fingerprints or use SSH certificates so nobody has to guess.",
      ],
    },
    {
      kind: "table",
      title: "Everyday SSH",
      head: ["Command", "What it does"],
      rows: [
        ["`ssh web01 'df -h /'`", "run one command remotely and come back"],
        ["`scp app.tar.gz web01:/tmp/`", "copy a file to the server (`scp web01:/var/log/syslog .` copies back)"],
        ["`rsync -av site/ web01:/var/www/site/`", "copy only what changed; the trailing slashes matter"],
        ["`ssh -L 5433:db01:5432 web01`", "local port forward: your localhost:5433 reaches db01:5432 through web01"],
        ["`ssh-copy-id deploy@web01`", "append your public key to the server's authorized_keys (logs in with your password once)"],
        ["`ssh -v web01`", "verbose: shows which keys are tried and why authentication fails"],
      ],
    },
  ],
  quiz: [
    {
      question: "Which file do you copy to a server so you can log in to it with your key?",
      answer: "~/.ssh/id_ed25519.pub, appended to the server's ~/.ssh/authorized_keys",
      distractors: ["~/.ssh/id_ed25519, copied to the server's ~/.ssh/", "~/.ssh/known_hosts", "/etc/ssh/sshd_config"],
      why: "Only the public key goes anywhere. The private key never leaves your machine; that's what makes the scheme safe.",
    },
    {
      question: "ssh prints WARNING: UNPROTECTED PRIVATE KEY FILE! Permissions 0644 ... are too open. What's the fix?",
      answer: "chmod 600 ~/.ssh/id_ed25519",
      distractors: ["chmod 644 ~/.ssh/id_ed25519.pub", "ssh-keygen -R the host", "Add the key to known_hosts"],
      why: "ssh refuses to use a private key other users could read. 600 means only the owner can read and write it. The ~/.ssh folder itself should be 700.",
    },
    {
      question: "After a server is reinstalled, ssh shows REMOTE HOST IDENTIFICATION HAS CHANGED and refuses to connect. What should you do?",
      answer: "Confirm the new fingerprint with whoever rebuilt it, then remove the old entry with ssh-keygen -R",
      distractors: [
        "Delete ~/.ssh/known_hosts entirely",
        "Connect with -o StrictHostKeyChecking=no from now on",
        "Generate a new key pair for yourself",
      ],
      why: "The warning is exactly what a man-in-the-middle attack would look like. Expected after a rebuild, but check before trusting the new key. Turning checking off removes the protection for good.",
    },
    {
      question: "What does ssh -J bastion db01 do?",
      answer: "Connects to db01 by going through bastion first",
      distractors: ["Copies db01's files to bastion", "Runs the command db01 on bastion", "Forwards bastion's port 22 to db01"],
      why: "-J (ProxyJump) opens an SSH connection to the bastion and tunnels a second, end-to-end encrypted SSH connection through it to db01.",
    },
    {
      question: "Why use a passphrase on your private key?",
      answer: "So a copy of the key file alone isn't enough to log in as you",
      distractors: ["The server requires one", "It makes the connection faster", "It replaces the server's password"],
      why: "The passphrase encrypts the key at rest. ssh-agent keeps it unlocked in memory during your session so it isn't a daily nuisance.",
    },
  ],
  pitfalls: [
    "Sharing one private key between people or machines. Each person and each automation gets its own key, so one can be revoked without breaking the others.",
    "Wrong permissions on the server side: if `~/.ssh` or `authorized_keys` is writable by others, sshd silently ignores the key. `chmod 700 ~/.ssh; chmod 600 ~/.ssh/authorized_keys`.",
    "Answering yes to the first-connection prompt without reading it. For important hosts, compare the fingerprint with one you got another way.",
    "Leaving old keys in authorized_keys after someone leaves. Review it, or manage keys centrally.",
  ],
  next: [
    { id: "linux-permissions", label: "Users and Permissions" },
    { id: "linux-disks-logs", label: "Disks, Filesystems and Logs" },
  ],
};
