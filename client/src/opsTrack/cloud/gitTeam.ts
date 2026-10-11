import { src, type OpsLessonData } from "../types.ts";
import { GIT_CAPTURES } from "../../components/tools/ops/captures.ts";

export const gitTeam: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Git Basics and Git Branching cover commits and branches on your own machine. In a team, there's also a shared copy of the repository on a server such as GitHub, GitLab or Azure DevOps, called a remote (by convention `origin`), and a process around it: work on a branch, open a pull request (GitLab calls it a merge request), get it reviewed and tested, then merge it into main.",
      ],
    },
    {
      kind: "table",
      title: "Talking to the remote",
      head: ["Command", "What it does"],
      rows: [
        ["`git clone URL`", "copies the whole repository and sets up `origin`"],
        ["`git fetch`", "downloads new commits and branches from origin into `origin/main` and friends, without touching your own branches. Always safe."],
        ["`git pull`", "fetch, then bring `origin/<branch>` into your current branch. If both sides have new commits you choose how: `--rebase`, `--no-rebase` (merge) or set `pull.rebase` once"],
        ["`git push -u origin my-branch`", "uploads your branch; `-u` remembers the link so later a plain `git push` works"],
        ["`git switch -c my-branch origin/main`", "starts a new branch from the latest main on the server"],
      ],
    },
    {
      kind: "walkthrough",
      title: "A pull request from start to finish",
      steps: [
        { title: "Start from the latest main", body: "Fetch first, so your branch starts from what everyone else has, not from your week-old copy.", code: "git fetch\ngit switch -c feature/export origin/main", lang: "bash" },
        { title: "Commit in small, meaningful steps", body: "Each commit does one thing and says why in its message. The first line is a short summary in the imperative (\"Add CSV export\"), under about 50 characters.", code: "git add src/export.ts\ngit commit -m \"Add CSV export for orders\"", lang: "bash" },
        { title: "Push and open the pull request", body: "Push the branch, then open a pull request on the website (or with the GitHub CLI). The description says what changed, why, and how it was tested; link the ticket. Open it early as a draft if you want feedback before it's finished.", code: "git push -u origin feature/export\ngh pr create --fill --draft", lang: "bash" },
        { title: "CI runs and people review", body: "The pipeline builds and tests the branch. Reviewers comment on lines, ask questions and approve or request changes. Branch protection on main usually requires both a green pipeline and at least one approval." },
        { title: "Respond with more commits", body: "Fix what reviewers found by pushing more commits to the same branch; the pull request updates itself. Reply to each comment so reviewers can see what changed." },
        { title: "Merge and clean up", body: "Merge with the strategy your team agreed on (below), delete the branch on the server (a button on the pull request), and the deployment pipeline takes it from there. Locally, update main and delete your copy of the branch. After a squash merge, `git branch -d` refuses because Git can't see the branch's own commits in main; check the pull request is merged and use `-D`.", code: "git switch main\ngit pull\ngit branch -d feature/export", lang: "bash" },
      ],
    },
    {
      kind: "widget",
      widget: "gitTeamFlow",
      title: "Try it: three ways to merge the same branch",
      intro: "Real git 2.43 runs. Compare what main's history looks like afterwards.",
    },
    {
      kind: "code",
      title: "When someone pushed first",
      blocks: [
        {
          lang: "text",
          label: "terminal",
          code: GIT_CAPTURES.push,
        },
      ],
      notes: [
        "Bo pushed a commit to main after Ana last fetched, so Ana's push is rejected: accepting it would throw Bo's commit away. `git pull --rebase` fetches Bo's commit and replays Ana's commit on top of it (giving it a new hash), and then the push is a simple fast-forward. `git pull --no-rebase` would also work, but adds a merge commit. A plain `git pull` only does either if you've told Git which one you want (for example `git config --global pull.rebase true`); with no setting, recent Git stops with \"fatal: Need to specify how to reconcile divergent branches\" and asks you to choose `--rebase`, `--no-rebase` or `--ff-only`. Here a local bare repository stands in for GitHub, which is why the remote is a file path.",
        "Never use plain `git push --force` on a shared branch: it overwrites whatever is on the server. If you've rebased your own feature branch and need to push it, `git push --force-with-lease` refuses if someone else has pushed to it since you last fetched.",
      ],
    },
    {
      kind: "table",
      title: "Being a good reviewer, and a good author",
      head: ["As the author", "As a reviewer"],
      rows: [
        ["Keep pull requests small: a few hundred lines is reviewable, a few thousand isn't", "Review promptly; a pull request waiting three days blocks someone"],
        ["Review your own diff first; remove debug code and unrelated changes", "Look for correctness, clarity and missing tests before style; let linters argue about formatting"],
        ["Explain the why in the description, and how you tested it", "Ask questions rather than issuing orders, and say which comments are blocking"],
        ["Don't take comments personally; they're about the code", "Approve when it's good enough, not when it's how you'd have written it"],
      ],
    },
    {
      kind: "table",
      title: "Team branching models",
      head: ["Model", "How it works", "Suits"],
      rows: [
        ["Trunk-based development", "short-lived branches (hours to a couple of days) merged into main often; unfinished features hidden behind feature flags; main is always releasable", "teams with good automated tests and continuous delivery; most web services"],
        ["GitHub flow", "branch from main, pull request, merge, deploy; the same idea, described around pull requests", "most teams using GitHub"],
        ["GitFlow", "long-lived develop and main branches, plus release and hotfix branches", "software shipped in versioned releases (installers, firmware, libraries), not continuously deployed services"],
      ],
      notes: [
        "Whatever the model, long-lived branches are what hurt: the longer a branch lives, the more main moves underneath it and the bigger the merge conflict at the end. Merge main into your branch, or rebase it, regularly.",
      ],
    },
    {
      kind: "code",
      title: "Keeping secrets and junk out of the repository",
      blocks: [
        {
          lang: "text",
          label: ".gitignore",
          code: src`
# dependencies and build output
node_modules/
bin/
obj/
dist/

# local settings and secrets
.env
*.local.json

# editor and OS files
.vscode/
.DS_Store
`,
        },
      ],
      notes: [
        "A secret that's been pushed is compromised, even if the next commit deletes it: it's still in the history, and in every clone and fork. Rotate it (issue a new one, revoke the old) first, then clean up. GitHub's push protection and secret scanning catch many common key formats before or after the push.",
        "A `CODEOWNERS` file names who must review changes to which paths, for example the platform team for `/k8s/` and `/.github/workflows/`.",
      ],
    },
  ],
  quiz: [
    {
      question: "What's the difference between git fetch and git pull?",
      answer: "fetch only downloads new commits into origin/*; pull fetches and then merges or rebases them into your current branch",
      distractors: ["fetch downloads one branch, pull downloads all of them", "pull is the old name for fetch", "fetch also pushes your commits"],
      why: "fetch is always safe and changes none of your branches. pull changes your current branch.",
    },
    {
      question: "Your push is rejected with \"Updates were rejected because the remote contains work that you do not have locally\". What's the right next step?",
      answer: "git pull --rebase (or git pull --no-rebase), resolve any conflicts, then push again",
      distractors: ["git push --force", "Delete your local repository and clone again", "Create a new branch and push that instead"],
      why: "Someone else pushed first. Integrate their commits, then push. --force would erase their work from the server. A plain git pull works too only if pull.rebase (or pull.ff) is set; otherwise Git asks you to choose.",
    },
    {
      question: "Your team uses squash merging. What does main's history contain for a pull request with seven commits?",
      answer: "One new commit containing all seven commits' changes",
      distractors: ["All seven commits plus a merge commit", "All seven commits in a straight line", "Nothing until the branch is deleted"],
      why: "Squash and merge combines the branch's changes into one commit on main, usually titled with the pull request number.",
    },
    {
      question: "After rebasing your feature branch, which you alone work on, the push is rejected. Which command should you use?",
      answer: "git push --force-with-lease",
      distractors: ["git push --force", "git pull, then git push", "git push --set-upstream"],
      why: "Rebasing rewrote the commits, so the branch on the server isn't an ancestor any more and a force push is needed. --force-with-lease refuses if someone else pushed to the branch since your last fetch. Pulling would merge the old commits back in.",
    },
    {
      question: "An API key was committed and pushed an hour ago. What's the first thing to do?",
      answer: "Revoke the key and issue a new one",
      distractors: ["Push a commit that deletes the file", "Rewrite the history to remove it", "Make the repository private"],
      why: "Assume it's already been copied: it's in the history and every clone. Removing it from history is a clean-up step, not a fix.",
    },
  ],
  pitfalls: [
    "Huge pull requests that mix a refactoring, a feature and formatting changes. Nobody can review them properly.",
    "Long-lived branches. Merge small pieces often.",
    "Rebasing or force-pushing a branch other people have based work on.",
    "Committing directly to main. Protect the branch so every change goes through a pull request and CI.",
    "Reviews that only comment on style. Automate style; spend review time on logic, tests and naming.",
  ],
  next: [
    { id: "cloud-cicd", label: "CI/CD Pipelines" },
    { id: "git-branching", label: "Git Branching & Merging" },
  ],
};
