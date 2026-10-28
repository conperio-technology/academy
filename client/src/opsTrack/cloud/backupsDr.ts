import { src, type OpsLessonData } from "../types.ts";

export const backupsDr: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Disks fail, people delete the wrong folder, ransomware encrypts file shares, and whole data centers lose power. Backups, RAID and disaster recovery are three different defences against those, and confusing them is how companies lose data they thought was safe. RAID keeps a server running when a disk dies. Backups let you go back in time after data is deleted or corrupted. Disaster recovery is the plan for carrying on when a whole site or region is gone.",
        "The only backup that counts is one you have restored. This lesson covers how backups are scheduled and stored, what RPO and RTO mean, how the RAID levels trade capacity for safety, and how to test that a restore actually works.",
      ],
    },
    {
      kind: "terms",
      title: "The vocabulary",
      terms: [
        { term: "RPO (recovery point objective)", meaning: "how much data you can afford to lose, measured in time. Nightly backups mean an RPO of up to 24 hours: everything since the last backup is gone." },
        { term: "RTO (recovery time objective)", meaning: "how long you can afford to be down while you restore. Restoring 5 TB from cloud storage can take a day, so a 1 hour RTO needs a different design." },
        { term: "Full backup", meaning: "a complete copy of the data. Simple to restore, but slow to take and the biggest to store." },
        { term: "Incremental backup", meaning: "only what changed since the previous backup of any kind. Smallest and fastest each night; a restore needs the last full plus every incremental since." },
        { term: "Differential backup", meaning: "everything that changed since the last full. Grows each day; a restore needs only the last full plus the latest differential." },
        { term: "Snapshot", meaning: "a point-in-time view of a disk or volume, near instant because it only records later changes. Great for quick rollback, but it usually lives on the same storage, so it isn't a backup on its own." },
        { term: "Immutable backup", meaning: "a copy that can't be changed or deleted until a retention date, even by an administrator (object lock, WORM storage). The main defence against ransomware that hunts for backups." },
        { term: "Air gap", meaning: "a copy with no live connection to production: offline tape or disks, or a separate account nobody signs in to day to day." },
      ],
    },
    {
      kind: "text",
      title: "The 3-2-1 rule",
      paragraphs: [
        "Keep at least 3 copies of important data, on 2 different kinds of storage, with 1 copy off site. The production data counts as one copy. A common modern extension is 3-2-1-1-0: one copy offline or immutable, and 0 errors when the backups are verified.",
        "Each part stops a different failure. Several copies survive a broken backup. Different storage survives a bug or failure that hits one kind of device. An off-site copy survives fire, flood or a lost region. An immutable copy survives an attacker with admin rights, who will delete the backups before encrypting the servers.",
      ],
    },
    {
      kind: "widget",
      widget: "backupChain",
      title: "Try it: what a restore needs",
      intro: "Pick a backup scheme and the day the server dies. The highlighted backups are the ones you need, in order, to get back to the last good night.",
    },
    {
      kind: "text",
      title: "RAID: surviving a dead disk",
      paragraphs: [
        "RAID (redundant array of independent disks) spreads data over several disks so the server keeps running when one fails. RAID 0 stripes data for speed and has no redundancy at all. RAID 1 mirrors it. RAID 5 and 6 store parity, which lets the array rebuild one or two missing disks from the rest. RAID 10 mirrors pairs of disks and stripes across the pairs.",
        "RAID is about availability, not backup. If someone deletes a file, ransomware encrypts it or the application corrupts it, RAID faithfully does the same to every disk at once. You still need backups.",
      ],
    },
    {
      kind: "widget",
      widget: "raidCalc",
      title: "Try it: RAID capacity and failures",
      intro: "Choose a level, the number of disks and their size to see usable space, how many failures it survives and the write cost. Click disks to fail them and see whether the array survives.",
    },
    {
      kind: "table",
      title: "RAID levels compared",
      head: ["Level", "Minimum disks", "Usable space", "Survives", "Good for"],
      rows: [
        ["RAID 0", "2", "all of it", "nothing", "scratch space where speed matters and data can be recreated"],
        ["RAID 1", "2", "one disk", "all but one disk", "boot disks, small servers"],
        ["RAID 5", "3", "all but one disk", "1 disk", "read-heavy storage on smaller disks; risky to rebuild on large ones"],
        ["RAID 6", "4", "all but two disks", "2 disks", "large file servers and backup targets"],
        ["RAID 10", "4", "half", "1 disk, more if in different pairs", "databases and anything write-heavy"],
      ],
      notes: ["Cloud block storage (EBS, Azure managed disks) is already replicated inside the provider, so you rarely build RAID yourself in the cloud; you still take snapshots and backups."],
    },
    {
      kind: "code",
      title: "A backup with a restore test",
      blocks: [
        {
          lang: "bash",
          label: "backup.sh",
          code: src`
set -euo pipefail
mkdir -p app/data
echo "order 1042: paid" > app/data/orders.txt
echo "user 7: ada" > app/data/users.txt

# Back up, and record a checksum of the archive
tar -czf backup-2026-10-28.tar.gz app/data
sha256sum backup-2026-10-28.tar.gz > backup-2026-10-28.tar.gz.sha256

# A restore test: check the archive, restore it somewhere else, compare with the source
sha256sum -c backup-2026-10-28.tar.gz.sha256
mkdir -p restore-test
tar -xzf backup-2026-10-28.tar.gz -C restore-test
diff -r app/data restore-test/app/data && echo "restore matches the source"

# Damage one byte of the archive and check again
printf 'X' | dd of=backup-2026-10-28.tar.gz bs=1 seek=40 conv=notrunc status=none
sha256sum -c backup-2026-10-28.tar.gz.sha256 || echo "checksum mismatch: this backup can't be trusted"`,
          output: src`
backup-2026-10-28.tar.gz: OK
restore matches the source
backup-2026-10-28.tar.gz: FAILED
sha256sum: WARNING: 1 computed checksum did NOT match
checksum mismatch: this backup can't be trusted`,
        },
      ],
      notes: [
        "Real backup tools (restic, Borg, Veeam, Azure Backup, AWS Backup) do the same things at scale: they deduplicate, encrypt, keep a retention schedule and verify what they stored. A database needs its own tool (pg_dump, SQL Server BACKUP DATABASE, point-in-time recovery from the write-ahead log), because copying the files of a running database can capture them half written.",
      ],
    },
    {
      kind: "steps",
      title: "Testing restores",
      steps: [
        "Restore on a schedule, not only in an emergency: pick a random server or database each month and restore it to a separate machine.",
        "Time the restore and compare it with the RTO you promised. Downloading terabytes from cold storage is often the slowest part.",
        "Check the restored data, not just the job status: open the application, run a few queries, compare row counts or checksums.",
        "Write the steps down in a runbook as you go, including where the encryption keys and credentials for the backup system live. A backup you can't decrypt is lost.",
        "Alert on backup jobs that fail or stop running. Silence from a backup system usually means it stopped months ago.",
      ],
    },
    {
      kind: "table",
      title: "Disaster recovery strategies",
      head: ["Strategy", "What runs in the second site", "Typical RPO", "Typical RTO", "Cost"],
      rows: [
        ["Backup and restore", "nothing; backups are copied there", "hours", "hours to days", "lowest"],
        ["Pilot light", "the data (replicated database), servers off", "minutes", "tens of minutes to hours", "low"],
        ["Warm standby", "a scaled-down copy of everything, running", "seconds to minutes", "minutes", "medium"],
        ["Active-active (multi-site)", "full capacity, serving traffic", "near zero", "near zero", "highest"],
      ],
      notes: ["Pick by the RPO and RTO each system actually needs; most internal tools are fine with backup and restore, while payments may need warm standby or better. A DR plan nobody has rehearsed, with a failover exercise, usually doesn't work on the day."],
    },
  ],
  quiz: [
    {
      question: "A file server uses RAID 6. An employee deletes a shared folder by mistake. What gets it back?",
      answer: "A backup or snapshot from before the deletion",
      distractors: ["RAID 6 parity", "Rebuilding the array", "Replacing two disks"],
      why: "RAID copies every change, including deletions, to all disks immediately. It protects against disk failure, not against mistakes, corruption or ransomware.",
    },
    {
      question: "A Sunday full backup plus nightly incrementals. The server dies on Thursday. What do you restore?",
      answer: "Sunday's full, then the Monday, Tuesday and Wednesday incrementals in order",
      distractors: ["Sunday's full and Wednesday's incremental", "Only Wednesday's incremental", "Sunday's full only"],
      why: "Each incremental holds only the changes since the previous backup, so you need the whole chain. With differentials, Sunday plus Wednesday would be enough.",
    },
    {
      question: "The business says losing more than 15 minutes of orders is unacceptable. Which number is that?",
      answer: "The RPO",
      distractors: ["The RTO", "The SLA", "The retention period"],
      why: "RPO is how much data, measured in time, you may lose. RTO is how long you may be down. Nightly backups can't meet a 15 minute RPO; that needs log shipping or replication.",
    },
    {
      question: "Ransomware gets domain admin and deletes every backup it can reach. Which copy survives?",
      answer: "An immutable or offline copy",
      distractors: ["A RAID 10 mirror", "A snapshot on the same storage array", "A second copy on the same backup server"],
      why: "Anything an admin account can change, the attacker can too. Object lock, WORM storage or an air-gapped copy can't be deleted before its retention date.",
    },
    {
      question: "Eight 12 TB disks in RAID 10. How much usable space?",
      answer: "48 TB",
      distractors: ["84 TB", "72 TB", "96 TB"],
      why: "RAID 10 mirrors every disk, so half the raw 96 TB is usable. RAID 6 on the same disks would give 72 TB.",
    },
  ],
  pitfalls: [
    "Treating RAID, replication or snapshots on the same storage as backups.",
    "Never testing a restore, then discovering on the day that the backups were empty, corrupt or encrypted with a lost key.",
    "Keeping the backup server in the same domain with the same admin accounts as production, so one compromise reaches both.",
    "Backing up a running database by copying its files instead of using its backup tool.",
    "Building large RAID 5 arrays, where a long rebuild can hit a second failure and lose everything.",
  ],
  next: [
    { id: "linux-disks-logs", label: "Disks, Filesystems and Logs" },
    { id: "cloud-observability", label: "Observability: Metrics, Logs, Traces and Alerts" },
    { id: "sec-incident-response-logging", label: "Incident Response, Logging and Monitoring" },
  ],
};
