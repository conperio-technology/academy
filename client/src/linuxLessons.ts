// The exercises for each Linux lesson. Every check is a shell command run as root on the
// VM's hidden second serial port (see LinuxLab.tsx), from /home/learner; it passes when it
// exits 0. Setup runs the same way, once, right after the machine boots (after SANDBOX_SETUP).
// Anything setup creates under /home/learner must be chown'd to learner, or the learner
// can't change it.
//
// Text fields (intro, concepts, hint, why, command `what`) may use `backticks` for inline code.

export interface LinuxTask {
  title: string;
  hint: string; // a nudge in the right direction, not the answer
  answer: string;
  why: string; // shown with the answer: why it works
  check: string;
}

export interface LinuxCommand {
  cmd: string;
  what: string;
  example: string; // clicking it types this into the terminal (without pressing Enter)
}

export interface LinuxLesson {
  intro: string;
  concepts?: string[];
  commands: LinuxCommand[];
  setup?: string;
  tasks: LinuxTask[];
}

// ---- Shared by every lesson -------------------------------------------------------------

// Quote a string for sh: 'it'\''s'.
const q = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

// One shell command that writes `lines` to `path`. Each command must stay on one line (the
// hidden shell reads line by line, up to 4 KB), so files are written with printf.
function writeFile(path: string, lines: string[], mode: string): string {
  return `printf '%s\\n' ${lines.map(q).join(" ")} > ${path} && chmod ${mode} ${path}`;
}

// The welcome shown in the terminal once the machine is up (it replaces the boot output),
// and saved as /etc/motd so a new shell shows it too.
export const SANDBOX_WELCOME = [
  "Welcome to the Conperio Academy Linux sandbox.",
  "",
  "This is a real (tiny) Linux computer running inside your browser. Nothing you",
  "do here can affect anything else, and Restart machine gives you a fresh one.",
  "",
  "You're already logged in as learner, an ordinary user: no password, no sudo.",
  "  Your home folder is /home/learner, written ~ for short. cd ~ takes you there.",
  "  You can create and change files in ~ and in /tmp.",
  "  Everywhere else (/, /etc, /srv ...) you can look but not write, so mkdir there",
  "  says \"Permission denied\". That's Linux permissions working, not a bug.",
  "  pwd shows where you are; ls -ld . shows who owns the folder you're in.",
  "",
  "Try: pwd, ls -la, cat notes.txt -- then work through the tasks below.",
  "",
];

const SUDO_MESSAGE = [
  "sudo isn't available in this sandbox -- and you don't need it.",
  "",
  "What it is: on a real server, sudo (\"superuser do\") runs one command as root,",
  "the administrator account that can change anything. It asks for YOUR password",
  "and checks a list of who's allowed (/etc/sudoers), and it logs what you ran.",
  "",
  "Why not here: you're the ordinary user learner on purpose. Every task in these",
  "lessons works without root, and finding out what a normal user can't do is",
  "part of learning Linux permissions.",
  "",
  "What to do instead:",
  "  - Got \"Permission denied\"? Run pwd to see where you are, and ls -ld . to see",
  "    who owns that folder. If it isn't learner, you can't write there.",
  "  - Your own space is your home folder (cd ~ takes you there) and /tmp.",
  "  - /, /etc, /srv and the rest belong to root: read them, don't change them.",
];

const SU_MESSAGE = [
  "su isn't available in this sandbox, so you stay learner.",
  "",
  "What it is: su (\"switch user\") starts a shell as another account, usually",
  "root, after asking for THAT account's password. On real servers people mostly",
  "use sudo instead, which runs one command at a time as root and logs who did it.",
  "",
  "Here there's nothing to log in to: you're already logged in as learner, and",
  "every task works as a normal user. Your own space is ~ (cd ~) and /tmp.",
];

function explainer(name: string, message: string[]): string {
  return writeFile(`/usr/local/bin/${name}`, ["#!/bin/sh", "cat >&2 <<'EOF'", ...message, "EOF", "exit 1"], "755");
}

// Run on the hidden root shell, one command at a time, before each lesson's own setup.
// The scripts only print an explanation and never grant root. /usr/local/bin is first on
// learner's PATH (/etc/profile), so sudo is found there. su is a BusyBox applet, which
// BusyBox's sh runs ahead of anything on the PATH, so learner's profile gets an alias for it.
// (The hidden shell and the login loop in init don't read /etc/profile or have
// /usr/local/bin on their PATH, so they keep the real su.)
export const SANDBOX_SETUP = [
  explainer("sudo", SUDO_MESSAGE),
  explainer("su", SU_MESSAGE),
  "echo 'alias su=/usr/local/bin/su' >> /etc/profile",
  `printf '%s\\n' ${SANDBOX_WELCOME.map(q).join(" ")} > /etc/motd`,
];

// Ends learner's login shell, so init logs learner in again with the profile above (the
// page hides the restart and shows the new login's welcome).
export const SANDBOX_RELOGIN = "kill -9 $(ps | awk '$2 == \"learner\" && $3 == \"-sh\" && NF == 3 { print $1 }')";

// ---- Lessons ----------------------------------------------------------------------------

const BACKUP_JOB = "/bin/su learner -c '/usr/local/bin/backup-job >/dev/null 2>&1 &'";
const STUBBORN_JOB = [
  writeFile(
    "/usr/local/bin/stubborn-job",
    ["#!/bin/sh", "# A stuck job that ignores SIGTERM: only kill -9 stops it.", "trap '' TERM", "while true; do sleep 5; done"],
    "755",
  ),
  "/bin/su learner -c '/usr/local/bin/stubborn-job >/dev/null 2>&1 &'",
].join(" && ");

