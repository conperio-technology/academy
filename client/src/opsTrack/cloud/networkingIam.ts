import { src, type OpsLessonData } from "../types.ts";

export const cloudNetworkingIam: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Two things decide what can reach what in a cloud account: the network (which packets can flow between resources and the internet) and identity (which callers may use which API actions on which resources). Most cloud breaches come from a gap in one of them: a database with a public address and an open security group, or a role that can do far more than it needs.",
        "The examples use AWS names; Azure and Google Cloud have the same pieces under other names, listed in a table at the end. The lesson finishes with serverless functions, where both meet.",
      ],
    },
    {
      kind: "terms",
      title: "Network building blocks",
      terms: [
        { term: "VPC (virtual private cloud)", meaning: "your own private network in a region, with an address range you choose such as 10.20.0.0/16. Nothing gets in or out until you add routes and gateways." },
        { term: "Subnet", meaning: "a slice of the VPC's range in one availability zone, such as 10.20.1.0/24. Resources are placed in subnets; spread each tier over subnets in two or three zones." },
        { term: "Route table", meaning: "attached to subnets, it decides where traffic goes: local traffic stays in the VPC, and 0.0.0.0/0 (everything else) goes to a gateway, or nowhere." },
        { term: "Public subnet", meaning: "a subnet whose route table sends 0.0.0.0/0 to an internet gateway. Resources in it can have public IPs. Put load balancers and little else here." },
        { term: "Private subnet", meaning: "no route from the internet. Application servers and databases live here." },
        { term: "NAT gateway", meaning: "sits in a public subnet and lets private resources make outbound connections (to download updates or call APIs) while nothing can connect in. It's billed per hour and per GB, often a surprise on the bill." },
        { term: "Security group", meaning: "a stateful firewall on each network interface: allow rules only, and replies to allowed traffic are let back automatically. Rules can name another security group as the source, such as \"the app servers may reach the database on 5432\"." },
        { term: "Network ACL", meaning: "a stateless allow and deny list on a whole subnet, checked in rule order, so return traffic needs its own rule. Used as a coarse extra layer." },
        { term: "VPC endpoint (PrivateLink)", meaning: "reach a cloud service such as S3, or another account's service, through a private address in your VPC instead of over the internet." },
        { term: "Peering and transit gateway", meaning: "connect VPCs to each other (peering, one to one) or many VPCs and on-premises networks through a hub (transit gateway). Address ranges must not overlap, so plan them early." },
      ],
    },
    {
      kind: "steps",
      title: "A typical three-tier layout",
      steps: [
        "One VPC, 10.20.0.0/16, across two availability zones.",
        "Public subnets in each zone hold the internet-facing load balancer and a NAT gateway. Their route table sends 0.0.0.0/0 to the internet gateway.",
        "Private app subnets run the servers or containers. Their route table sends 0.0.0.0/0 to the NAT gateway for outbound calls only. Their security group allows port 443 only from the load balancer's security group.",
        "Private data subnets hold the database, with no internet route at all. Its security group allows 5432 only from the app servers' security group.",
        "Admins reach servers through Systems Manager Session Manager (or Azure Bastion), not SSH on a public IP. If an old-style bastion host is used, it is the only thing accepting SSH, from the company's IP range.",
      ],
    },
    {
      kind: "table",
      title: "Security groups and network ACLs",
      head: ["", "Security group", "Network ACL"],
      rows: [
        ["Applies to", "each network interface (instance, database, load balancer)", "a whole subnet"],
        ["State", "stateful: replies are allowed automatically", "stateless: inbound and outbound rules both needed"],
        ["Rules", "allow only", "allow and deny, evaluated in number order"],
        ["Can reference", "other security groups", "only IP ranges"],
        ["Use it for", "almost all access control", "blocking a known bad range, a coarse guard rail"],
      ],
    },
    {
      kind: "terms",
      title: "Identity: who can call which API",
      terms: [
        { term: "Principal", meaning: "whoever makes a request: a user, a role being used by a person or service, or another AWS service." },
        { term: "IAM user", meaning: "a long-lived identity with a password or access keys. Avoid them for people (use single sign-on) and for code (use roles); leaked access keys are the classic cloud breach." },
        { term: "IAM role", meaning: "an identity with permissions but no password or keys of its own. A person, a server or a function assumes it and gets temporary credentials that expire, usually within an hour." },
        { term: "Policy", meaning: "a JSON document of statements: Effect (Allow or Deny), Action (such as s3:GetObject), Resource (an ARN) and optional Conditions. Attached to a user, group or role, or to a resource such as a bucket." },
        { term: "Instance profile and workload identity", meaning: "how code on a VM, container or function gets a role's credentials automatically from the platform, so no keys are stored in config. Azure calls it managed identity." },
        { term: "Trust policy", meaning: "on a role, says who may assume it: a service such as Lambda, another account, or users federated through the company's identity provider." },
        { term: "Service control policy (SCP)", meaning: "an organization-wide limit on what any account may do, such as denying actions outside approved regions. It can only restrict, never grant." },
      ],
    },
    {
      kind: "code",
      title: "A least-privilege policy",
      blocks: [
        {
          lang: "json",
          label: "report-reader-policy.json",
          code: src`
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::reports/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::reports",
      "Condition": { "StringLike": { "s3:prefix": ["2026/*"] } }
    }
  ]
}`,
        },
      ],
      notes: ["Object actions use the object ARN (bucket/*), listing uses the bucket ARN itself; mixing these up is the most common reason a new S3 policy doesn't work."],
    },
    {
      kind: "text",
      title: "How a request is decided",
      paragraphs: [
        "Every API call starts denied. AWS gathers all the policies that apply (identity policies, the resource's own policy, permission boundaries, session policies and SCPs) and checks them in a fixed way. If any matching statement says Deny, the answer is deny, whatever else allows it. Otherwise, if something allows it (and nothing at a higher level, such as an SCP, leaves it out), the answer is allow. If nothing matches, the answer is deny by default.",
        "The widget below plays out that rule for identity policies on a single role.",
      ],
    },
    {
      kind: "widget",
      widget: "iamPolicy",
      title: "Try it: allowed or denied?",
      intro: "Pick an action and a resource and see which statements match. Tick the admin statement to see that an explicit Deny still wins over Allow *.",
    },
    {
      kind: "text",
      title: "Serverless: cold starts and where functions run",
      paragraphs: [
        "A serverless function (AWS Lambda, Azure Functions, Google Cloud Functions) runs your code on demand in a short-lived environment the provider manages. The first request after a quiet period, or each extra concurrent request beyond the warm environments, has to create a new environment, load the runtime and run your startup code: a cold start, from under 100 ms for a small Node or Python function to a second or more for a large Java or .NET one. Later requests reuse the warm environment.",
        "Ways to reduce it: keep the package and startup work small, create clients outside the handler so warm calls reuse them, pick a lighter runtime, or pay for provisioned concurrency. A function gets its permissions from its execution role, never from keys in its environment variables. By default it can reach the internet but not your VPC; attaching it to private subnets lets it reach a database there, and it then needs a NAT gateway or VPC endpoints for anything outside.",
      ],
    },
    {
      kind: "table",
      title: "The same ideas on each cloud",
      head: ["Idea", "AWS", "Azure", "Google Cloud"],
      rows: [
        ["Private network", "VPC", "Virtual network (VNet)", "VPC (global, subnets are regional)"],
        ["Instance firewall", "security group", "network security group (NSG)", "VPC firewall rules"],
        ["Outbound only internet", "NAT gateway", "NAT gateway", "Cloud NAT"],
        ["Private access to services", "VPC endpoint, PrivateLink", "private endpoint", "Private Service Connect"],
        ["Admin access without public SSH", "Session Manager", "Azure Bastion", "IAP TCP forwarding"],
        ["Identity for code", "IAM role", "managed identity", "service account"],
        ["Permissions", "IAM policies", "Azure RBAC role assignments", "IAM roles bound to principals"],
        ["Functions", "Lambda", "Azure Functions", "Cloud Run functions"],
      ],
    },
  ],
  quiz: [
    {
      question: "Servers in a private subnet need to download OS updates, but nothing on the internet may connect to them. What do they need?",
      answer: "A route to a NAT gateway in a public subnet",
      distractors: ["Public IP addresses", "A route to the internet gateway", "A network ACL allowing all inbound traffic"],
      why: "A NAT gateway carries outbound connections and their replies, but accepts no new inbound connections.",
    },
    {
      question: "A security group allows inbound 443. Do you need an outbound rule for the replies?",
      answer: "No, security groups are stateful",
      distractors: ["Yes, for ports 1024 to 65535", "Yes, for port 443 outbound", "Only if a network ACL is attached"],
      why: "Security groups track connections and allow the replies. Network ACLs are stateless, so they need explicit rules for return traffic.",
    },
    {
      question: "A role has AdministratorAccess (Allow * on *) and also a policy that denies s3:DeleteObject. Can it delete objects?",
      answer: "No, an explicit deny always wins",
      distractors: ["Yes, the admin policy overrides it", "Only in its own account", "It depends on which policy was attached first"],
      why: "Evaluation looks for any matching Deny first. Order of attachment doesn't matter.",
    },
    {
      question: "An application on an EC2 instance needs to read from S3. How should it get credentials?",
      answer: "An IAM role through an instance profile, giving temporary credentials",
      distractors: ["An IAM user's access keys in a config file", "The root account's keys in environment variables", "A key baked into the machine image"],
      why: "Roles give short-lived credentials the platform rotates automatically. Long-lived keys in files leak through backups, images and repositories.",
    },
  ],
  pitfalls: [
    "Opening a security group to 0.0.0.0/0 on SSH, RDP or a database port.",
    "Putting databases in public subnets \"temporarily\".",
    "Using IAM users with long-lived access keys for applications or people.",
    "Policies with Action * or Resource * written to make an error go away.",
    "Choosing VPC address ranges that overlap the office network or other VPCs, which blocks peering and VPNs later.",
    "Forgetting that NAT gateway data charges apply to traffic to S3 too, when a free gateway endpoint would avoid them.",
  ],
  next: [
    { id: "cloud-iac", label: "Infrastructure as Code: Terraform and Bicep" },
    { id: "sec-secrets-least-privilege", label: "Secrets Management and Least Privilege" },
    { id: "net-firewalls-ports", label: "Firewalls and Ports" },
  ],
};
