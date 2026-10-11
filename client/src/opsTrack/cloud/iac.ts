import { src, type OpsLessonData } from "../types.ts";
import { TF_CAPTURES } from "../../components/tools/ops/captures.ts";

export const iac: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Infrastructure as code (IaC) means describing servers, networks, databases and permissions in text files and letting a tool create them, instead of clicking through a portal. The files live in Git, so every change is reviewed in a pull request, has an author and a date, and can be reverted. A whole environment can be rebuilt from scratch, and staging and production can be made from the same code with different settings.",
        "Most IaC tools are declarative: you describe the end state (\"a resource group, a plan, a web app with these settings\") and the tool works out the steps. Imperative scripts (`az group create ...`, then `az webapp create ...`) describe steps instead, and break the second time you run them because things already exist.",
      ],
    },
    {
      kind: "table",
      title: "The tools",
      head: ["Tool", "Language", "Works with", "Keeps track of what exists by"],
      rows: [
        ["Terraform (and its open-source fork OpenTofu)", "HCL (HashiCorp Configuration Language)", "every major cloud and hundreds of other services, through providers", "its own state file"],
        ["Bicep", "Bicep, which compiles to ARM JSON templates", "Azure only", "Azure itself: the deployment compares with what's in the resource group"],
        ["AWS CloudFormation / CDK", "YAML or JSON / TypeScript, Python, C#", "AWS only", "stacks stored in AWS"],
        ["Pulumi", "TypeScript, Python, C#, Go", "most clouds", "its own state"],
        ["Ansible", "YAML playbooks", "configuring machines that already exist (packages, files, services), more than creating cloud resources", "nothing: it checks each machine every run"],
      ],
    },
    {
      kind: "code",
      title: "Terraform: an Azure web app",
      blocks: [
        {
          lang: "hcl",
          label: "main.tf",
          code: src`
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.14"
    }
  }

  # State lives in a storage account, not on someone's laptop
  backend "azurerm" {
    resource_group_name  = "rg-tfstate"
    storage_account_name = "conperiotfstate"
    container_name       = "tfstate"
    key                  = "academy-staging.tfstate"
  }
}

provider "azurerm" {
  features {}
}

variable "environment" {
  type    = string
  default = "staging"
}

variable "image_tag" {
  type = string
}

locals {
  tags = {
    app         = "academy"
    environment = var.environment
    managed_by  = "terraform"
  }
}

resource "azurerm_resource_group" "academy" {
  name     = "rg-academy-${"$"}{var.environment}"
  location = "westeurope"
  tags     = local.tags
}

resource "azurerm_service_plan" "academy" {
  name                = "asp-academy-${"$"}{var.environment}"
  resource_group_name = azurerm_resource_group.academy.name
  location            = azurerm_resource_group.academy.location
  os_type             = "Linux"
  sku_name            = "B1"
  tags                = local.tags
}

resource "azurerm_linux_web_app" "academy" {
  name                = "app-academy-${"$"}{var.environment}"
  resource_group_name = azurerm_resource_group.academy.name
  location            = azurerm_resource_group.academy.location
  service_plan_id     = azurerm_service_plan.academy.id
  https_only          = true
  tags                = local.tags

  site_config {
    application_stack {
      docker_image_name   = "conperio-academy:${"$"}{var.image_tag}"
      docker_registry_url = "https://conperio.azurecr.io"
    }
  }
}

output "url" {
  value = "https://${"$"}{azurerm_linux_web_app.academy.default_hostname}"
}
`,
        },
      ],
      notes: [
        "A resource block is `resource \"TYPE\" \"NAME\"`: the type comes from a provider (here azurerm, Azure Resource Manager), and the name is Terraform's own label for it. Referring to `azurerm_resource_group.academy.name` both reuses the value and tells Terraform the order: resource group first, then the plan, then the app.",
        "`variable` blocks are inputs (`terraform apply -var image_tag=1.5.0`, or a `.tfvars` file per environment), `locals` are named values, and `output` blocks print results.",
        "The `backend` block stores the state file in an Azure storage account, so the whole team shares one copy and Terraform can lock it while someone is applying. This configuration passes `terraform validate` with the azurerm 4.14 provider.",
      ],
    },
    {
      kind: "text",
      title: "Plan, then apply",
      paragraphs: [
        "The workflow is always the same. `terraform init` downloads the providers and connects to the state backend. `terraform plan` reads the current state, asks the cloud what really exists, compares both with your code, and prints what it would do. `terraform apply` does it. The plan is where mistakes are caught, so in a team the plan output goes into the pull request for review, and the pipeline applies exactly the plan that was reviewed (`terraform plan -out=tfplan`, then `terraform apply tfplan`).",
        "Terraform's state file is its memory: which real object (by its cloud ID) belongs to which resource block. Without it, Terraform can't know that `azurerm_resource_group.academy` is the group that already exists. Don't edit it by hand, and treat it as sensitive, because it can contain passwords and keys in plain text.",
      ],
    },
    {
      kind: "widget",
      widget: "iacPlan",
      title: "Try it: read real Terraform plans",
      intro: "These are real runs of Terraform 1.9.8 against a configuration that writes a local file instead of creating cloud resources, so it runs on any laptop with no cloud account. The plan format is the same for Azure, AWS or anything else.",
    },
    {
      kind: "code",
      title: "Run it yourself",
      blocks: [
        {
          lang: "hcl",
          label: "main.tf",
          code: src`
terraform {
  required_providers {
    local  = { source = "hashicorp/local", version = "~> 2.5" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

variable "environment" {
  type    = string
  default = "staging"
}

variable "replicas" {
  type    = number
  default = 2
}

resource "random_pet" "name" {
  length = 2
}

resource "local_file" "app_config" {
  filename = "${"$"}{path.module}/out/${"$"}{var.environment}/app.json"
  content = jsonencode({
    name        = "academy-${"$"}{random_pet.name.id}"
    environment = var.environment
    replicas    = var.replicas
  })
  file_permission = "0640"
}

resource "terraform_data" "release" {
  input = {
    version = "1.4.0"
  }
}

output "config_path" {
  value = local_file.app_config.filename
}
`,
        },
        {
          lang: "bash",
          code: src`
terraform init
terraform plan -out=tfplan
terraform apply tfplan
`,
          output: TF_CAPTURES.apply,
        },
        {
          lang: "bash",
          code: "cat out/staging/app.json; echo; terraform state list",
          output: TF_CAPTURES.appJson + "\n" + TF_CAPTURES.statelist,
        },
      ],
      notes: [
        "`random_pet` picks a random two-word name once, stores it in the state, and keeps it on every later run: the same idea as a cloud resource getting an ID when it's created. Your run will get a different name. `terraform destroy` removes everything again.",
      ],
    },
    {
      kind: "code",
      title: "The same Azure app in Bicep",
      blocks: [
        {
          lang: "bicep",
          label: "main.bicep",
          code: src`
param environment string = 'staging'
param imageTag string
param location string = resourceGroup().location

var tags = {
  app: 'academy'
  environment: environment
  managed_by: 'bicep'
}

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: 'asp-academy-${"$"}{environment}'
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: 'B1'
  }
  properties: {
    reserved: true // required for Linux plans
  }
}

resource app 'Microsoft.Web/sites@2023-12-01' = {
  name: 'app-academy-${"$"}{environment}'
  location: location
  tags: tags
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|conperio.azurecr.io/conperio-academy:${"$"}{imageTag}'
    }
  }
}

output url string = 'https://${"$"}{app.properties.defaultHostName}'
`,
        },
        {
          lang: "bash",
          code: src`
az group create --name rg-academy-staging --location westeurope
az deployment group what-if --resource-group rg-academy-staging --template-file main.bicep --parameters imageTag=1.5.0
az deployment group create --resource-group rg-academy-staging --template-file main.bicep --parameters imageTag=1.5.0
`,
        },
      ],
      notes: [
        "Bicep talks to Azure's own deployment engine, so there's no state file: Azure compares the template with what's in the resource group. `what-if` is Bicep's plan. Resource types carry an API version (`Microsoft.Web/sites@2023-12-01`), which pins exactly which properties exist. This file compiles cleanly with `bicep build` 0.31.",
        "The choice usually comes down to scope: Bicep if you're all-in on Azure and want day-one support for new Azure features; Terraform if you manage several clouds or also configure things like DNS providers, GitHub or monitoring tools from the same code.",
      ],
    },
  ],
  quiz: [
    {
      question: "A plan shows -/+ for your production database, with # forces replacement next to the location. What will apply do?",
      answer: "Delete the database and create a new, empty one in the new location",
      distractors: ["Move the database and its data to the new location", "Update the location in place", "Nothing until you confirm the move separately"],
      why: "-/+ means destroy and create. Some settings can't be changed on an existing object, so Terraform replaces it, and the data goes with the old one. Read every -/+ in a plan.",
    },
    {
      question: "You rename resource \"azurerm_storage_account\" \"logs\" to \"audit_logs\" in the code. What does the plan show, and how do you avoid it?",
      answer: "Destroy the old address and create a new one; add a moved block from the old address to the new",
      distractors: ["An in-place rename; nothing to do", "An error until you rename it in the portal", "No changes, because the storage account's real name didn't change"],
      why: "Terraform tracks objects by their address in the code. A moved block (or terraform state mv) tells it that the address changed but the object is the same.",
    },
    {
      question: "Someone changed a setting in the portal. What happens at the next terraform apply?",
      answer: "Terraform sees the difference and changes it back to what the code says",
      distractors: ["Terraform updates the code to match", "Nothing, Terraform only tracks resources it created in this run", "The apply fails until the change is undone by hand"],
      why: "That's drift. The code is the source of truth, so hand changes are undone. Make changes in code, or, if a value is legitimately managed elsewhere, tell Terraform to ignore it (lifecycle { ignore_changes = [...] }).",
    },
    {
      question: "Why keep Terraform state in a shared, locked backend instead of on a laptop?",
      answer: "Everyone works from the same record of what exists, and locking stops two applies running at once",
      distractors: ["Local state files are slower", "Terraform refuses to run with local state", "So the state isn't sensitive any more"],
      why: "Two people with two state files would each think they own the resources and undo each other's work. A remote backend shares one copy and locks it during apply. It's still sensitive, so restrict access.",
    },
    {
      question: "What's Bicep's equivalent of terraform plan?",
      answer: "az deployment group what-if",
      distractors: ["bicep build", "az deployment group validate", "az bicep plan"],
      why: "what-if shows the creates, modifies and deletes a deployment would make. bicep build only compiles to ARM JSON, and validate only checks that the template is acceptable.",
    },
  ],
  pitfalls: [
    "Applying without reading the plan, or applying a different plan from the one that was reviewed.",
    "Committing secrets or the state file to Git. Use a remote backend, and pass secrets from a vault or the pipeline.",
    "Mixing hand changes and IaC on the same resources. Pick one owner per resource; drift will otherwise undo someone's work.",
    "One giant configuration for everything. Split by lifecycle (network, shared services, each app) so a plan is small enough to read and a mistake can't touch everything.",
    "Unpinned provider versions. Pin with `~>` and upgrade on purpose; the lock file (`.terraform.lock.hcl`) belongs in Git.",
  ],
  next: [
    { id: "cloud-observability", label: "Observability: Metrics, Logs, Traces and Alerts" },
    { id: "cloud-cicd", label: "CI/CD Pipelines" },
  ],
};