export const LINUX_LESSONS: Record<string, LinuxLesson> = {
  files: {
    intro: "You start in your home folder, /home/learner. Look around first: `pwd`, `ls -la`, `cat notes.txt`.",
    concepts: [
      "Linux keeps everything in one tree of folders that starts at `/`, the root. A path starting with `/` is absolute: the full address from the top, like `/srv/app/config`. Any other path is relative to the folder you're in, so `reports` means `./reports`, a folder here. `~` is short for your home folder, `/home/learner`, and `..` means the folder above.",
      "Names starting with a dot are hidden: `ls` skips them and `ls -a` shows them. `ls -l` adds a details line per file: permissions, owner, group, size in bytes, date and name. `ls -la` does both.",
      "Wildcards let one command name many files. `*` matches any run of characters and `?` exactly one, so `*.csv` is every name ending in .csv. The shell expands the pattern before the command runs, which is why `echo *.csv` is a safe way to see what a pattern will match.",
      "`>` sends a command's output into a file instead of the screen, replacing whatever was in it. A few tasks here use it to save an answer; the pipes lesson covers it properly.",
    ],
    commands: [
      { cmd: "pwd", what: "print the folder you're in (print working directory)", example: "pwd" },
      { cmd: "ls", what: "list a folder; -l for details, -a for hidden files", example: "ls -la ~" },
      { cmd: "cd", what: "change folder; `cd ..` goes up, `cd ~` (or plain `cd`) goes home", example: "cd ~/downloads" },
      { cmd: "mkdir", what: "make a folder (make directory)", example: "mkdir ~/scratch" },
      { cmd: "touch", what: "create an empty file, or update an existing file's time", example: "touch ~/todo.txt" },
      { cmd: "cat", what: "print a whole file (good for short ones)", example: "cat notes.txt" },
      { cmd: "less", what: "scroll through a long file; arrows to move, / to search, q to quit", example: "less /var/log/app.log" },
      { cmd: "head / tail", what: "the first or last lines of a file; -n says how many", example: "tail -n 5 /var/log/app.log" },
      { cmd: "cp", what: "copy files; the last argument is where they go", example: "cp notes.txt notes-backup.txt" },
      { cmd: "mv", what: "move or rename (the same thing to Linux)", example: "mv notes-backup.txt old-notes.txt" },
      { cmd: "rm", what: "delete for good; -r for folders. There's no recycle bin", example: "rm old-notes.txt" },
      { cmd: "find", what: "search a folder tree by name", example: "find /srv -name '*.yml'" },
      { cmd: "* and ?", what: "wildcards: any characters, or exactly one", example: "echo ~/downloads/*.csv" },
      { cmd: "echo ... >", what: "print text, and with > save it in a file", example: "echo hello > ~/hello.txt" },
    ],
    setup:
      "mkdir -p /home/learner/photos && cd /home/learner/photos && touch holiday-1.jpg holiday-2.jpg team.jpg logo.png && echo 'team.jpg: the 2026 kickoff' > captions.txt && chown -R learner:learner /home/learner/photos",
    tasks: [
      {
        title: "Create a folder called reports in your home folder.",
        hint: "The command's name is short for \"make directory\".",
        answer: "mkdir ~/reports",
        why: "`mkdir` creates a folder. `~/reports` works from anywhere; plain `mkdir reports` works too if you're already at home. If it says Permission denied, run `pwd`: you're somewhere that isn't yours, and `cd ~` gets you back.",
        check: "[ -d reports ]",
      },
      {
        title: "Create an empty file called todo.txt in your home folder.",
        hint: "There's a command that updates a file's timestamp, and creates the file if it doesn't exist yet.",
        answer: "touch ~/todo.txt",
        why: "`touch` is the quickest way to make an empty file. `ls -l todo.txt` shows its size as 0.",
        check: "[ -f todo.txt ]",
      },
      {
        title: "Your home folder has a hidden file. Find it, read it, and write the theme it sets (just the word) into ~/theme.txt.",
        hint: "Hidden files start with a dot, and plain `ls` skips them. Once you've read it, `echo word > file` saves a word in a file.",
        answer: "ls -la ~; cat ~/.settings; echo dark > ~/theme.txt",
        why: "`ls -a` shows dot files (programs keep their settings in them, like `.bashrc`), `cat` prints it (theme=dark), and `>` sends echo's output into theme.txt instead of the screen.",
        check: "[ \"$(tr -d ' \\n' < theme.txt)\" = dark ]",
      },
      {
        title: "How many bytes is notes.txt? Read it from ls -l and write just the number into ~/size.txt.",
        hint: "`ls -l` columns: permissions, link count, owner, group, size, date, name.",
        answer: "ls -l ~/notes.txt; echo 194 > ~/size.txt",
        why: "The fifth column of `ls -l` is the size in bytes (`ls -lh` shows it as K or M instead). Reading ls -l is something you'll do all the time; the permissions lesson explains the first column.",
        check: "[ \"$(tr -d ' \\n' < size.txt)\" = \"$(stat -c %s notes.txt)\" ]",
      },
      {
        title: "Save the last 3 lines of /var/log/app.log into ~/latest.txt.",
        hint: "`head` shows the start of a file and `tail` the end; both take -n to say how many lines. Add `>` to save instead of print.",
        answer: "tail -n 3 /var/log/app.log > ~/latest.txt",
        why: "Logs grow at the bottom, so `tail` is how you see what just happened (`tail -f` keeps watching as new lines arrive). Run it without `> ~/latest.txt` first to see what you'll save.",
        check: "[ -s latest.txt ] && tail -n 3 /var/log/app.log | cmp -s - latest.txt",
      },
      {
        title: "Copy all three .csv files from downloads into reports.",
        hint: "cp accepts several files at once, and * matches any characters.",
        answer: "cp ~/downloads/*.csv ~/reports/",
        why: "The shell expands `~/downloads/*.csv` into the three file names before cp runs, so cp sees three sources and one destination. The trailing / makes it clear the destination is a folder.",
        check: "[ $(ls reports/*.csv 2>/dev/null | wc -l) -eq 3 ]",
      },
      {
        title: "Make a folder ~/photos/jpg and move every .jpg file from ~/photos into it with a single mv. The other files stay where they are.",
        hint: "Make the folder first, then one mv with a pattern that only matches names ending in .jpg. `echo ~/photos/*.jpg` previews the match.",
        answer: "mkdir ~/photos/jpg && mv ~/photos/*.jpg ~/photos/jpg/",
        why: "`*.jpg` matches every name ending in .jpg and nothing else, so logo.png and captions.txt stay put. `&&` runs the mv only if mkdir worked. Previewing a pattern with echo before you mv or rm with it is a good habit.",
        check:
          "[ $(ls photos/jpg/*.jpg 2>/dev/null | wc -l) -eq 3 ] && [ -z \"$(ls photos/*.jpg 2>/dev/null)\" ] && [ -f photos/logo.png ] && [ -f photos/captions.txt ]",
      },
      {
        title: "Move downloads/meeting.txt into reports, renamed to meeting-notes.txt.",
        hint: "mv both moves and renames, in one step if you give it the new path.",
        answer: "mv ~/downloads/meeting.txt ~/reports/meeting-notes.txt",
        why: "mv's last argument is where the file ends up. A folder keeps the old name; a full path with a new name moves and renames at once.",
        check: "[ -f reports/meeting-notes.txt ] && grep -q 'ship v1.5.0' reports/meeting-notes.txt",
      },
      {
        title: "There's a file called app.yml somewhere under /srv. Find it and copy it into your home folder.",
        hint: "find searches a whole folder tree: find WHERE -name WHAT. You can read /srv but not write there, so copy the file home.",
        answer: "cp $(find /srv -name app.yml) ~/",
        why: "`$(...)` runs find first and pastes its output (the path) into the cp command. Running find, then copying the path it prints by hand, works just as well.",
        check: "cmp -s app.yml /srv/app/config/app.yml",
      },
      {
        title: "Delete the downloads folder and everything left in it.",
        hint: "rm won't remove a folder unless you tell it to work recursively. There's no recycle bin, so double-check the path first.",
        answer: "rm -r ~/downloads",
        why: "`-r` (recursive) deletes the folder and everything inside it. rm doesn't ask and nothing can be undone, so `ls` the path first.",
        check: "[ ! -e downloads ]",
      },
    ],
  },

  permissions: {
    intro:
      "Most of this happens in ~/projects/website (`cd ~/projects/website`, then `ls -l`), plus a couple of system files you can look at but not change.",
    concepts: [
      "Every file has an owner (a user) and a group, shown in the third and fourth columns of `ls -l`. The first column says who may do what. In `-rw-r--r--` the first character is the type (`-` file, `d` directory, `l` link), then come three sets of three: the owner (u), the group (g) and everyone else, called others (o).",
      "`r` is read, `w` is write, `x` is execute (run it as a program; for a directory, go into it). A `-` means that permission is off. That's why `mkdir` outside your home folder says Permission denied: `ls -ld /` shows `/` is owned by root and only the owner can write.",
      "`chmod` changes permissions in two styles. Symbolic: who (u, g, o, or a for all), `+` or `-`, and which letters: `chmod u+x deploy.sh`, `chmod go-w file`. Numeric: one digit per set, adding read 4, write 2 and execute 1, so 6 is rw-, 5 is r-x, 4 is r--. `chmod 644` is rw-r--r--, `755` is rwxr-xr-x, `600` is rw-------. Symbolic changes only what you name; numeric sets everything at once.",
      "Only a file's owner (or root) can chmod it. `chown`, which gives a file to another user, is root-only: if ordinary users could give files away, they could slip past disk quotas or leave files in someone else's name. As the owner you can still `chgrp` a file to a group you belong to (`id` lists yours).",
    ],
    commands: [
      { cmd: "ls -l", what: "permissions, owner and group of each file", example: "ls -l ~/projects/website" },
      { cmd: "ls -ld", what: "the same, for a folder itself rather than what's in it", example: "ls -ld /tmp" },
      { cmd: "id", what: "your user, and the groups you're in", example: "id" },
      { cmd: "chmod (symbolic)", what: "who (u g o a), + or -, which (r w x)", example: "chmod u+x deploy.sh" },
      { cmd: "chmod (numeric)", what: "one digit per set: r=4 + w=2 + x=1", example: "chmod 644 index.html" },
      { cmd: "chgrp", what: "give a file to one of your groups", example: "chgrp devs style.css" },
      { cmd: "chown", what: "change the owner; root only, so it fails here", example: "chown root style.css" },
      { cmd: "stat", what: "a file's details; -c %a prints the mode as a number", example: "stat -c '%a %U %G' secrets.env" },
      { cmd: "./name", what: "run a program in the current folder (it needs x)", example: "./deploy.sh" },
    ],
    tasks: [
      {
        title: "/etc/shadow holds the system's password hashes. Use ls -l to find which user owns it, and write that user's name into ~/shadow-owner.txt. (Try cat /etc/shadow too, and see what happens.)",
        hint: "The owner is the third column of `ls -l`.",
        answer: "ls -l /etc/shadow; echo root > ~/shadow-owner.txt",
        why: "`-rw-r----- root root`: the owner, root, can read and write; the root group can read; everyone else gets nothing. You're everyone else, so `cat` says Permission denied. The file's permissions are doing exactly their job.",
        check: "[ \"$(tr -d ' \\n' < shadow-owner.txt)\" = \"$(stat -c %U /etc/shadow)\" ]",
      },
      {
        title: "/etc/passwd lists the accounts on this machine. Read its permissions with ls -l and write them as a three-digit number (like 750) into ~/passwd-mode.txt.",
        hint: "Split the nine letters after the type into three sets of three and add up each set: r = 4, w = 2, x = 1, - = 0.",
        answer: "ls -l /etc/passwd; echo 644 > ~/passwd-mode.txt",
        why: "rw- is 4 + 2 = 6, r-- is 4, r-- is 4: 644. Everyone may read /etc/passwd (programs use it to turn user IDs into names), but only root can change it. The password hashes live in /etc/shadow, which isn't world-readable.",
        check: "[ \"$(tr -d ' \\n' < passwd-mode.txt)\" = \"$(stat -c %a /etc/passwd)\" ]",
      },
      {
        title: "deploy.sh won't run. Make it executable for yourself, then run it from inside the website folder.",
        hint: "The x permission makes a file runnable; u means you, the owner. To run a program in the current folder, put ./ in front of its name.",
        answer: "cd ~/projects/website && chmod u+x deploy.sh && ./deploy.sh",
        why: "`u+x` adds execute for the owner and leaves everything else alone. The `./` is needed because the shell only looks for commands in the folders on your PATH, and the current folder isn't one of them.",
        check: "[ -x projects/website/deploy.sh ] && [ -f /tmp/deployed-site/index.html ]",
      },
      {
        title: "secrets.env is readable by everyone. Make it readable and writable by you only: nobody else gets any access.",
        hint: "In numbers: read = 4, write = 2, execute = 1, written as owner/group/others. You want rw------- .",
        answer: "chmod 600 ~/projects/website/secrets.env",
        why: "6 = 4 + 2 = read and write for the owner, 0 for the group, 0 for others. 600 is the usual mode for anything secret: SSH keys, .env files, password files.",
        check: '[ "$(stat -c %a projects/website/secrets.env)" = 600 ]',
      },
      {
        title: "Protect index.html from accidental edits: take write permission away from everyone, you included, using the symbolic form.",
        hint: "`a` means all three sets (owner, group and others), and `-` takes a permission away.",
        answer: "chmod a-w ~/projects/website/index.html",
        why: "`a-w` removes w from u, g and o in one go, leaving r--r--r-- (444). The symbolic form changes only what you name, so you don't have to work out the other bits. As the owner you can still `chmod u+w` later: this guards against mistakes, not against you.",
        check: '[ "$(stat -c %a projects/website/index.html)" = 444 ]',
      },
      {
        title: "Try chown root ~/projects/website/style.css and read the error. You can't give the file away, so hand it to the devs group instead (you stay the owner).",
        hint: "Changing the owner is root-only, but the owner can change a file's group to any group they're in. `id` lists yours.",
        answer: "chgrp devs ~/projects/website/style.css",
        why: "chown fails with Operation not permitted because only root can give a file to another user. chgrp works because you own the file and you're in devs. On a real server an admin would run `sudo chown user:group file`.",
        check: '[ "$(stat -c %G projects/website/style.css)" = devs ] && [ "$(stat -c %U projects/website/style.css)" = learner ]',
      },
      {
        title:
          "Create a folder /tmp/team for the devs group: hand it to the devs group, and let the group write to it while everyone else can't.",
        hint: "Three steps: make the folder, change its group, then set permissions so the group can write and others can't.",
        answer: "mkdir /tmp/team && chgrp devs /tmp/team && chmod 770 /tmp/team",
        why: "chgrp gives the folder to the team, and 770 is rwx for you, rwx for devs and nothing for others (`chmod g+w,o-w` also passes). It works in /tmp because anyone may create things there; `ls -ld /tmp` shows rwxrwxrwt.",
        check:
          'p=$(stat -c %A /tmp/team) && [ "$(stat -c %G /tmp/team)" = devs ] && [ "$(echo $p | cut -c6)" = w ] && [ "$(echo $p | cut -c9)" != w ]',
      },
    ],
  },

  pipes: {
    intro:
      "Your web app writes a log to /var/log/app.log. Have a look with `head`, `tail`, or `less` (press q to leave less). Each line: date, time, level, client IP, request, result.",
    concepts: [
      "Every command has three standard streams: input (stdin, stream 0), output (stdout, stream 1) and errors (stderr, stream 2). Normally input comes from the keyboard and both output streams go to the screen.",
      "A pipe, `|`, connects one command's output to the next command's input, so small tools chain into a bigger one: `grep ERROR /var/log/app.log | wc -l` counts errors.",
      "Redirection sends a stream somewhere else: `>` writes output to a file (replacing it), `>>` appends to the end, `2>` catches error messages, and `<` feeds a file in as input.",
    ],
    commands: [
      { cmd: "head / tail", what: "the first or last lines; -n says how many", example: "head -n 5 /var/log/app.log" },
      { cmd: "less", what: "scroll a long file; / searches, q quits", example: "less /var/log/app.log" },
      { cmd: "grep", what: "print the lines that contain a word; -c counts them, -v inverts", example: "grep ERROR /var/log/app.log" },
      { cmd: "wc -l", what: "count lines", example: "wc -l /var/log/app.log" },
      { cmd: "|", what: "send one command's output into the next", example: "grep WARN /var/log/app.log | head -n 3" },
      { cmd: ">  >>", what: "save output in a file: replace, or append", example: "echo hi >> ~/notes.txt" },
      { cmd: "2>", what: "send error messages to a file", example: "ls /nope 2> /dev/null" },
      { cmd: "awk '{print $4}'", what: "print the 4th space-separated column", example: "awk '{print $4}' /var/log/app.log | head" },
      { cmd: "sort / uniq -c", what: "sort lines; count runs of identical lines", example: "awk '{print $3}' /var/log/app.log | sort | uniq -c" },
    ],
    tasks: [
      {
        title: "Save every ERROR line from the log into ~/errors.txt.",
        hint: "grep prints matching lines; > sends a command's output into a file instead of the screen.",
        answer: "grep ERROR /var/log/app.log > ~/errors.txt",
        why: "grep prints every line containing ERROR, and `>` catches that output in a file. Run it without the `>` first to see what you'll save.",
        check: "grep ERROR /var/log/app.log | cmp -s - errors.txt",
      },
      {
        title: "How many WARN lines are there? Put just the number in ~/warn-count.txt.",
        hint: "Pipe grep into a command that counts lines, or look for a grep option that counts.",
        answer: "grep -c WARN /var/log/app.log > ~/warn-count.txt",
        why: "`grep -c` prints the count instead of the lines. `grep WARN /var/log/app.log | wc -l` gives the same number: wc -l counts the lines grep sends down the pipe.",
        check: '[ "$(tr -d " \\n" < warn-count.txt)" = "$(grep -c WARN /var/log/app.log)" ]',
      },
      {
        title: "Which client IP shows up most often? Put just that IP in ~/top-ip.txt.",
        hint: "Chain them: awk '{print $4}' pulls out the 4th column, then sort | uniq -c counts repeats, then sort -rn | head -1 takes the biggest.",
        answer: "awk '{print $4}' /var/log/app.log | sort | uniq -c | sort -rn | head -1 | awk '{print $2}' > ~/top-ip.txt",
        why: "uniq -c only counts identical lines that sit next to each other, so sort first. `sort -rn` puts the biggest count on top, and the last awk drops the count and keeps the IP. Build a pipeline like this one stage at a time, looking at the output each time.",
        check:
          "[ \"$(tr -d ' \\n' < top-ip.txt)\" = \"$(awk '{print $4}' /var/log/app.log | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')\" ]",
      },
      {
        title: "Add the line \"checked the logs\" to the end of notes.txt without losing what's already in it.",
        hint: "> replaces a file's contents. There's a version that adds to the end instead.",
        answer: 'echo "checked the logs" >> ~/notes.txt',
        why: "`>>` appends. One `>` here would have replaced notes.txt with a single line, and there's no undo: a classic way to lose a config file.",
        check: '[ "$(tail -n 1 notes.txt)" = "checked the logs" ] && [ "$(head -n 1 notes.txt)" = "Things to remember:" ]',
      },
      {
        title: "Run ls /nope (a folder that doesn't exist), but send the error message into ~/err.txt instead of the screen.",
        hint: "Error messages travel on their own stream, number 2, so a plain > doesn't catch them. Try it and see.",
        answer: "ls /nope 2> ~/err.txt",
        why: "`>` is short for `1>`, which redirects stream 1, normal output. `2>` redirects stream 2, errors. That's how scripts keep errors out of their output files, or throw them away with `2>/dev/null`.",
        check: "[ -s err.txt ] && grep -q nope err.txt",
      },
    ],
  },

  processes: {
    intro:
      "Two background jobs, backup-job and stubborn-job, have been started for you, and both are stuck. `ps` lists processes (try `ps` and `top`; press q to quit top).",
    setup: `${BACKUP_JOB} && ${STUBBORN_JOB}`,
    concepts: [
      "A process is a running program. Each has a process ID (PID), an owner, and a parent that started it. PID 1 is the first process, started by the kernel; everything else descends from it.",
      "`ps` lists processes (plain `ps` here; `ps aux` on most full Linux systems), and `top` shows a live view sorted by CPU use.",
      "`kill` sends a signal, a small message from the kernel. The default, SIGTERM, politely asks a program to stop; it can catch that to clean up, or even ignore it. `kill -9` sends SIGKILL, which can't be caught or ignored: the kernel just ends the process.",
      "`&` at the end of a command runs it in the background so you get your prompt back. `jobs` lists them, `fg` brings one back to the front and Ctrl+C stops it. `$!` holds the PID of the last background job, and `$$` the PID of your shell itself.",
      "The nice value, from -20 (greedy) to 19 (polite), sets how readily a process gives way to others for CPU time; normal is 0.",
    ],
    commands: [
      { cmd: "ps", what: "list processes: PID, owner, command", example: "ps" },
      { cmd: "ps | grep", what: "find a process by name", example: "ps | grep backup-job" },
      { cmd: "top", what: "live view of what's using the CPU; q quits", example: "top" },
      { cmd: "kill PID", what: "send SIGTERM: please stop", example: "kill 1234" },
      { cmd: "kill -9 PID", what: "send SIGKILL: stop now, no cleanup", example: "kill -9 1234" },
      { cmd: "killall", what: "signal every process with that name", example: "killall backup-job" },
      { cmd: "command &", what: "run in the background", example: "sleep 600 &" },
      { cmd: "jobs / fg", what: "list background jobs / bring one to the front", example: "jobs" },
      { cmd: "$$  $!", what: "your shell's PID / the last background job's PID", example: "echo $$ $!" },
      { cmd: "renice", what: "set a running process's nice value (BusyBox -n adds to it)", example: "renice 10 -p 1234" },
    ],
    tasks: [
      {
        title: "Find backup-job's process ID and stop it.",
        hint: "ps | grep backup-job shows it; the PID is the first column, and kill takes a PID.",
        answer: "kill $(ps | grep '[b]ackup-job' | awk '{print $1}')",
        why: "kill sends SIGTERM, and backup-job does the polite thing and exits. In the answer, `[b]ackup-job` is a trick that stops grep matching its own command line; typing the PID by hand is just as good. (`killall backup-job` also works.)",
        check: "! ps | grep -q '[b]ackup-job'",
      },
      {
        title: "stubborn-job ignores the polite stop signal. Try a plain kill first and check ps: it's still there. Then stop it for good.",
        hint: "kill can send a different signal, one a process can't catch or ignore.",
        answer: "kill -9 $(ps | grep '[s]tubborn-job' | awk '{print $1}')",
        why: "The script runs `trap '' TERM`, which tells its shell to ignore SIGTERM. SIGKILL (-9) never reaches the program at all: the kernel removes the process. Use it only after a plain kill has had a few seconds, because the program gets no chance to save its work.",
        check: "! ps | grep -q '[s]tubborn-job'",
      },
      {
        title: "Your shell is a process too. Write its PID into ~/my-pid.txt.",
        hint: "The shell keeps its own PID in a special variable written with two dollar signs.",
        answer: "echo $$ > ~/my-pid.txt",
        why: "`$$` expands to the shell's own PID; ps shows the same number on the -sh line. Scripts use it to make unique temporary file names, like `/tmp/report.$$`.",
        check:
          "p=$(tr -d ' \\n' < my-pid.txt); [ -n \"$p\" ] && [ -d /proc/$p ] && [ \"$(stat -c %U /proc/$p)\" = learner ] && [ \"$(cat /proc/$p/comm)\" = sh ]",
      },
      {
        title: "Start the command sleep 600 in the background, so you get your prompt back right away.",
        hint: "One character at the end of a command tells the shell not to wait for it.",
        answer: "sleep 600 &",
        why: "`&` runs the command in the background: the shell prints its job number and PID and gives you the prompt back. `jobs` shows it, and its PID is in `$!`.",
        check: "ps | grep -q '[s]leep 600'",
      },
      {
        title: "Lower that sleep's priority to a nice value of 10, so it would yield the CPU to everything else.",
        hint: "renice changes the nice value of a running process; it needs the PID, from ps or from $! right after starting it.",
        answer: "renice 10 -p $(ps | grep '[s]leep 600' | awk '{print $1}')",
        why: "`renice 10` sets the nice value to 10 (BusyBox's `renice -n 10` adds 10 to the current value instead), and `-p` names the process. Ordinary users can only make their processes nicer, never greedier: renice -5 would be refused without root. Overshot? Restart the machine, or start a fresh sleep 600 & and renice that one.",
        check: "[ \"$(ps -o nice,args | grep '[s]leep 600' | awk '{print $1}' | head -1)\" = 10 ]",
      },
    ],
  },

  scripting: {
    intro:
      "This machine runs BusyBox, whose sh is a small POSIX shell: [ ] tests and $(( )) arithmetic work in it, but bash extras such as arrays, (( )) and the full [[ ]] don't, so start your scripts with #!/bin/sh. To write a file, use vi (i to type, Esc then :wq to save), or type cat > name.sh <<'EOF', then the lines, then EOF on a line of its own.",
    concepts: [
      "A script is a text file of commands. The first line, the shebang (`#!/bin/sh`), says which program runs it. After `chmod +x` you can run it as `./name.sh`; `sh name.sh` runs it without the x bit.",
      "Inside a script `$1`, `$2` ... are its arguments. Always put variables in double quotes, `\"$1\"`, so a value with a space stays one word.",
      "`$(command)` (command substitution) runs a command and pastes in its output, so `n=$(wc -l < file)` stores a number in a variable.",
    ],
    setup:
      "mkdir -p /home/learner/docs && printf 'Q3 revenue: up 4%%\\nQ3 downtime: 2h\\n' > '/home/learner/docs/quarterly report.txt' && chown -R learner:learner /home/learner/docs",
    commands: [
      { cmd: "cat > file <<'EOF'", what: "type lines into a file until a line that says EOF", example: "cat > ~/hi.sh <<'EOF'" },
      { cmd: "vi", what: "edit a file: i to type, Esc then :wq to save and quit", example: "vi ~/hello.sh" },
      { cmd: "chmod +x", what: "make a script runnable", example: "chmod +x ~/hello.sh" },
      { cmd: "./script", what: "run a script in the current folder", example: "./hello.sh Ana" },
      { cmd: "\"$1\"", what: "the first argument, quoted so spaces survive", example: "echo \"Hello, $1\"" },
      { cmd: "if [ -e ]", what: "test whether a path exists (-f file, -d folder)", example: "if [ -e /etc/passwd ]; then echo yes; fi" },
      { cmd: "$(...)", what: "run a command and use its output", example: "n=$(wc -l < /var/log/app.log); echo $n" },
      { cmd: "quotes", what: "'single' keeps text exactly; \"double\" still expands $vars", example: "cat ~/docs/'quarterly report.txt'" },
    ],
    tasks: [
      {
        title: "Write ~/hello.sh so that ./hello.sh Ana prints Hello, Ana (using its first argument), and make it executable.",
        hint: "The first argument is $1. Quote it inside double quotes so a name with a space still works. chmod +x makes a file executable.",
        answer: "printf '#!/bin/sh\\necho \"Hello, $1\"\\n' > ~/hello.sh && chmod +x ~/hello.sh",
        why: "Double quotes let `$1` expand but keep `Bo  Li` as one word with both spaces. The answer writes the file with printf so it fits on one line; typing the two lines into vi or `cat > ~/hello.sh <<'EOF'` does the same.",
        check: "[ -x hello.sh ] && [ \"$(./hello.sh Ana)\" = 'Hello, Ana' ] && [ \"$(./hello.sh 'Bo  Li')\" = 'Hello, Bo  Li' ]",
      },
      {
        title: "Write ~/check.sh: it prints exists if the path in its first argument exists, and missing if it doesn't. It must work for paths with spaces too.",
        hint: "`[ -e path ]` tests whether something exists; wrap it in if ... then ... else ... fi, and think about quoting.",
        answer: "printf '#!/bin/sh\\nif [ -e \"$1\" ]; then\\n  echo exists\\nelse\\n  echo missing\\nfi\\n' > ~/check.sh",
        why: "`[` is a command, and `-e \"$1\"` are its arguments. Without the quotes, a path with a space becomes two words and [ complains about too many arguments.",
        check:
          "[ \"$(sh check.sh /etc/passwd)\" = exists ] && [ \"$(sh check.sh /nope)\" = missing ] && [ \"$(sh check.sh '/home/learner/docs/quarterly report.txt')\" = exists ]",
      },
      {
        title: "Copy the file \"quarterly report.txt\" in ~/docs to ~/backup.txt.",
        hint: "The space in the name splits it into two arguments unless you quote the path (or escape the space with a backslash).",
        answer: "cp ~/docs/'quarterly report.txt' ~/backup.txt",
        why: "The quotes make `quarterly report.txt` one argument. ~ must stay outside the quotes, because the shell doesn't expand ~ inside them. Tab completion adds the backslash for you: `docs/quarterly\\ report.txt`.",
        check: "cmp -s backup.txt 'docs/quarterly report.txt'",
      },
      {
        title: "Store the number of lines in /var/log/app.log in a variable, then write lines: followed by that number (for example lines: 123) into ~/count.txt.",
        hint: "Command substitution runs a command and gives you its output. Reading the file through < makes wc print just the number.",
        answer: "n=$(wc -l < /var/log/app.log); echo \"lines: $n\" > ~/count.txt",
        why: "`wc -l file` prints the count and the name; `wc -l < file` reads from stdin, so there's no name to print. `$(...)` captures that number into n.",
        check: "[ \"$(cat count.txt)\" = \"lines: $(wc -l < /var/log/app.log | tr -d ' ')\" ]",
      },
    ],
  },

  scripting2: {
    intro:
      "Loops, exit codes and strict mode, on the same BusyBox machine (#!/bin/sh: no arrays, no (( )) or for (( )); use [ ] and $(( )) instead). ~/old has some log files to tidy, one of them with a space in its name.",
    concepts: [
      "`for x in a b c; do ...; done` runs the body once per word; with a wildcard such as `~/old/*.log` it runs once per matching file, and quoting `\"$f\"` keeps names with spaces whole.",
      "Every command finishes with an exit status: 0 means success, anything else a failure. `$?` holds the last one, `exit N` sets a script's, and `if` and `&&` act on it.",
      "`set -eu` is strict mode: -e stops the script at the first failing command, -u treats an unset variable as an error. `>&2` sends a message to stderr, where errors belong.",
    ],
    setup:
      "mkdir -p /home/learner/old && cd /home/learner/old && echo a > a.log && echo b > b.log && echo c > 'c d.log' && echo keep > keep.txt && chown -R learner:learner /home/learner/old",
    commands: [
      { cmd: "for ... do ... done", what: "repeat for each word or file", example: "for i in 1 2 3; do echo $i; done" },
      { cmd: "seq", what: "print a range of numbers", example: "seq 1 5" },
      { cmd: "touch", what: "create an empty file", example: "touch ~/empty.txt" },
      { cmd: "mv \"$f\" \"$f.bak\"", what: "rename, quoted so spaces survive", example: "for f in ~/old/*; do echo \"$f\"; done" },
      { cmd: "$?", what: "the exit status of the last command", example: "ls /nope; echo $?" },
      { cmd: "set -eu", what: "strict mode: stop on errors and unset variables", example: "set -eu" },
      { cmd: "exit N", what: "end a script with status N", example: "sh -c 'exit 3'; echo $?" },
      { cmd: ">&2", what: "print to stderr instead of stdout", example: "echo oops >&2" },
    ],
    tasks: [
      {
        title: "Use a for loop to create five empty files, day1.txt to day5.txt, in a new folder ~/days.",
        hint: "Make the folder first. Then loop over the numbers 1 to 5 and touch one file each time round.",
        answer: "mkdir ~/days && for i in 1 2 3 4 5; do touch ~/days/day$i.txt; done",
        why: "The loop sets i to each number in turn and runs the body, so touch makes day1.txt, day2.txt and so on. `for i in $(seq 1 5)` gives the same numbers.",
        check: "for i in 1 2 3 4 5; do [ -f days/day$i.txt ] || exit 1; done; [ $(ls days | wc -l) -eq 5 ]",
      },
      {
        title: "Rename every .log file in ~/old so it ends in .log.bak instead (a.log becomes a.log.bak). Leave keep.txt alone.",
        hint: "Loop over ~/old/*.log and mv each one to its own name plus .bak. One of the names has a space in it.",
        answer: "for f in ~/old/*.log; do mv \"$f\" \"$f.bak\"; done",
        why: "The wildcard gives the loop one full path per file, space and all. Quoting `\"$f\"` hands mv that path as one argument; without the quotes, \"c d.log\" splits into c and d.log and the mv fails.",
        check:
          "[ -f old/a.log.bak ] && [ -f old/b.log.bak ] && [ -f 'old/c d.log.bak' ] && [ -f old/keep.txt ] && [ -z \"$(ls old | grep '\\.log$')\" ]",
      },
      {
        title: "Run a grep that finds nothing (search /var/log/app.log for NOTHERE), then save its exit status in ~/grep-code.txt.",
        hint: "$? holds the exit status of the command that just finished, so read it straight away.",
        answer: "grep NOTHERE /var/log/app.log; echo $? > ~/grep-code.txt",
        why: "grep exits 0 when it finds something, 1 when it finds nothing and 2 on an error. `$?` changes after every command, so it has to be read right after the grep.",
        check: "[ \"$(tr -d ' \\n' < grep-code.txt)\" = 1 ]",
      },
      {
        title:
          "Write ~/need-dir.sh. It starts with set -eu; if its first argument isn't a directory it prints an error to stderr and exits with status 3, otherwise it prints ok.",
        hint: "`[ ! -d \"$1\" ]` is true when the argument isn't a directory. Send the message with >&2, then exit 3.",
        answer:
          "printf '#!/bin/sh\\nset -eu\\nif [ ! -d \"$1\" ]; then\\n  echo \"not a directory: $1\" >&2\\n  exit 3\\nfi\\necho ok\\n' > ~/need-dir.sh",
        why: "`>&2` keeps the error off stdout, so anything capturing the script's output only gets real results. `exit 3` gives the caller a status it can test with `$?` or `if`.",
        check:
          "grep -q 'set -eu' need-dir.sh && [ \"$(sh need-dir.sh /tmp)\" = ok ] && { sh need-dir.sh /nope; [ $? -eq 3 ]; } && [ -z \"$(sh need-dir.sh /nope 2>/dev/null)\" ]",
      },
    ],
  },

  text: {
    intro:
      "~/servers.csv lists some servers (host, site, role, cpu, status), and /var/log/app.log is the web app log from the pipes lesson. Look at both first with `cat` and `head`.",
    concepts: [
      "A CSV file is a table in plain text, one row per line with commas between the columns. `cut` and `awk -F,` pick columns by number, counting from 1.",
      "Most text tools print their result and leave the file alone, so you can try things safely. `sed -i` is the exception: it edits the file in place.",
    ],
    setup:
      "printf 'host,site,role,cpu,status\\nweb01,oslo,web,34,up\\nweb02,oslo,web,91,up\\ndb01,oslo,database,67,up\\nweb03,bergen,web,12,down\\ndb02,bergen,database,88,up\\nplc-gw01,bergen,gateway,5,up\\nweb04,stavanger,web,45,maintenance\\n' > /home/learner/servers.csv && mkdir -p /home/learner/tmpfiles && cd /home/learner/tmpfiles && touch a.tmp b.tmp c.tmp keep.txt && printf '/home/learner/tmpfiles/a.tmp\\n/home/learner/tmpfiles/b.tmp\\n/home/learner/tmpfiles/c.tmp\\n' > /home/learner/cleanup-list.txt && chown -R learner:learner /home/learner/servers.csv /home/learner/tmpfiles /home/learner/cleanup-list.txt",
    commands: [
      { cmd: "grep -v", what: "print the lines that DON'T match", example: "grep -v ',up$' ~/servers.csv" },
      { cmd: "tail -n +2", what: "everything from line 2 on (skips a header)", example: "tail -n +2 ~/servers.csv" },
      { cmd: "cut -d, -f1", what: "column 1, with commas between columns", example: "cut -d, -f1,5 ~/servers.csv" },
      { cmd: "awk -F,", what: "per-line programs on columns: $2 is column 2", example: "awk -F, '$4 > 50 { print $1 }' ~/servers.csv" },
      { cmd: "sed 's/a/b/'", what: "replace text; -i changes the file itself", example: "sed 's/oslo/OSLO/' ~/servers.csv" },
      { cmd: "sort -u", what: "sort and keep one of each", example: "cut -d, -f2 ~/servers.csv | sort -u" },
      { cmd: "xargs", what: "turn input lines into arguments for a command", example: "xargs echo rm < ~/cleanup-list.txt" },
    ],
    tasks: [
      {
        title: "Write the host names of every server that isn't up (one per line, no header) into ~/not-up.txt.",
        hint: "Three steps in a pipe: drop the lines ending in ,up; skip the header line; keep the first column.",
        answer: "grep -v ',up$' ~/servers.csv | tail -n +2 | cut -d, -f1 > ~/not-up.txt",
        why: "`grep -v ',up$'` keeps lines that don't end in ,up (`$` anchors to the end of the line). The header doesn't end in ,up either, so `tail -n +2` drops it, and `cut -d, -f1` keeps the host column.",
        check: "[ \"$(cat not-up.txt)\" = \"$(printf 'web03\\nweb04')\" ]",
      },
      {
        title: "Add up the cpu column for the servers in bergen and put just the total in ~/bergen-cpu.txt.",
        hint: "awk can test one column and add up another: a pattern in front of { }, and an END block that runs after the last line.",
        answer: "awk -F, '$2 == \"bergen\" { sum += $4 } END { print sum }' ~/servers.csv > ~/bergen-cpu.txt",
        why: "`-F,` splits on commas. For each line where column 2 is bergen, awk adds column 4 to sum; END runs once at the end and prints it: 12 + 88 + 5 = 105.",
        check: "[ \"$(tr -d ' \\n' < bergen-cpu.txt)\" = 105 ]",
      },
      {
        title: "Edit ~/servers.csv in place so the status maintenance becomes down.",
        hint: "sed -i 's/old/new/' file edits the file itself instead of printing the result.",
        answer: "sed -i 's/maintenance/down/' ~/servers.csv",
        why: "`s/maintenance/down/` replaces the first match on each line, and -i writes the result back into the file. Run it without -i first to check the output.",
        check: "! grep -q maintenance servers.csv && grep -q '^web04,stavanger,web,45,down$' servers.csv && [ $(wc -l < servers.csv) -eq 8 ]",
      },
      {
        title: "How many different client IPs appear in /var/log/app.log? Put just the number in ~/ip-count.txt.",
        hint: "The IP is the 4th space-separated field. Keep one of each, then count what's left.",
        answer: "awk '{print $4}' /var/log/app.log | sort -u | wc -l > ~/ip-count.txt",
        why: "awk prints the IP column, `sort -u` collapses duplicates to one line each, and `wc -l` counts the lines left: the number of distinct IPs.",
        check: "[ \"$(tr -d ' \\n' < ip-count.txt)\" = \"$(awk '{print $4}' /var/log/app.log | sort -u | wc -l | tr -d ' ')\" ]",
      },
      {
        title: "~/cleanup-list.txt names three files to delete, one per line. Delete them with xargs (keep.txt must survive).",
        hint: "xargs reads its input and adds it to the end of a command. Try xargs echo rm first for a dry run.",
        answer: "xargs rm < ~/cleanup-list.txt",
        why: "xargs turns the three lines into arguments, so it runs `rm a.tmp b.tmp c.tmp` (with full paths). Putting echo in front shows the command without running it.",
        check: "[ ! -e tmpfiles/a.tmp ] && [ ! -e tmpfiles/b.tmp ] && [ ! -e tmpfiles/c.tmp ] && [ -f tmpfiles/keep.txt ]",
      },
    ],
  },

  disks: {
    intro:
      "/srv/data is filling up. Use `du` to see where the space went (`du -sh /srv/data/* | sort -h`), `find` to list large files, and the log to see what's been going wrong. `df -h` shows every mounted filesystem.",
    concepts: [
      "`df` reports free space per filesystem (each disk or partition, mounted somewhere in the tree), and `du` adds up what a folder's files use. df tells you a disk is full; du tells you why.",
      "In this lesson /srv/data has been handed to learner, so unlike the rest of /srv you can change files there.",
    ],
    setup:
      "mkdir -p /srv/data/reports /srv/data/images /srv/data/exports && yes 'JFIF image data' | head -c 430080 > /srv/data/images/plant-photo.jpg && yes '%PDF-1.7 report' | head -c 61440 > /srv/data/reports/q3.pdf && echo 'Q3 summary' > /srv/data/reports/summary.txt && yes 'id,line,value,2026-10-08' | head -c 153600 > /srv/data/exports/old.csv && yes 'id,line,value,2026-10-12' | head -c 20480 > /srv/data/exports/today.csv && chown -R learner:learner /srv/data",
    commands: [
      { cmd: "df -h", what: "free space on each filesystem, in K/M/G", example: "df -h" },
      { cmd: "du -sh", what: "total size of each folder given", example: "du -sh /srv/data/*" },
      { cmd: "sort -h", what: "sort sizes like 12K and 3M correctly", example: "du -sh /srv/data/* | sort -h" },
      { cmd: "find -size", what: "files bigger (+) or smaller (-) than a size", example: "find /srv/data -type f -size +50k" },
      { cmd: "ls -lh", what: "file sizes in K/M", example: "ls -lh /srv/data/exports" },
      { cmd: "gzip / gunzip", what: "compress a file to .gz, and back", example: "gzip -k /srv/data/reports/summary.txt" },
      { cmd: "grep | tail", what: "the last few matching lines", example: "grep ERROR /var/log/app.log | tail -n 3" },
    ],
    tasks: [
      {
        title: "Which folder directly inside /srv/data uses the most space? Write just its name into ~/biggest.txt.",
        hint: "du -sh /srv/data/* | sort -h lists them smallest to largest.",
        answer: "du -s /srv/data/* | sort -n | tail -n 1 | awk '{print $2}' | xargs basename > ~/biggest.txt",
        why: "`du -s` gives one total per argument and `sort -n` puts the biggest last, so tail -n 1 picks it; basename drops the /srv/data/ part. Reading the du -sh output and typing `echo images > ~/biggest.txt` is just as right.",
        check: "b=$(tr -d ' \\n' < biggest.txt); [ \"$b\" = images ] || [ \"$b\" = /srv/data/images ]",
      },
      {
        title: "List every file under /srv/data larger than 100 KB, one path per line, in ~/big-files.txt.",
        hint: "find can filter by type (-type f for files) and by size (-size +100k).",
        answer: "find /srv/data -type f -size +100k > ~/big-files.txt",
        why: "`-type f` skips folders and `-size +100k` keeps files over 100 KB. find prints one path per line, which `>` saves.",
        check:
          "l=$(sort big-files.txt) && { [ \"$l\" = \"$(printf '/srv/data/exports/old.csv\\n/srv/data/images/plant-photo.jpg')\" ] || { [ ! -e /srv/data/exports/old.csv ] && [ \"$l\" = /srv/data/images/plant-photo.jpg ]; }; }",
      },
      {
        title: "Save the last 5 ERROR lines of /var/log/app.log into ~/recent-errors.txt.",
        hint: "grep the errors, then keep only the last five.",
        answer: "grep ERROR /var/log/app.log | tail -n 5 > ~/recent-errors.txt",
        why: "grep keeps the ERROR lines in order, so the last five it prints are the most recent; `tail -n 5` keeps those.",
        check: "[ -s recent-errors.txt ] && [ \"$(cat recent-errors.txt)\" = \"$(grep ERROR /var/log/app.log | tail -n 5)\" ]",
      },
      {
        title: "Compress /srv/data/exports/old.csv with gzip to free space (it should become old.csv.gz).",
        hint: "gzip FILE replaces the file with FILE.gz. ls -lh before and after to see the difference.",
        answer: "gzip /srv/data/exports/old.csv",
        why: "Repetitive text like this CSV shrinks to a fraction of its size. gzip removes the original once the .gz is written, and `gunzip` (or `zcat` to just read it) undoes it.",
        check: "[ -f /srv/data/exports/old.csv.gz ] && [ ! -e /srv/data/exports/old.csv ]",
      },
    ],
  },
};
