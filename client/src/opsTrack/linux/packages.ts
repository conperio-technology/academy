import { src, type OpsLessonData } from "../types.ts";

export const packages: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "On Linux you rarely download an installer from a website. Software comes as packages from repositories (servers run by your distribution, or by a vendor such as Docker or Microsoft), and a package manager installs them, works out and fetches their dependencies (the other packages they need), and keeps track of every file so it can upgrade or remove them cleanly later.",
        "Two families cover most servers. Debian and Ubuntu use `.deb` packages: `dpkg` installs a single file, and `apt` sits on top to handle repositories and dependencies. Red Hat Enterprise Linux, Rocky, Alma and Fedora use `.rpm` packages: `rpm` for single files, `dnf` (formerly `yum`) on top.",
      ],
    },
    {
      kind: "table",
      title: "apt and dnf side by side",
      head: ["Task", "Debian / Ubuntu", "RHEL / Rocky / Fedora"],
      rows: [
        ["Refresh the list of available packages", "`sudo apt update`", "`sudo dnf makecache` (dnf also refreshes by itself)"],
        ["Install upgrades", "`sudo apt upgrade`", "`sudo dnf upgrade`"],
        ["Install a package", "`sudo apt install nginx`", "`sudo dnf install nginx`"],
        ["Remove it (keep config files)", "`sudo apt remove nginx`", "`sudo dnf remove nginx`"],
        ["Remove it and its config files", "`sudo apt purge nginx`", "(remove leaves modified configs as `.rpmsave`)"],
        ["Remove dependencies nothing needs any more", "`sudo apt autoremove`", "`sudo dnf autoremove`"],
        ["Search", "`apt search json`", "`dnf search json`"],
        ["Details about a package", "`apt show jq`", "`dnf info jq`"],
        ["Which package owns this file?", "`dpkg -S /usr/bin/ssh-keygen`", "`rpm -qf /usr/bin/ssh-keygen`"],
        ["Which files did this package install?", "`dpkg -L jq`", "`rpm -ql jq`"],
        ["Is it installed, and which version?", "`apt-cache policy jq`", "`rpm -q jq`"],
        ["Stop a package being upgraded", "`sudo apt-mark hold docker-ce`", "`sudo dnf versionlock add docker-ce` (plugin)"],
      ],
      notes: ["`apt` is the friendly command for people; `apt-get` and `apt-cache` are the older tools with output that stays stable for scripts. Both use the same database."],
    },
    {
      kind: "code",
      title: "Asking the package database questions",
      blocks: [
        {
          lang: "bash",
          code: "apt-cache policy jq",
          output: src`
jq:
  Installed: 1.7.1-3ubuntu0.24.04.2
  Candidate: 1.7.1-3ubuntu0.24.04.2
  Version table:
 *** 1.7.1-3ubuntu0.24.04.2 500
        500 http://archive.ubuntu.com/ubuntu noble-updates/main amd64 Packages
        500 http://security.ubuntu.com/ubuntu noble-security/main amd64 Packages
        100 /var/lib/dpkg/status
     1.7.1-3build1 500
        500 http://archive.ubuntu.com/ubuntu noble/main amd64 Packages
`,
        },
        {
          lang: "bash",
          code: src`
dpkg -S /usr/bin/ssh-keygen
dpkg -l jq openssh-client | tail -2
`,
          output: src`
openssh-client: /usr/bin/ssh-keygen
ii  jq             1.7.1-3ubuntu0.24.04.2 amd64        lightweight and flexible command-line JSON processor
ii  openssh-client 1:9.6p1-3ubuntu13.19   amd64        secure shell (SSH) client, for secure access to remote machines
`,
        },
      ],
      notes: [
        "`apt-cache policy` answers \"what's installed, what would I get, and from where?\" Installed is the version on disk; Candidate is what `apt install` or `apt upgrade` would give you. Each version lists the repositories offering it, with a priority (500 is normal). Ubuntu 24.04 is code-named noble; `noble` is the release as shipped, `noble-updates` and `noble-security` carry fixes since.",
        "`ii` in `dpkg -l` means \"desired: install, status: installed\". `rc` means removed but config files remain, which is what `apt remove` leaves behind and `apt purge` cleans up.",
        "Version strings like `1:9.6p1-3ubuntu13.19` read as epoch (`1:`), the upstream version (`9.6p1`) and the distribution's own revision (`3ubuntu13.19`). The revision is why a \"9.6\" from Ubuntu can still contain a security fix from years later: distributions backport fixes instead of jumping versions.",
      ],
    },
    {
      kind: "code",
      title: "A dry run: what would apt do?",
      blocks: [
        {
          lang: "bash",
          code: "apt-get install -s nginx",
          output: src`
Reading package lists...
Building dependency tree...
Reading state information...
The following additional packages will be installed:
  nginx-common
Suggested packages:
  fcgiwrap nginx-doc
The following NEW packages will be installed:
  nginx nginx-common
0 upgraded, 2 newly installed, 0 to remove and 42 not upgraded.
Inst nginx-common (1.24.0-2ubuntu7.18 Ubuntu:24.04/noble-updates, Ubuntu:24.04/noble-security [all])
Inst nginx (1.24.0-2ubuntu7.18 Ubuntu:24.04/noble-updates, Ubuntu:24.04/noble-security [amd64])
Conf nginx-common (1.24.0-2ubuntu7.18 Ubuntu:24.04/noble-updates, Ubuntu:24.04/noble-security [all])
Conf nginx (1.24.0-2ubuntu7.18 Ubuntu:24.04/noble-updates, Ubuntu:24.04/noble-security [amd64])
`,
        },
      ],
      notes: [
        "`-s` (simulate) shows the plan and changes nothing, and works without root. Read the summary line before saying yes to a real install or removal: \"2 to remove\" when you asked to remove one package means something depends on it.",
        "\"Suggested packages\" are optional extras apt won't install unless asked. \"42 not upgraded\" means updates are waiting for `apt upgrade`.",
      ],
    },
    {
      kind: "widget",
      widget: "aptSimulator",
      title: "Try it: dependencies, removal and autoremove",
      intro:
        "apt marks every package as manually installed (you asked for it) or automatically installed (pulled in as a dependency). That mark is how autoremove knows what's safe to clean up.",
    },
    {
      kind: "text",
      title: "Updates on servers",
      paragraphs: [
        "Patching is mostly package upgrades. On Ubuntu, `unattended-upgrades` installs security updates automatically every day by default; check `/var/log/unattended-upgrades/` to see what it did. If `/var/run/reboot-required` exists, an update (usually the kernel or a core library) only takes effect after a reboot.",
        "Adding a vendor repository (Docker, Microsoft, PostgreSQL) means trusting its signing key: the package manager checks every package's signature against keys you've installed, which is what stops a tampered mirror serving you malware. Follow the vendor's instructions exactly, and prefer the distribution's own packages when they're new enough.",
        "Other packaging systems sit alongside: snap and Flatpak bundle an app with its dependencies, and language ecosystems have their own managers (pip, npm, NuGet). Containers are the server-side version of the same idea, covered in the containers lessons.",
      ],
    },
  ],
  quiz: [
    {
      question: "You run sudo apt install htop and get \"Unable to locate package htop\" on a fresh cloud server. What's the most likely fix?",
      answer: "Run sudo apt update first, so apt downloads the current package lists",
      distractors: ["Use sudo dnf install htop", "Download htop from its website", "Run sudo apt upgrade htop"],
      why: "Fresh images often ship with empty or stale package lists. apt install only searches the lists you've already downloaded; apt update fetches them.",
    },
    {
      question: "What's the difference between apt remove and apt purge?",
      answer: "purge also deletes the package's system-wide configuration files",
      distractors: ["purge also removes the dependencies", "remove only stops the service", "There's no difference"],
      why: "remove deletes the program but keeps its config (dpkg shows it as rc), so a reinstall picks your settings back up. Dependencies are removed separately by autoremove.",
    },
    {
      question: "Which command tells you which package installed /usr/bin/ssh-keygen on Ubuntu?",
      answer: "dpkg -S /usr/bin/ssh-keygen",
      distractors: ["dpkg -L /usr/bin/ssh-keygen", "apt show ssh-keygen", "which ssh-keygen"],
      why: "dpkg -S searches installed files for a path. dpkg -L goes the other way, listing a package's files. which only tells you where the command is.",
    },
    {
      question: "You installed jq, which pulled in libjq1 and libonig5. Then you ran sudo apt remove jq. What happens to the two libraries?",
      answer: "They stay installed, and apt suggests apt autoremove to remove them",
      distractors: ["They're removed together with jq", "They're marked manually installed", "apt refuses to remove jq while they're installed"],
      why: "Removing a package never removes its dependencies directly; they become automatically installed packages that nothing needs, which autoremove cleans up.",
    },
    {
      question: "On a RHEL or Rocky Linux server, what's the equivalent of apt install?",
      answer: "dnf install",
      distractors: ["rpm install", "yum-get install", "apt-rpm install"],
      why: "dnf is the dependency-resolving front end for rpm packages (yum on older releases, and still available as an alias). rpm -i installs a single file without resolving dependencies.",
    },
  ],
  pitfalls: [
    "Installing from random `.deb` or `.rpm` files: nothing updates them later, so they silently stop getting security fixes. Prefer a repository.",
    "Running `apt upgrade` on production without reading the list. Kernel, database and runtime upgrades deserve a maintenance window and, often, a reboot.",
    "`curl ... | sudo bash` install scripts run whatever the server sends, as root. Download, read, then run.",
    "Leaving `apt-mark hold` in place forever: a held package also misses its security fixes. Note why you held it and when to lift it.",
  ],
  next: [
    { id: "linux-systemd", label: "systemd Services and journalctl" },
    { id: "cloud-container-images", label: "Container Images: Dockerfiles, Layers, Tags and Registries" },
  ],
};
