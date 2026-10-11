# Linux image for the terminal lessons

`build.sh` produces everything in `client/public/linux/`, which the Linux lessons load into the
[v86](https://github.com/copy/v86) emulator in the browser:

| file | what it is |
| --- | --- |
| `kernel.bin` | Linux 6.8 (Ubuntu's `linux-source-6.8.0`), `tinyconfig` plus `kernel.config` |
| `initrd.bin` | gzip'd initramfs: BusyBox, `init`, and `rootfs-overlay/` |
| `v86.wasm` | the emulator core, from the `v86` npm package (must match the client's version) |
| `seabios.bin`, `vgabios.bin` | BIOS images, from the `v86-system` npm package |

Run it on an Ubuntu machine (or container) with the kernel build tools installed:

```sh
sudo apt-get install build-essential flex bison bc libelf-dev cpio linux-source-6.8.0
WORK=/tmp/academy-linux-build sh tools/linux-image/build.sh
```

Then commit the changed files in `client/public/linux/`. Rebuilding is only needed when
something in this folder changes; the kernel step is incremental after the first run.

## How the VM is laid out

- `init` mounts the usual filesystems, installs BusyBox's command links, generates
  `/var/log/app.log` (`gen-log.sh`), then starts two shells:
  - **ttyS0**: a login shell for `learner`, restarted if it exits. This is the terminal the
    learner sees.
  - **ttyS1**: a root shell with echo and prompts off. The page writes a command plus an end
    marker to it and reads back the exit code; that's how lesson setup and task checks run.
- `rootfs-overlay/` is copied over the root filesystem: users and groups, the shell profile, and
  the files the lessons use. Lesson tasks and checks live in `client/src/linuxLessons.ts`; if a
  task needs a new file, add it here and rebuild.

## Licences

The image redistributes third-party software, and the public site serves it:

- Linux kernel: GPL-2.0. Built from Ubuntu's `linux-source-6.8.0` 6.8.0-146.146 (upstream
  6.8.12); configuration in `kernel.config`, and the complete resulting `.config` in
  `kernel-full.config`.
- BusyBox: GPL-2.0. Binary from Ubuntu's `busybox-static` 1:1.36.1-6ubuntu3.1 (i386), checked
  against `busybox.sha256`; source is Ubuntu's `busybox` source package of the same version,
  and `busybox-static.config` is a copy of the configuration Ubuntu builds it with.
- SeaBIOS / VGA BIOS: LGPL-3.0, rel-1.16.2 as built by v86, via the `v86-system` npm package.
- v86: BSD-2-Clause.

Exact versions, checksums and source links are in
[THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md). When you rebuild with a different
kernel or BusyBox version, update it, `kernel-full.config` (the `.config` left in
`$WORK/linux`) and `busybox-static.config` in the same commit.
