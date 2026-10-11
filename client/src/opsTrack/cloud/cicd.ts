import { src, type OpsLessonData } from "../types.ts";

export const cicd: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "CI/CD is the automation between \"I pushed a commit\" and \"it's running in production\". Continuous integration (CI) means every push and every pull request is built and tested automatically, and people merge small changes into the main branch often, so problems show up within minutes instead of at a painful integration day. Continuous delivery (CD) means every change that passes is packaged and deployable, and releasing is a button press or an approval. Continuous deployment goes one step further: every change that passes goes to production with no human step.",
        "The pipeline is a list of steps defined in a file in the repository, run by a CI service on fresh, temporary machines called runners or agents: GitHub Actions, GitLab CI/CD, Azure Pipelines and Jenkins are the common ones. Because the definition is in the repo, it's reviewed and versioned like the code.",
      ],
    },
    {
      kind: "widget",
      widget: "cicdPipeline",
      title: "Try it: a pipeline run",
      intro: "Run the pipeline for a pull request or for a merge to main, make a stage fail, and approve or reject the production deployment.",
    },
    {
      kind: "code",
      title: "A GitHub Actions workflow",
      blocks: [
        {
          lang: "yaml",
          label: ".github/workflows/ci.yml",
          code: src`
name: ci

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: client/package-lock.json
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 10.0.x
      - run: npm ci
        working-directory: client
      - run: npx tsc -b
        working-directory: client
      - run: dotnet test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production # a required reviewer must approve
    permissions:
      contents: read
      id-token: write # lets the job sign in to Azure with OIDC, no stored password
    steps:
      - uses: actions/checkout@v4
      - uses: azure/login@v2
        with:
          client-id: ${"$"}{{ vars.AZURE_CLIENT_ID }}
          tenant-id: ${"$"}{{ vars.AZURE_TENANT_ID }}
          subscription-id: ${"$"}{{ vars.AZURE_SUBSCRIPTION_ID }}
      - name: Build and push the image
        run: |
          az acr login --name conperio
          docker build -t conperio.azurecr.io/academy:${"$"}{{ github.sha }} .
          docker push conperio.azurecr.io/academy:${"$"}{{ github.sha }}
      - name: Deploy that exact image
        run: |
          az webapp config container set ${"\\"}
            --name app-academy-prod --resource-group rg-academy-prod ${"\\"}
            --container-image-name conperio.azurecr.io/academy:${"$"}{{ github.sha }}
`,
        },
      ],
      notes: [
        "`on` says when it runs: for every pull request, and for pushes to main (which is what merging a pull request is). A workflow has jobs; each job runs on a fresh runner and is a list of steps. A step either runs shell commands (`run`) or uses a published action (`uses`), such as checking out the code or installing Node.js.",
        "`needs: test` makes deploy wait for test to succeed, and the `if` limits it to main, so pull requests are only built and tested. `environment: production` connects the job to an environment that can require a reviewer's approval, and holds that environment's own variables and secrets.",
        "The image is tagged with the commit's SHA (`github.sha`), so every image traces back to exactly one commit, and the deploy step deploys that tag rather than `latest`.",
        "`id-token: write` with `azure/login` uses OpenID Connect (OIDC): GitHub vouches for the workflow and Azure trusts that, so no long-lived cloud password has to be stored as a secret. Where a secret is unavoidable, it goes in the repository's or environment's secrets (`${{ secrets.NAME }}`), never in the YAML.",
      ],
    },
    {
      kind: "table",
      title: "Principles that make pipelines trustworthy",
      head: ["Principle", "Why"],
      rows: [
        ["Build once, deploy the same artifact everywhere", "Staging and production run the very same image. Rebuilding for production would mean shipping something that was never tested."],
        ["Configuration per environment, outside the artifact", "The image doesn't know whether it's in staging or production; settings and secrets come from the environment."],
        ["Fast feedback", "Lint and unit tests first, slower tests later; a pipeline that takes an hour gets ignored. Cache dependencies."],
        ["Required checks before merging", "Branch protection on main: the pipeline must pass and someone must review before the Merge button works."],
        ["Everything through the pipeline", "No hand-built hotfixes. A change that skipped the pipeline is a change nobody tested and nobody can reproduce."],
        ["Least privilege", "Pull requests from forks don't get secrets; deploy jobs get only the permissions they need."],
      ],
    },
    {
      kind: "table",
      title: "Releasing without downtime",
      head: ["Strategy", "How", "Trade-off"],
      rows: [
        ["Rolling", "replace instances a few at a time (Kubernetes' default)", "cheap and simple; old and new versions run side by side for a while, so they must be compatible"],
        ["Blue-green", "start the complete new version next to the old, then switch all traffic at once", "instant switch and instant rollback; twice the capacity during the release"],
        ["Canary", "send a small share of traffic (say 5%) to the new version, watch error rates, then increase", "problems hit few users; needs good monitoring and traffic splitting"],
        ["Feature flags", "deploy the code switched off, then turn it on per user or group from a settings service", "separates deploying from releasing; flags must be cleaned up afterwards"],
      ],
      notes: [
        "Whatever the strategy, know how to roll back before you roll out, and remember the database: a migration that drops a column breaks the old version still running during a rolling update. Change schemas in backward-compatible steps.",
      ],
    },
  ],
  quiz: [
    {
      question: "What's the difference between continuous delivery and continuous deployment?",
      answer: "With delivery every passing change is ready to release and a person decides when; with deployment it goes to production automatically",
      distractors: ["Delivery is for front ends, deployment for back ends", "They're two names for the same thing", "Deployment only builds; delivery also tests"],
      why: "Both automate everything up to production. The difference is whether the last step needs a human.",
    },
    {
      question: "The pipeline builds an image for staging and, after approval, builds it again for production. What's wrong with that?",
      answer: "Production gets an artifact that was never tested; build once and promote the same image",
      distractors: ["Nothing, the source code is the same", "It's slower but otherwise identical", "Images can't be built twice"],
      why: "A second build can pick up different dependency versions or base image updates. Promoting the exact tested image removes that gap.",
    },
    {
      question: "A pull request's pipeline is green, but the deploy job didn't run. Why might that be correct?",
      answer: "The deploy job only runs for pushes to main; pull requests are only built and tested",
      distractors: ["The pipeline is broken", "Deploy jobs only run at night", "Green pipelines skip deployment"],
      why: "The if: condition on the job limits deployment to main. Deploying every pull request to production would ship unreviewed code.",
    },
    {
      question: "Why use OIDC (id-token: write) to sign in to the cloud from a pipeline instead of storing a client secret?",
      answer: "No long-lived credential exists to be leaked or to expire; each run gets short-lived tokens",
      distractors: ["OIDC is faster", "Secrets can't be used in GitHub Actions", "OIDC also encrypts the code"],
      why: "Stored secrets get copied, logged by accident and forgotten. Federated credentials are tied to the specific repository and branch or environment.",
    },
    {
      question: "During a rolling update, version 2 drops a database column that version 1 still reads. What happens?",
      answer: "Version 1 instances that are still running start failing until the rollout finishes",
      distractors: ["Nothing, Kubernetes pauses old pods during migrations", "The rollout refuses to start", "Version 1 reads the column from a cache"],
      why: "Both versions run at the same time during a rolling update. Make schema changes backward compatible: add first, migrate, remove in a later release.",
    },
  ],
  pitfalls: [
    "Flaky tests that everybody re-runs until they pass. They train the team to ignore red pipelines; fix or quarantine them.",
    "Secrets printed in logs (`set -x`, echoing environment variables). CI logs are widely readable.",
    "Deploying `latest`, or anything not traceable to a commit.",
    "Manual steps \"just this once\". Put them in the pipeline or they'll be forgotten next time.",
    "No rollback plan. Practise one before you need it.",
  ],
  next: [
    { id: "cloud-iac", label: "Infrastructure as Code: Terraform and Bicep" },
    { id: "git-team-workflows", label: "Git in a Team: Pull Requests and Merge Strategies" },
  ],
};
