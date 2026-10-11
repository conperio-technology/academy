# tools/linux-image/ (in-browser Linux VM image)

`build.sh` builds what the Linux lessons boot in the v86 emulator and writes it to
`client/public/linux/` (kernel.bin, initrd.bin, v86.wasm, BIOS images). README.md here has the
full layout and licences.

- Rebuilding needs an Ubuntu machine with kernel build tools (`apt-get install` list in the
  README) and is only needed when something in this folder changes. Don't run it as part of
  routine work; it is slow and the outputs are committed.
- `v86.wasm` must match the `v86` version in `client/package.json`; bump both together.
- `init` starts a learner shell on ttyS0 and a hidden root shell on ttyS1 that the page uses
  for lesson setup and task checks. Lesson tasks live in `client/src/linuxLessons.ts`.
- A task that needs a new file in the VM: add it under `rootfs-overlay/`, rebuild, commit the
  changed `client/public/linux/` files together with the lesson change.
- `busybox.sha256` pins the BusyBox binary; update it only when deliberately changing version.
- Changing the kernel, BusyBox, v86 or BIOS version: update the versions, checksums and
  source links in the root `THIRD_PARTY_NOTICES.md` (the public site serves it), plus
  `kernel-full.config` / `busybox-static.config`, in the same commit.
