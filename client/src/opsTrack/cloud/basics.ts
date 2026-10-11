import { src, type OpsLessonData } from "../types.ts";

export const cloudBasics: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "\"The cloud\" means renting computing from a provider such as Microsoft Azure, Amazon Web Services (AWS) or Google Cloud instead of buying and running the hardware yourself. You ask for a server, a database or 500 GB of storage through a web portal, a command-line tool or an API (an interface programs call), it's ready in minutes, and you pay by the second, hour or gigabyte for as long as you keep it.",
        "That changes the economics. A company that buys servers pays up front for the busiest day it expects and owns the hardware for five years. In the cloud you can start small, add capacity in minutes when traffic grows (elasticity), remove it again at night, and try an idea for a week without a purchase order. The trade-offs are that costs can creep up quietly, and that you depend on the provider's availability, pricing and services.",
      ],
    },
    {
      kind: "table",
      title: "Service models: how much do you run yourself?",
      head: ["Model", "You get", "You still manage", "Examples"],
      rows: [
        ["IaaS (Infrastructure as a Service)", "virtual machines, disks and networks", "the operating system and everything on it: patches, runtime, app, backups inside the VM", "Azure Virtual Machines, Amazon EC2, Google Compute Engine"],
        ["PaaS (Platform as a Service)", "a place to run your code or data; the provider runs the servers and OS", "your code, its settings, your data and who can access it", "Azure App Service, Azure SQL Database, Amazon RDS, Google Cloud Run"],
        ["SaaS (Software as a Service)", "finished software in the browser", "your users, their permissions, the settings and the data you put in", "Microsoft 365, Salesforce, GitHub, Slack"],
      ],
      notes: [
        "There's a spectrum inside PaaS. Serverless functions (Azure Functions, AWS Lambda) run a piece of code per event and bill per execution; managed Kubernetes (AKS, EKS, GKE) runs your containers on nodes the provider keeps patched. The further right you go, the less you can tweak and the less you have to look after.",
      ],
    },
    {
      kind: "widget",
      widget: "sharedResponsibility",
      title: "Try it: the shared responsibility model",
      intro: "Security and operations duties are split between you and the provider, and where the line falls depends on the model. Switch models and see who has to deal with each incident.",
    },
    {
      kind: "text",
      title: "Regions and availability zones",
      paragraphs: [
        "A provider's data centres are grouped into regions: geographic areas such as West Europe (the Netherlands), North Europe (Ireland) or Norway East. You choose a region for every resource. Pick it for latency (close to your users), for data residency (some data must legally stay in the EU or in one country), for which services and machine sizes are offered there, and for price, which differs between regions.",
        "Most regions are split into availability zones (usually three): one or more data centres per zone, physically separate, each with its own power, cooling and network, far enough apart that one local disaster shouldn't hit two of them, and close enough to be linked by very fast connections. A fire or power cut takes out one zone, not the region. Spreading copies of your app across zones is how you survive that. A whole region failing is rarer; surviving it means a second region, which costs a lot more and is a business decision, not a default.",
      ],
    },
    {
      kind: "widget",
      widget: "availabilityZones",
      title: "Try it: what survives?",
      intro: "Pick a design, then break something.",
    },
    {
      kind: "terms",
      title: "Words you'll meet in every cloud",
      terms: [
        { term: "Tenant, account, subscription", meaning: "the containers for billing and administration. In Azure, a tenant is your organisation's Entra ID directory, and subscriptions inside it hold resources and get the bills. In AWS, an account plays both roles, grouped under an organization." },
        { term: "Resource group", meaning: "Azure's folder for resources that live and die together, such as one app's web app, database and storage. Delete the group and everything in it goes." },
        { term: "IAM", meaning: "identity and access management: who (a user, a group or an app's identity) may do what on which resource. Azure calls its version role-based access control (RBAC)." },
        { term: "Managed identity / role", meaning: "an identity for a program rather than a person, so an app can reach a database or storage without a password in its config." },
        { term: "Egress", meaning: "data leaving the provider's network, for example to users on the internet. Usually charged per GB, while data coming in is free." },
        { term: "Tags", meaning: "key-value labels on resources (`owner=finance`, `environment=prod`), used to split the bill and find things." },
      ],
    },
    {
      kind: "code",
      title: "The command line",
      blocks: [
        {
          lang: "bash",
          label: "Azure CLI",
          code: src`
az login                                     # opens a browser to sign in
az account show --output table               # which subscription am I working in?
az account list-locations --output table     # region names, e.g. westeurope
az group create --name rg-academy-staging --location westeurope --tags owner=platform environment=staging
az vm list --resource-group rg-academy-staging --output table
az group delete --name rg-academy-staging    # deletes everything in the group
`,
        },
        {
          lang: "bash",
          label: "AWS CLI",
          code: src`
aws sts get-caller-identity                              # who am I signed in as?
aws ec2 describe-availability-zones --region eu-north-1  # the zones in Stockholm
aws s3 ls                                                # list storage buckets
`,
        },
      ],
      notes: [
        "Everything the portal does goes through the same API, so anything you can click you can also script. Clicking is fine for exploring; for anything you'll need again, or need to rebuild, use code (see the infrastructure as code lesson).",
      ],
    },
    {
      kind: "table",
      title: "Where cloud bills come from",
      head: ["Surprise", "Why it happens", "What to do"],
      rows: [
        ["A stopped VM still costs money", "In Azure, shutting down from inside Windows or Linux keeps the hardware reserved. Only \"Stop\" in the portal (deallocate) ends compute charges; disks are billed either way.", "`az vm deallocate`, or auto-shutdown schedules for test machines"],
        ["Forgotten resources", "The test environment from March, unattached disks, old snapshots, a public IP nobody uses.", "Tags with an owner, budgets with alerts, a monthly clean-up"],
        ["Egress", "Serving lots of data to the internet, or between regions.", "Caches and CDNs, keep chatty services in one region"],
        ["Oversized machines", "Sized for a guessed peak and never revisited.", "Check utilisation; resize; reserved instances or savings plans for steady workloads"],
      ],
    },
  ],
  quiz: [
    {
      question: "Your company moves its intranet to Azure App Service (PaaS). Who installs operating system security patches on the servers it runs on?",
      answer: "Microsoft, because with PaaS the provider runs the operating system",
      distractors: ["Your IT team, through Windows Update", "Nobody: App Service doesn't use an operating system", "Whoever deployed the app last"],
      why: "With PaaS you're responsible for your code, its settings, your data and access; the platform underneath, including the OS, is the provider's job. With IaaS (a VM), patching is yours.",
    },
    {
      question: "With SaaS such as Microsoft 365, which of these is still your responsibility?",
      answer: "Disabling accounts of people who've left, and what users share externally",
      distractors: ["Patching Exchange Online", "Replacing failed disks", "Choosing which datacentre the mailbox servers are in"],
      why: "Your data, your accounts and how you configure the service never move to the provider.",
    },
    {
      question: "An app runs on two VMs behind a load balancer, both in zone 1 of West Europe. Zone 1 has a power failure. What happens?",
      answer: "The app goes down, because both VMs depend on the same zone",
      distractors: ["The load balancer moves the VMs to zone 2", "Nothing, because two VMs make it highly available", "Azure automatically restores the VMs in another region"],
      why: "Two copies in the same zone protect against one server failing, not against the zone failing. Put the copies in different zones.",
    },
    {
      question: "Your database is replicated across three zones. A developer accidentally deletes a table. How do you get the data back?",
      answer: "From a backup or point-in-time restore; the replicas deleted it too",
      distractors: ["Fail over to the replica in zone 2", "Ask the provider to undo it", "Restart the database"],
      why: "Replication copies every change, including mistakes, within milliseconds. Redundancy keeps you running; backups let you go back in time. You need both.",
    },
    {
      question: "Why might a Norwegian company put its HR system in the Norway East region rather than the cheaper East US?",
      answer: "Data residency rules and lower latency for its users",
      distractors: ["East US has no availability zones", "Norway East is always cheaper", "Data in East US can't be backed up"],
      why: "Laws, contracts or company policy often require personal data to stay in the EU or EEA, and being closer to users means faster responses.",
    },
  ],
  pitfalls: [
    "Treating the cloud as \"someone else's problem\". Misconfigured access (a public storage container, an over-privileged account) is the most common cause of cloud breaches, and that part is always yours.",
    "Creating resources by hand in the portal for production. Nobody can tell later how they were set up, and rebuilding them takes days.",
    "Running production in one zone because it was the default.",
    "No budgets or alerts. The first sign of a runaway cost shouldn't be the monthly invoice.",
  ],
  next: [
    { id: "cloud-container-images", label: "Container Images and Registries" },
    { id: "cloud-iac", label: "Infrastructure as Code: Terraform and Bicep" },
  ],
};
