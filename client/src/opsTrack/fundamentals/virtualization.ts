import { src, type OpsLessonData } from "../types.ts";

export const virtualization: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Virtualization runs several separate computers on one physical machine. Each virtual machine (VM) believes it has its own CPU, memory, disk and network card, and runs its own operating system. A hypervisor shares out the real hardware and keeps the VMs apart. Almost every server you'll touch, from a company's VMware cluster to an EC2 instance or an Azure VM, is a virtual machine.",
        "Containers solve a similar problem a different way: they share one kernel and isolate only processes. Knowing which is which explains why a container starts in milliseconds and a VM in tens of seconds, why containers are a weaker security boundary, and why your cloud bill counts vCPUs.",
      ],
    },
    {
      kind: "terms",
      title: "The vocabulary",
      terms: [
        { term: "Host and guest", meaning: "the host is the physical machine (or the OS running the hypervisor); each guest is a VM running on it." },
        { term: "Hypervisor (VMM)", meaning: "the software that creates and runs VMs, giving each a slice of CPU, memory and devices and stopping them touching each other." },
        { term: "Type 1 (bare metal) hypervisor", meaning: "runs directly on the hardware with no general-purpose OS underneath: VMware ESXi, Microsoft Hyper-V, Xen, and KVM (built into the Linux kernel). Used in data centers and every cloud." },
        { term: "Type 2 (hosted) hypervisor", meaning: "an application on a normal desktop OS: VirtualBox, VMware Workstation, Parallels. Convenient on a laptop, slower and less isolated." },
        { term: "Hardware-assisted virtualization", meaning: "CPU features (Intel VT-x, AMD-V) and memory features (EPT, NPT) that let guests run directly on the CPU at near native speed, trapping only privileged operations to the hypervisor." },
        { term: "vCPU", meaning: "a virtual CPU the hypervisor schedules onto a real core or hardware thread. More vCPUs than real cores is overcommit." },
        { term: "Paravirtualized drivers", meaning: "guest drivers that know they are virtual (virtio, VMware Tools, Hyper-V integration services) and talk to the hypervisor directly, which is much faster than emulating a real network card or disk controller." },
      ],
    },
    {
      kind: "table",
      title: "Virtual machines and containers",
      head: ["", "Virtual machine", "Container"],
      rows: [
        ["What is virtualized", "the hardware", "the operating system's view: processes, files, network"],
        ["Kernel", "each VM runs its own", "all containers share the host's"],
        ["Can run", "any OS, such as Windows on a Linux host", "only programs for the host's kernel"],
        ["Size", "gigabytes: a whole OS", "megabytes: an app and its libraries"],
        ["Start time", "tens of seconds (booting an OS)", "milliseconds to seconds (starting a process)"],
        ["Isolation", "strong: a hypervisor boundary", "weaker: a kernel bug can let a container out"],
        ["Typical use", "separate servers, mixed OSes, multi-tenant clouds", "packaging and deploying apps, many per VM"],
      ],
      notes: ["They combine: in the cloud your containers usually run inside VMs. Where isolation matters, micro-VMs such as Firecracker (behind AWS Lambda and Fargate) give each workload its own tiny VM that boots in a fraction of a second."],
    },
    {
      kind: "code",
      title: "Where am I running?",
      blocks: [
        {
          lang: "bash",
          code: src`
systemd-detect-virt`,
          output: src`
docker`,
        },
      ],
      notes: ["This was run inside a container, so it reports the container runtime. On a cloud VM the same command prints the hypervisor, such as kvm, amazon or microsoft, and on physical hardware it prints none. `lscpu` shows a Hypervisor vendor line inside a VM."],
    },
    {
      kind: "text",
      title: "Snapshots, templates and live migration",
      paragraphs: [
        "A VM is ultimately a few files: a disk image and a configuration. That makes things possible that are hard with physical servers. A snapshot freezes the disk (and optionally memory) at a moment, so you can roll back a failed upgrade in seconds; the hypervisor writes later changes to a separate delta file. Snapshots are not backups: they live on the same storage, and long chains of them slow the VM down and fill the datastore, so delete them once the change is confirmed.",
        "A template or golden image is a prepared VM you clone to build new servers quickly; in the cloud the same idea is a machine image (AMI or Azure image). Live migration (vMotion in VMware, live migration in Hyper-V and KVM) moves a running VM to another host with no downtime: memory is copied over while the VM runs, then the last changed pages are copied during a pause of milliseconds. That is how hosts get patched and how clouds move your VM off failing hardware without you noticing.",
      ],
    },
    {
      kind: "text",
      title: "Overcommit and thin provisioning",
      paragraphs: [
        "Most VMs sit mostly idle, so hypervisors give out more than they have. CPU overcommit (say 4 vCPUs for every real core) works until many VMs get busy at once; then each waits for a turn on a real core, which shows up as CPU ready or steal time in monitoring. Memory overcommit uses ballooning, page sharing and swapping, and hurts more when it runs out.",
        "Thin provisioning does the same for disk: a VM is given a 500 GB disk but only uses space on the datastore as it writes. It saves a lot of storage, until the guests together try to use more than the datastore holds and every VM on it stops. Thin disks need monitoring and alerts on datastore usage; thick (preallocated) disks trade space for predictability.",
      ],
    },
    {
      kind: "steps",
      title: "What this means in the cloud",
      steps: [
        "An instance type is a VM size: a number of vCPUs and an amount of memory, on a host shared with other customers.",
        "Burstable types (such as AWS t3 or Azure B) are overcommitted on purpose: you get a baseline share of a core and credits to burst above it.",
        "Noisy neighbours are real: another tenant's load can affect yours, which is one reason for dedicated hosts.",
        "Stopping a VM may move it to another host when it starts again, so anything on local instance storage is lost; keep data on network disks or in managed services.",
      ],
    },
  ],
  quiz: [
    {
      question: "You need to run a Windows-only tool on a Linux server. Container or VM?",
      answer: "A VM, because containers share the host's Linux kernel",
      distractors: ["A container with a Windows base image", "Either works the same way", "Neither: it can't be done"],
      why: "A container can only run programs for the kernel it shares. A VM brings its own kernel, so it can run any operating system the hardware supports.",
    },
    {
      question: "Which is a type 1 hypervisor?",
      answer: "VMware ESXi",
      distractors: ["VirtualBox", "VMware Workstation", "Docker"],
      why: "ESXi runs directly on the hardware. VirtualBox and Workstation are applications on a desktop OS (type 2), and Docker runs containers, not VMs.",
    },
    {
      question: "An admin keeps a VM snapshot from before an upgrade as its backup. What's wrong with that?",
      answer: "The snapshot lives on the same storage, so it is lost with it, and long-lived snapshots slow the VM",
      distractors: ["Snapshots can't be restored", "Snapshots only record memory", "Nothing, a snapshot is a backup"],
      why: "A snapshot is a delta on the same datastore, good for quick rollback. A backup is a separate copy, ideally off site and immutable.",
    },
    {
      question: "VMs on a busy host report high CPU steal or ready time. What does it mean?",
      answer: "The VMs are waiting for real cores because the host's CPUs are overcommitted",
      distractors: ["The guest OS has a memory leak", "The disks are thin provisioned", "The VMs are being live migrated"],
      why: "Steal time is time a vCPU was ready to run but the hypervisor ran something else. The fix is fewer vCPUs per core on that host, or moving VMs.",
    },
  ],
  pitfalls: [
    "Keeping VM snapshots for weeks; delta files grow, slow every write and can fill the datastore.",
    "Thin provisioning without alerts on datastore space.",
    "Giving a VM more vCPUs than it needs, which can make it slower on a busy host because it waits for more cores at once.",
    "Treating containers as a strong security boundary between untrusted tenants.",
  ],
  next: [
    { id: "linux-containers", label: "Containers and Kubernetes" },
    { id: "cloud-basics", label: "Cloud Fundamentals: Service Models, Regions and Shared Responsibility" },
    { id: "kernel-mode-syscalls", label: "User Mode, Kernel Mode, System Calls and Interrupts" },
  ],
};
