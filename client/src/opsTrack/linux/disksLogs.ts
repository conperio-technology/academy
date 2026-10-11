import { src, type OpsLessonData } from "../types.ts";

export const disksLogs: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "\"Disk full\" is one of the most common reasons a healthy server suddenly stops working: databases refuse writes, logs stop, deploys fail halfway. This lesson covers how Linux organises storage, how to find what's using the space, and how logs, the usual culprit, are kept under control.",
        "Linux has one tree of folders starting at `/`. A disk (or a partition, a slice of a disk) holds a filesystem, a structure for storing files such as ext4 or XFS, and gets mounted, attached, at some folder in that tree. `/` might be one disk and `/var/lib/postgresql` a second, bigger one, and nothing in the path tells you which; `df` and `findmnt` do.",
      ],
    },
    {
      kind: "table",
      title: "The commands",
      head: ["Command", "Answers"],
      rows: [
        ["`df -h`", "how full is each mounted filesystem? (`-h` human-readable sizes, `-T` adds the type)"],
        ["`df -i`", "how many inodes are used? A filesystem can be \"full\" with free space left (see below)"],
        ["`du -sh /var/*`", "how big is each folder? (`-s` one total per argument)"],
        ["`du -h --max-depth=1 /var | sort -h`", "the same, one level deep, smallest first"],
        ["`find / -xdev -type f -size +500M`", "big files; `-xdev` stays on one filesystem"],
        ["`lsblk`", "disks and partitions as a tree, and where they're mounted"],
        ["`findmnt`", "what's mounted where, with options (read-only, noexec and so on)"],
        ["`lsof +L1`", "files that are deleted but still held open, still using space"],
        ["`ncdu /`", "an interactive du, if installed; the quickest way to explore"],
      ],
    },
    {
      kind: "widget",
      widget: "diskFull",
      title: "Try it: the disk is full",
      intro: "A realistic incident on a made-up server. Follow the space down with du, then decide how to free it.",
    },
    {
      kind: "code",
      title: "Real output: du, find and a deleted file that still takes space",
      blocks: [
        {
          lang: "bash",
          label: "in a folder called var",
          code: src`
du -sh * | sort -h
find . -type f -size +20M -exec ls -lh {} + | awk '{print $5, $9}'
`,
          output: src`
16M	cache
54M	log
121M	lib
120M ./lib/docker/layer.tar
42M ./log/app/app.log.1
`,
        },
        {
          lang: "bash",
          label: "a process holds app.log open; then someone deletes it",
          code: src`
rm /var/tmp/iodemo/app.log
lsof +L1
`,
          output: src`
COMMAND    PID     USER   FD   TYPE DEVICE    SIZE/OFF NLINK    NODE NAME
python3   8662     root    3r   REG  254,0    52428800     0  802825 /var/tmp/iodemo/app.log (deleted)
`,
        },
      ],
      notes: [
        "du rounds up and counts the disk blocks a file really occupies, so its numbers are a little higher than the bytes inside (3 MB of log shows as 3.1M).",
        "A filename is just a link to the file's data. `rm` removes the link; the data is freed only when no name and no open file handle point to it any more. NLINK 0 above means no names are left, but process 8662 still has it open, so all 50 MB are still in use. Restarting (or signalling) the process frees it; emptying the file in place with `truncate -s 0 file` frees it immediately.",
      ],
    },
    {
      kind: "code",
      title: "Inodes: full with space to spare",
      blocks: [
        {
          lang: "bash",
          code: "df -i /",
          output: src`
Filesystem       Inodes  IUsed    IFree IUse% Mounted on
/dev/vda       16777216 250873 16526343    2% /
`,
        },
      ],
      notes: [
        "Every file and folder uses one inode, the record holding its owner, permissions, size and where its data lives (everything except its name). ext4 creates a fixed number when the filesystem is made. Millions of tiny files (a runaway cache, mail queue or session folder) can use them all up while `df -h` still shows free space, and you'll get \"No space left on device\". `df -i` shows it; `find /path -xdev -type f | cut -d/ -f2-3 | sort | uniq -c | sort -n` finds where they are.",
      ],
    },
    {
      kind: "code",
      title: "Mounting a disk, and keeping it mounted",
      blocks: [
        {
          lang: "bash",
          code: src`
lsblk                                   # find the new disk, say /dev/sdb
sudo mkfs.ext4 /dev/sdb                 # create a filesystem (erases the disk)
sudo mkdir -p /data
sudo mount /dev/sdb /data               # attach it now
sudo blkid /dev/sdb                     # its UUID, for /etc/fstab
`,
        },
        {
          lang: "text",
          label: "/etc/fstab",
          code: src`
# <device>                                 <mount point> <type> <options>        <dump> <fsck>
UUID=3f1c2b9e-7a4d-4e61-9b1a-2c8f6d0e5a17  /data          ext4   defaults,nofail  0      2
`,
        },
      ],
      notes: [
        "`mount` lasts until the next reboot. `/etc/fstab` lists what to mount at boot. Refer to disks by UUID (a unique ID stored in the filesystem), not `/dev/sdb`, because device names can change between boots. `nofail` lets the machine boot even if that disk is missing.",
        "Test a new fstab line with `sudo mount -a` before rebooting: a typo there can leave a server stuck at boot waiting for a disk.",
        "Cloud VMs work the same way: an attached volume (an EBS volume on AWS, a managed disk on Azure) appears as a new block device you format and mount. Growing one is resize the volume, then `growpart` and `resize2fs` (ext4) or `xfs_growfs` (XFS).",
      ],
    },
    {
      kind: "text",
      title: "Where the logs are",
      paragraphs: [
        "`/var/log` holds the text logs: `syslog` (Ubuntu) or `messages` (RHEL) for general system messages, `auth.log` or `secure` for logins and sudo, `kern.log`, `dpkg.log` or `dnf.log` for package changes, and a folder per application (`nginx/`, `postgresql/`). Logs from systemd services are in the journal, read with `journalctl` (see the systemd lesson); Ubuntu keeps both.",
        "For reading: `tail -n 100 file` for the end, `tail -f file` to follow it live, `less +F file` to follow and then scroll back (Ctrl+C, then F to follow again), and `zgrep pattern file.gz` to search rotated, compressed logs without unpacking them.",
      ],
    },
    {
      kind: "code",
      title: "logrotate: keep logs from filling the disk",
      blocks: [
        {
          lang: "text",
          label: "/etc/logrotate.d/academy",
          code: src`
/var/log/academy/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
`,
        },
        {
          lang: "bash",
          code: src`
sudo logrotate -d /etc/logrotate.d/academy    # dry run: say what it would do
sudo logrotate -f /etc/logrotate.d/academy    # force a rotation now
`,
        },
      ],
      notes: [
        "logrotate runs once a day (from a systemd timer on Ubuntu 24.04, cron on older systems). For each matching log it renames `api.log` to `api.log.1`, shifts older ones along (`.2`, `.3`), deletes anything beyond `rotate 7`, and gzips old ones. `delaycompress` leaves the newest rotated file uncompressed for one more round, in case something is still writing to it.",
        "The app has to start writing to a fresh file afterwards. Either the config tells it to (a `postrotate` script that reloads the service, the usual way for nginx), or `copytruncate` copies the log and empties the original in place, which needs no cooperation but can lose a few lines written during the copy. Forcing a rotation of this config on a 2 MB log left an empty `app.log` and the old contents in `app.log.1`, uncompressed because of `delaycompress`.",
      ],
    },
    {
      kind: "lab",
      title: "Hands-on: find what's using the space",
      lesson: "disks",
    },
  ],
  quiz: [
    {
      question: "df -h shows / at 100%. You delete a 9 GB log file, but df still shows 100%. Why?",
      answer: "A running process still has the file open, so its space isn't freed until the process closes it",
      distractors: ["df caches its results for an hour", "Deleted files go to a trash folder first", "You need to run sync"],
      why: "rm only removes the name. lsof +L1 shows deleted-but-open files; restart the process, or next time truncate the file instead of deleting it.",
    },
    {
      question: "Writes fail with \"No space left on device\", yet df -h shows 40% used. What should you check next?",
      answer: "df -i, because the filesystem may have run out of inodes",
      distractors: ["free -h, because memory is full", "lsblk, because the disk was unplugged", "Nothing: df -h is always right"],
      why: "Each file needs an inode, and their number is fixed when the filesystem is made. Huge numbers of tiny files exhaust them while space remains.",
    },
    {
      question: "Why is du -sh /var/* | sort -h a better first step than find / -size +1G?",
      answer: "It shows where the space is going folder by folder, including thousands of small files no size filter would catch",
      distractors: ["find can't search /var", "du is the only command that works as root", "sort -h makes du faster"],
      why: "The space is often in many medium files (a cache, old releases, Docker layers) rather than one giant file. Drill down with du, then use find inside the folder you've identified.",
    },
    {
      question: "Which /etc/fstab line keeps a server bootable if the data disk is ever missing?",
      answer: "UUID=... /data ext4 defaults,nofail 0 2",
      distractors: ["/dev/sdb /data ext4 defaults 0 2", "UUID=... /data ext4 noauto,ro 0 0", "UUID=... / ext4 defaults 0 1"],
      why: "nofail tells the boot to carry on without it. Using the UUID instead of /dev/sdb also protects against device names changing between boots.",
    },
    {
      question: "An app writes to /var/log/academy/api.log and can't be told to reopen its log. Which logrotate option suits it?",
      answer: "copytruncate",
      distractors: ["create 0640 academy academy", "delaycompress", "rotate 0"],
      why: "Normally logrotate moves the file and the app must reopen a new one. copytruncate copies the contents and empties the original in place, so the app keeps writing to the same open file.",
    },
  ],
  pitfalls: [
    "Deleting a log that's still open frees nothing. Truncate it (`truncate -s 0 file`) or restart the service that holds it.",
    "Running `du` on `/` without `-x` (`--one-file-system`) wanders into `/proc` and network mounts; slow, and full of errors.",
    "Typos in `/etc/fstab` can stop a machine booting. Always run `sudo mount -a` to test, and use `nofail` for non-essential disks.",
    "Monitoring only `df -h`. Alert on inodes and on growth rate too: a disk at 70% that grew 20% today matters more than one steady at 85%.",
  ],
  next: [
    { id: "linux-systemd", label: "systemd Services and journalctl" },
    { id: "cloud-observability", label: "Observability: Logs, Metrics and Traces" },
  ],
};
