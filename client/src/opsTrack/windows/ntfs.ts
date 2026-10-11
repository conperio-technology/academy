import { src, type OpsLessonData } from "../types.ts";

export const ntfs: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "NTFS is the filesystem Windows uses for its disks. Besides storing files it stores who may do what with each one: every file and folder has an owner and an access control list (ACL), a list of access control entries (ACEs), each saying \"allow\" or \"deny\" some rights to a user or group.",
        "Users and groups appear in ACLs by their security identifier (SID), a unique ID like `S-1-5-21-…-1104`, not by name. Rename a group and its permissions still work; delete it and recreate one with the same name and they don't, because the new group has a new SID. That's also why you sometimes see a bare SID in a permissions list: the account it belonged to is gone.",
      ],
    },
    {
      kind: "table",
      title: "The basic permissions",
      head: ["Permission", "Lets you"],
      rows: [
        ["Read", "open files and list folder contents, read attributes and permissions"],
        ["Read & execute", "Read, plus run programs (and traverse folders)"],
        ["Write", "create files and folders, change contents. Not delete"],
        ["Modify", "Read & execute, Write, and Delete. What most people who work in a folder need"],
        ["Full control", "Modify, plus change permissions and take ownership. Keep it for administrators"],
      ],
      notes: ["Each basic permission is a bundle of finer \"advanced\" rights (Delete, Change permissions, Traverse folder and others), visible under Advanced in the Security tab."],
    },
    {
      kind: "text",
      title: "Inheritance, and who wins",
      paragraphs: [
        "Permissions set on a folder flow down to everything inside it: inherited ACEs. You set access once on `D:\\Shares\\Finance` and every subfolder follows. Entries set directly on an object are explicit. You can break inheritance on a subfolder (copy or remove the inherited entries and manage it separately), but every break is something to document and remember.",
        "When Windows checks access it reads the ACEs in a fixed order: explicit deny, explicit allow, inherited deny, inherited allow. For each right you asked for, the first entry that mentions it decides. So an explicit allow on a subfolder beats a deny inherited from above, and a deny only beats an allow at the same level or further away. Users get the combination of everything their groups are allowed, minus what's denied.",
        "Shared folders have a second, separate list: share permissions, checked only when someone comes in over the network (`\\\\FS01\\Finance`). Both apply, and the more restrictive wins. The usual practice is to make the share permission broad (Authenticated Users: Full control, or Change) and do all real control in NTFS, so there's one place to look.",
      ],
    },
    {
      kind: "widget",
      widget: "ntfsAccess",
      title: "Try it: work out effective access",
      intro: "Three users, one folder, inherited and explicit entries, and a share in front. The bottom table recalculates as you change things.",
    },
    {
      kind: "code",
      title: "Reading and setting permissions from the command line",
      blocks: [
        {
          lang: "cmd",
          code: "icacls D:\\Shares\\Finance\\Budgets",
          unverified: true,
          output: src`
D:\Shares\Finance\Budgets CONPERIO\cy:(OI)(CI)(M)
                          CONPERIO\GG-Contractors:(I)(OI)(CI)(DENY)(W)
                          BUILTIN\Administrators:(I)(OI)(CI)(F)
                          CONPERIO\GG-Finance:(I)(OI)(CI)(M)
                          CONPERIO\Domain Users:(I)(OI)(CI)(RX)

Successfully processed 1 files; Failed processing 0 files
`,
        },
        {
          lang: "cmd",
          code: src`
icacls D:\Shares\Finance\Budgets /grant "CONPERIO\GG-Auditors:(OI)(CI)RX"
icacls D:\Shares\Finance\Budgets /remove "CONPERIO\cy"
icacls D:\Shares\Finance /save finance-acl.txt /t
`,
        },
        {
          lang: "powershell",
          code: src`
(Get-Acl D:\Shares\Finance\Budgets).Access |
    Format-Table IdentityReference, AccessControlType, FileSystemRights, IsInherited
Get-SmbShareAccess -Name Finance
`,
        },
      ],
      notes: [
        "Reading icacls: `(I)` inherited, `(OI)` applies to files inside (object inherit), `(CI)` applies to subfolders (container inherit), then the rights: `F` full, `M` modify, `RX` read and execute, `R` read, `W` write. Entries are listed in the order Windows checks them: explicit first, and denies before allows at each level.",
        "`/save` and `/restore` back up and restore ACLs: worth doing before any big permissions change.",
      ],
    },
  ],
  quiz: [
    {
      question: "The Finance folder gives GG-Finance Modify. Ana is in GG-Finance. The share \\\\FS01\\Finance gives Everyone: Read. What can Ana do from her laptop?",
      answer: "Read only",
      distractors: ["Modify", "Nothing", "Full control"],
      why: "Over the network both share and NTFS permissions apply, and the more restrictive one wins. Sitting at the server she'd get Modify.",
    },
    {
      question: "A deny for GG-Contractors (Write) is inherited from the parent folder. On a subfolder there's an explicit allow for Cy (Modify). Cy is in GG-Contractors. Can Cy write in the subfolder?",
      answer: "Yes: an explicit allow is checked before an inherited deny",
      distractors: ["No: deny always wins", "Only if Cy signs out and in again", "Only over the network"],
      why: "The order is explicit deny, explicit allow, inherited deny, inherited allow, and the first entry mentioning a right decides it. \"Deny always wins\" is only true between entries at the same level.",
    },
    {
      question: "In icacls output, what does CONPERIO\\GG-Finance:(I)(OI)(CI)(M) mean?",
      answer: "GG-Finance has Modify, inherited from a parent, applying to this folder, its files and its subfolders",
      distractors: ["GG-Finance is denied Modify", "GG-Finance owns the folder", "The entry applies to this folder only"],
      why: "(I) inherited, (OI) object inherit (files), (CI) container inherit (folders), (M) modify. A folder-only entry would have neither OI nor CI.",
    },
    {
      question: "Someone deletes the group GG-Finance by mistake and recreates it with the same name and members. Why does access to the Finance share still fail?",
      answer: "ACLs store the group's SID, and the new group has a different SID",
      distractors: ["Permissions only refresh weekly", "Group names are case-sensitive", "The share must be recreated too"],
      why: "The ACL still points at the old SID (now shown as an unknown account). Add the new group to the ACLs, or restore the deleted one from the AD Recycle Bin, which keeps its SID.",
    },
  ],
  pitfalls: [
    "Granting permissions to individual users. Grant to groups, and manage people by group membership; see the Active Directory lesson for the pattern.",
    "Using Deny to fix a design problem. Deny entries make access hard to reason about; prefer simply not granting.",
    "Breaking inheritance deep in a tree and forgetting it. The next person to grant access at the top won't understand why it doesn't apply.",
    "Copying versus moving: a file copied into a folder takes that folder's inherited permissions, while a file moved within the same volume keeps the permissions it had.",
  ],
  next: [
    { id: "ad-domains-ous", label: "Active Directory: Domains, OUs, Users and Groups" },
    { id: "linux-permissions", label: "The Linux equivalent: Users and Permissions" },
  ],
};
