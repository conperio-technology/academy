# 0007. Linux lessons run a v86 VM in the browser

Status: Accepted
Date: 2026-10-11

## Context

Linux lessons need a real shell. A server-side container per learner needs infrastructure and
isolation work; an emulator in the browser needs nothing from the server.

## Decision

Use v86, an x86 emulator in WebAssembly. `tools/linux-image/build.sh` builds a small kernel
and an initramfs with BusyBox and the lesson files into `client/public/linux/` (committed,
about 4 MB, loaded only when a Linux lesson opens). Each task's check is a shell command run
inside the VM (`client/src/linuxLessons.ts`).

## Consequences

- No server cost or isolation risk.
- Only what BusyBox offers is available. Rebuilding the image is a separate, documented step
  (`tools/linux-image/CLAUDE.md`).
