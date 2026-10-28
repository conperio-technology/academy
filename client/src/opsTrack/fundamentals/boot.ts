import { src, type OpsLessonData } from "../types.ts";

export const bootProcess: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Between pressing the power button and seeing a login screen, a computer hands control along a chain of programs, each loading the next: firmware, a bootloader, the kernel, and the first user-space process. When a machine won't start, knowing that chain tells you which link broke, from \"no bootable device\" to a kernel panic to a service that hangs the boot.",
        "The chain is also a security boundary. Malware that gets into the early stages runs before the operating system and its defences, which is why Secure Boot checks a signature at each step.",
      ],
    },
    {
      kind: "walkthrough",
      title: "From power button to login",
      intro: "Step through a typical boot of a modern PC or server with UEFI firmware and Linux, with the Windows equivalents noted.",
      steps: [
        {
          title: "1. Power on and firmware",
          body: "The power supply settles and the CPU starts executing firmware from a flash chip on the motherboard: UEFI on anything modern, BIOS on old machines. Nothing from the disk has run yet. Firmware settings (boot order, virtualization support, Secure Boot) live here.",
        },
        {
          title: "2. POST",
          body: "The power-on self-test checks and initializes the CPU, memory and essential devices. Failures here are reported by beep codes or a diagnostic LED, because there may be no working display yet. A machine that powers on and shows nothing at all usually fails at this step: memory, CPU or board.",
        },
        {
          title: "3. Finding a bootloader",
          body: "UEFI reads its boot entries (stored in NVRAM) and looks on the EFI System Partition, a small FAT32 partition, for the bootloader file, such as \\EFI\\ubuntu\\shimx64.efi or \\EFI\\Microsoft\\Boot\\bootmgfw.efi. Old BIOS instead ran the 446 bytes of code in the disk's first sector (the MBR). No matching entry gives \"no bootable device\".",
        },
        {
          title: "4. Secure Boot",
          body: "With Secure Boot on, the firmware runs the bootloader only if it is signed by a key in its database (Microsoft's keys on most PCs). On Linux, a small Microsoft-signed shim then checks GRUB's signature, and GRUB checks the kernel's, so each stage verifies the next.",
        },
        {
          title: "5. Bootloader",
          body: "GRUB (Linux) or Windows Boot Manager shows the boot menu if there is one, then loads the kernel and an initial RAM disk into memory and passes the kernel its command line: which disk holds the root filesystem, and options such as quiet or single-user mode.",
          code: "linux /boot/vmlinuz-6.8.0-45-generic root=UUID=3f1c... ro quiet splash\ninitrd /boot/initrd.img-6.8.0-45-generic",
          lang: "text",
        },
        {
          title: "6. Kernel and initramfs",
          body: "The kernel decompresses itself, initializes memory management, the scheduler and the drivers built into it. It can't yet read the real root disk if that needs a module, an encrypted volume or LVM, so it first mounts the initramfs, a tiny filesystem in memory with just enough drivers and tools to find, unlock and mount the real root. A failure here drops you to an initramfs shell or ends in a kernel panic.",
        },
        {
          title: "7. init: process 1",
          body: "The kernel starts the first user-space program, PID 1, which on almost every current distribution is systemd. It mounts the remaining filesystems from /etc/fstab and starts services in dependency order towards the default target (multi-user.target for servers, graphical.target for desktops). On Windows, the kernel starts the Session Manager, then services and Winlogon.",
        },
        {
          title: "8. Login",
          body: "A login prompt, SSH daemon or desktop login manager appears. The machine is up; anything that fails from here is a service problem, investigated with systemctl and journalctl.",
        },
      ],
    },
    {
      kind: "table",
      title: "BIOS and MBR versus UEFI and GPT",
      head: ["", "Legacy BIOS with MBR", "UEFI with GPT"],
      rows: [
        ["Era", "1980s", "the norm since about 2012; Windows 11 requires UEFI"],
        ["Boot code", "446 bytes in the disk's first sector, chaining to more code", "a normal .efi program on the EFI System Partition"],
        ["Partition table", "MBR: up to 4 primary partitions, disks up to 2 TiB", "GPT: 128 partitions by default, disks far beyond 2 TiB, a backup copy at the end of the disk"],
        ["Secure Boot", "no", "yes"],
        ["Boot entries", "boot order of whole disks", "named entries in NVRAM, editable with efibootmgr or bcdedit"],
      ],
    },
    {
      kind: "code",
      title: "Looking at the boot from a running Linux system",
      blocks: [
        {
          lang: "bash",
          code: src`
[ -d /sys/firmware/efi ] && echo "booted with UEFI" || echo "booted with legacy BIOS"
cat /proc/cmdline                   # the command line the bootloader gave the kernel
systemd-analyze                     # time spent in firmware, loader, kernel, initrd and user space
systemd-analyze blame | head -5     # the slowest units
systemctl get-default               # the target systemd boots towards
journalctl -b -1 -p err             # errors from the previous boot`,
        },
      ],
      notes: ["These commands describe the machine you run them on, so no output is shown here; try them on a Linux VM. `mokutil --sb-state` reports whether Secure Boot is on."],
    },
    {
      kind: "table",
      title: "Where a boot failure comes from",
      head: ["Symptom", "Stage", "First things to check"],
      rows: [
        ["No display, beeps or a lit diagnostic LED", "POST", "memory seated, power, recent hardware changes"],
        ["\"No bootable device\" or straight into firmware setup", "finding a bootloader", "boot order, the disk is detected, the EFI partition and boot entries"],
        ["\"Secure Boot violation\"", "Secure Boot", "an unsigned or tampered bootloader or driver; a third-party module needing its key enrolled"],
        ["GRUB rescue prompt", "bootloader", "GRUB can't find its files: changed disk or partition, damaged /boot"],
        ["Dropped to an initramfs or emergency shell", "kernel and initramfs", "the root= disk is missing or renamed, an fstab entry fails, a missing storage driver"],
        ["Kernel panic", "kernel", "a bad update (boot the previous kernel from the GRUB menu), hardware faults"],
        ["Boot hangs at a service", "systemd", "a unit waiting on a network mount or a device; journalctl -b"],
      ],
    },
  ],
  quiz: [
    {
      question: "A server shows \"No bootable device\" after a disk was replaced. Which stage failed?",
      answer: "The firmware couldn't find a bootloader on any disk in its boot order",
      distractors: ["POST", "The kernel", "systemd"],
      why: "POST passed (the firmware is running and printing a message). It then found no boot entry or EFI System Partition it could start.",
    },
    {
      question: "What is the initramfs for?",
      answer: "A small in-memory filesystem with the drivers and tools needed to mount the real root filesystem",
      distractors: ["Storing the firmware settings", "Holding the boot menu", "Swap space during boot"],
      why: "The kernel may need a module, LVM or an encryption key prompt to reach the root disk, and those live in the initramfs.",
    },
    {
      question: "What does Secure Boot check?",
      answer: "That each boot stage is signed by a trusted key before it runs",
      distractors: ["That the disk is encrypted", "That the user's password is strong", "That the firmware is the latest version"],
      why: "It stops bootkits: code that runs before the OS and its security tools. It doesn't encrypt anything; that is BitLocker or LUKS.",
    },
    {
      question: "What is PID 1 on a modern Linux distribution?",
      answer: "systemd, which starts the rest of user space",
      distractors: ["The kernel", "GRUB", "The login shell"],
      why: "The kernel starts exactly one user-space process; everything else descends from it. If PID 1 dies, the kernel panics.",
    },
  ],
  pitfalls: [
    "Deleting or reformatting the EFI System Partition because it looks like a small unused partition.",
    "Removing old kernels before confirming the new one boots; keep at least one known-good kernel in the GRUB menu.",
    "Adding a network share to /etc/fstab without nofail, so the server hangs at boot when the share is down.",
    "Turning Secure Boot off to get a driver working and never turning it back on.",
  ],
  next: [
    { id: "linux-systemd", label: "systemd Services and journalctl" },
    { id: "kernel-mode-syscalls", label: "User Mode, Kernel Mode, System Calls and Interrupts" },
    { id: "running-a-program", label: "What Happens When You Run a Program" },
  ],
};
