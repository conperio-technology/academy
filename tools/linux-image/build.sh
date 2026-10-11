#!/bin/sh
# Builds the tiny Linux the Linux lessons boot in the browser (via v86), and copies the
# emulator files next to it. Output: client/public/linux/. Re-run after changing
# kernel.config, init, rootfs-overlay/ or gen-log.sh. See README.md.
#
# Needs (Ubuntu): build-essential flex bison bc libelf-dev cpio, and network access to
# archive.ubuntu.com and the npm registry.
set -eu

HERE=$(cd "$(dirname "$0")" && pwd)
OUT="$HERE/../../client/public/linux"
WORK=${WORK:-/tmp/academy-linux-build}
KERNEL_SRC_PKG=linux-source-6.8.0
BUSYBOX_DEB_URL=http://archive.ubuntu.com/ubuntu/pool/main/b/busybox/busybox-static_1.36.1-6ubuntu3.1_i386.deb
BUSYBOX_DEB_SHA256=$(cat "$HERE/busybox.sha256")
V86_VERSION=0.5.470          # emulator + wasm (BSD-2-Clause)
V86_SYSTEM_VERSION=0.5.0     # only for SeaBIOS / VGA BIOS binaries (LGPL-3.0)

mkdir -p "$WORK" "$OUT"
cd "$WORK"

# ---- Kernel ------------------------------------------------------------------------------
if [ ! -d "$WORK/linux" ]; then
  apt-get install -y "$KERNEL_SRC_PKG"
  mkdir linux
  tar xjf /usr/src/$KERNEL_SRC_PKG/$KERNEL_SRC_PKG.tar.bz2 -C linux --strip-components=1
fi
cd "$WORK/linux"
make ARCH=i386 tinyconfig >/dev/null
./scripts/kconfig/merge_config.sh -m .config "$HERE/kernel.config" >/dev/null
make ARCH=i386 olddefconfig >/dev/null
make ARCH=i386 -j"$(nproc)" bzImage
cp arch/x86/boot/bzImage "$OUT/kernel.bin"
cd "$WORK"

# ---- Root filesystem (BusyBox + our files), packed as a gzip'd initramfs ------------------
curl -sSfo busybox.deb "$BUSYBOX_DEB_URL"
echo "$BUSYBOX_DEB_SHA256  busybox.deb" | sha256sum -c -
rm -rf bb rootfs && dpkg-deb -x busybox.deb bb
mkdir -p rootfs/bin rootfs/sbin rootfs/usr/bin rootfs/usr/sbin rootfs/proc rootfs/sys rootfs/dev \
  rootfs/tmp rootfs/root rootfs/var/log
cp bb/usr/bin/busybox rootfs/bin/busybox
ln -s busybox rootfs/bin/sh
cp "$HERE/init" rootfs/init
cp -a "$HERE/rootfs-overlay/." rootfs/
sh "$HERE/gen-log.sh" > rootfs/var/log/app.log
mknod -m 600 rootfs/dev/console c 5 1
mknod -m 666 rootfs/dev/null c 1 3
chown -R 1000:1000 rootfs/home/learner
chmod 644 rootfs/home/learner/projects/website/*
chmod 755 rootfs/usr/local/bin/*
chmod 700 rootfs/root
chmod 640 rootfs/etc/shadow
(cd rootfs && find . | cpio -o -H newc --quiet | gzip -9) > "$OUT/initrd.bin"

# ---- Emulator: v86 + BIOS images ----------------------------------------------------------
npm pack "v86@$V86_VERSION" "v86-system@$V86_SYSTEM_VERSION" --silent >/dev/null
rm -rf package && tar xzf "v86-$V86_VERSION.tgz" && cp package/build/v86.wasm "$OUT/"
rm -rf package && tar xzf "v86-system-$V86_SYSTEM_VERSION.tgz" && cp package/assets/seabios.bin package/assets/vgabios.bin "$OUT/"
rm -rf package

ls -la "$OUT"
