# Third-party notices

Conperio Academy ships, or loads at runtime, the third-party software listed here. Each part
keeps its own licence. This file is in the repository root and is also served with the app as
`THIRD_PARTY_NOTICES.txt` (linked from the sidebar and from the Linux lab).

The Conperio name, `client/public/conperio-logo.png` and `client/public/favicon.ico` are
Conperio's own marks and are not covered by any licence below.

## 1. Linux lab (GPL and LGPL parts)

The Linux lessons boot a small Linux in the browser. The files are committed in
`client/public/linux/` and served from `linux/` on the site. `tools/linux-image/build.sh`
builds them; `tools/linux-image/README.md` explains the layout.

| File | What it is | Licence |
| --- | --- | --- |
| `kernel.bin` | Linux kernel 6.8.12, Ubuntu 6.8.0-146.146, i386 | GPL-2.0 (with the Linux syscall note) |
| `initrd.bin` | initramfs holding BusyBox 1.36.1 (Ubuntu 1:1.36.1-6ubuntu3.1, i386) plus our own files | BusyBox: GPL-2.0 |
| `seabios.bin`, `vgabios.bin` | SeaBIOS and SeaVGABIOS rel-1.16.2, as built by the v86 project | LGPL-3.0 |
| `v86.wasm` | the v86 emulator core, v86 0.5.470 (commit `6db8b15`) | BSD-2-Clause, see section 2 |

SHA-256 of the files as committed:

```
925b49fec892b9fabadca4edbfb4039b2066f9eba08179553342f79f2c4ed060  kernel.bin
99f0decf3da807846aafba3bd28f5e63d08526b75ade3de4c96115639e1a37a0  initrd.bin
73e3f359102e3a9982c35fce98eb7cd08f18303ac7f1ba6ebfbe6cdc1c244d98  seabios.bin
a4bc0d80cc3ca028c73dafa8fee396b8d054ce87ebd8abfbd31b06b437607880  vgabios.bin
```

### Linux kernel

- Version: upstream 6.8.12 as patched by Ubuntu, from the binary package
  `linux-source-6.8.0` version `6.8.0-146.146` (Ubuntu 24.04 "noble"), which is built from the
  Ubuntu source package `linux` version `6.8.0-146.146`.
- Build: `make ARCH=i386 tinyconfig`, then `tools/linux-image/kernel.config` merged in with
  `scripts/kconfig/merge_config.sh`, then `make ARCH=i386 olddefconfig` and
  `make ARCH=i386 bzImage` (see `tools/linux-image/build.sh`). Compiler: gcc 13.3.0
  (Ubuntu 13.3.0-6ubuntu2~24.04.1). The complete resulting `.config` is
  `tools/linux-image/kernel-full.config`. No other changes were made to the source.
- Corresponding source (Ubuntu archive):
  - http://archive.ubuntu.com/ubuntu/pool/main/l/linux/linux_6.8.0-146.146.dsc
  - http://archive.ubuntu.com/ubuntu/pool/main/l/linux/linux_6.8.0.orig.tar.gz
  - http://archive.ubuntu.com/ubuntu/pool/main/l/linux/linux_6.8.0-146.146.diff.gz
  - or the tarball actually used, inside
    http://archive.ubuntu.com/ubuntu/pool/main/l/linux/linux-source-6.8.0_6.8.0-146.146_all.deb
    (`/usr/src/linux-source-6.8.0/linux-source-6.8.0.tar.bz2`)
  - Launchpad page: https://launchpad.net/ubuntu/+source/linux/6.8.0-146.146
- Licence text: `COPYING` and `LICENSES/` in the source; also
  https://www.gnu.org/licenses/old-licenses/gpl-2.0.html

### BusyBox

- Version: BusyBox 1.36.1, the unmodified `/usr/bin/busybox` binary from Ubuntu's
  `busybox-static` package version `1:1.36.1-6ubuntu3.1` (i386):
  http://archive.ubuntu.com/ubuntu/pool/main/b/busybox/busybox-static_1.36.1-6ubuntu3.1_i386.deb
  (its SHA-256 is pinned in `tools/linux-image/busybox.sha256`).
- Build configuration: Ubuntu builds this binary with `debian/config/pkg/static` from the
  source package; a copy is in `tools/linux-image/busybox-static.config`.
- Corresponding source (Ubuntu archive):
  - http://archive.ubuntu.com/ubuntu/pool/main/b/busybox/busybox_1.36.1-6ubuntu3.1.dsc
  - http://archive.ubuntu.com/ubuntu/pool/main/b/busybox/busybox_1.36.1.orig.tar.bz2
  - http://archive.ubuntu.com/ubuntu/pool/main/b/busybox/busybox_1.36.1-6ubuntu3.1.debian.tar.xz
  - Launchpad page: https://launchpad.net/ubuntu/+source/busybox/1:1.36.1-6ubuntu3.1
- Licence text: `LICENSE` in the source; also
  https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
- The rest of `initrd.bin` (`init`, `gen-log.sh` output and `rootfs-overlay/`) is this
  project's own work, in `tools/linux-image/`.

### SeaBIOS and SeaVGABIOS

- Version: SeaBIOS `rel-1.16.2`, built by the v86 project with its `bios/seabios.config`
  using `bios/fetch-and-build-seabios.sh`. The two files are byte for byte the ones in the
  `bios/` folder of https://github.com/copy/v86 at commit `6db8b15` (the commit of v86
  0.5.470), and the ones in the npm package `v86-system` 0.5.0, which `build.sh` copies them
  from.
- Source: https://www.seabios.org/ (git: https://git.seabios.org/seabios.git, tag
  `rel-1.16.2`; mirror https://github.com/coreboot/seabios). Build configuration:
  https://github.com/copy/v86/tree/6db8b15/bios
- Licence: GNU LGPL version 3 (`COPYING.LESSER` in the source);
  https://www.gnu.org/licenses/lgpl-3.0.html

## 2. Bundled in the app's JavaScript

These npm packages are compiled into the files under `assets/` by Vite. Versions are from
`client/package-lock.json`.

| Package | Version | Licence | Copyright |
| --- | --- | --- | --- |
| react, react-dom | 19.3.0 | MIT | Meta Platforms, Inc. and affiliates |
| scheduler | 0.28.0 | MIT | Meta Platforms, Inc. and affiliates |
| @monaco-editor/react | 4.7.0 | MIT | 2018 Suren Atoyan |
| @monaco-editor/loader | 1.7.0 | MIT | 2021 Suren Atoyan |
| state-local | 1.0.7 | MIT | 2020 Suren Atoyan |
| @xterm/xterm | 5.5.0 | MIT | 2017-2019 The xterm.js authors; 2014-2016 SourceLair Private Company; 2012-2013 Christopher Jeffrey |
| v86 (`libv86.mjs` and `v86.wasm`) | 0.5.470 | BSD-2-Clause | 2012 The v86 contributors |

`v86.wasm` also contains Berkeley SoftFloat 3 (BSD-3-Clause, The Regents of the University
of California) and the zstd decoder (BSD-3-Clause, Yann Collet and Facebook, Inc.), as listed
in v86's `Readme.md`. Source: https://github.com/copy/v86 (commit `6db8b15`).

## 3. In-browser C# runtime

`wasm-csharp/build.sh` publishes the .NET WebAssembly runtime and Roslyn into
`client/public/csharp-wasm/` (not committed), and the site serves them from `csharp-wasm/`.

| Component | Version | Licence | Source |
| --- | --- | --- | --- |
| .NET runtime for WebAssembly (`Microsoft.NETCore.App.Runtime.Mono.browser-wasm`, the `System.*.wasm` and `dotnet.*` files) | 10.0.12 | MIT, .NET Foundation and Contributors | https://github.com/dotnet/runtime (tag `v10.0.12`) |
| Roslyn (`Microsoft.CodeAnalysis`, `Microsoft.CodeAnalysis.CSharp`) | 5.9.0 | MIT, Microsoft Corporation | https://github.com/dotnet/roslyn |

The runtime version follows the .NET SDK that runs `build.sh`; 10.0.12 is what the current
build and the live site use. The runtime includes third-party code (for example zlib-ng
and musl) listed in its own notices file, which `build.sh` copies next
to it as `csharp-wasm/dotnet-THIRD-PARTY-NOTICES.TXT`, together with its licence as
`csharp-wasm/dotnet-LICENSE.TXT`. Roslyn's notices: `ThirdPartyNotices.rtf` in its NuGet
packages.

## 4. Loaded from a CDN at runtime (not shipped by us)

The browser downloads these from jsDelivr when a lesson needs them; they are not part of
the repository or the site's files.

| Library | Version | Licence | Used for |
| --- | --- | --- | --- |
| Monaco Editor (`monaco-editor`) | 0.55.1 (the default of @monaco-editor/loader 1.7.0) | MIT | the code editor |
| Pyodide (`pyodide`) | 0.29.5 | MPL-2.0 (bundled CPython and packages under their own licences) | grading Python |
| sql.js (`sql.js`) | 1.14.2 | MIT (SQLite is public domain) | the SQL lessons |

## 5. Server mode only

The ASP.NET Core server and the C# runner (not part of the static site) use .NET 10,
ASP.NET Core and Entity Framework Core 10.0.12 with SQLite, and Roslyn scripting 5.9.0, all
MIT, restored from NuGet at build time. The container image built from `Dockerfile` also
contains the Microsoft .NET base images and their licences.

## Licence texts

MIT licence (as used by the MIT packages above, with their copyright lines):

```
Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
```

v86 (BSD-2-Clause):

```
Copyright (c) 2012, The v86 contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are
permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of
   conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of
   conditions and the following disclaimer in the documentation and/or other materials
   provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

GPL-2.0: https://www.gnu.org/licenses/old-licenses/gpl-2.0.html.
LGPL-3.0: https://www.gnu.org/licenses/lgpl-3.0.html (it adds to the GPL-3.0,
https://www.gnu.org/licenses/gpl-3.0.html).
