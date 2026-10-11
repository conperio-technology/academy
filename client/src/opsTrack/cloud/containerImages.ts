import { src, type OpsLessonData } from "../types.ts";

export const containerImages: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "A container image is a packaged filesystem plus a little metadata (which command to start, which port, which user): everything an app needs to run, from the operating system's libraries up to your compiled code. Run it and you get a container, an ordinary process the Linux kernel fences off. The Containers and Kubernetes lesson in the Linux section shows how layers and the build cache work; this lesson is about what happens around the image in a team: naming it, storing it, and making sure it's small, safe and the one you meant to deploy.",
      ],
    },
    {
      kind: "table",
      title: "Anatomy of an image name",
      head: ["Part", "Example", "Meaning"],
      rows: [
        ["Registry", "`conperio.azurecr.io`", "the server that stores images. Left out, Docker assumes Docker Hub (`docker.io`)."],
        ["Repository", "`academy`", "one app's images, all versions"],
        ["Tag", "`:1.5.0`", "a human-friendly, movable name for one version. Left out, it means `:latest`, which is only a name, not \"the newest\"."],
        ["Digest", "`@sha256:3f9a1c0e...`", "the SHA-256 hash of the image manifest: an exact, unchangeable identity"],
      ],
      notes: [
        "So `nginx` really means `docker.io/library/nginx:latest`. Registries you'll meet: Docker Hub, GitHub Container Registry (ghcr.io), Azure Container Registry, Amazon ECR, Google Artifact Registry, and self-hosted ones such as Harbor. Company registries are private: `docker login` (or `az acr login`) first.",
      ],
    },
    {
      kind: "widget",
      widget: "imageTags",
      title: "Try it: tags move, digests don't",
      intro: "Step through three pushes to a registry and see what three servers would run after a restart.",
    },
    {
      kind: "code",
      title: "A real multi-stage Dockerfile: this academy's own",
      blocks: [
        {
          lang: "dockerfile",
          label: "Dockerfile",
          code: src`
FROM node:22-alpine AS client
WORKDIR /src/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server
WORKDIR /src
COPY server/server.csproj server/
COPY runner/runner.csproj runner/
RUN dotnet restore server/server.csproj
COPY server/ server/
COPY runner/ runner/
RUN dotnet publish server/server.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=server /app ./
COPY --from=client /src/client/dist ./wwwroot
RUN mkdir -p /data && chown app /data
ENV ASPNETCORE_HTTP_PORTS=8080 ${"\\"}
    DbPath=/data/progress.db
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "server.dll"]
`,
        },
      ],
      notes: [
        "Three stages. The first two use big images full of build tools (Node.js, the .NET SDK) to compile the front end and the server. The last stage starts again from the much smaller ASP.NET runtime image and copies in only the build output with `COPY --from`. Compilers, source code and package caches never reach the image that runs in production, which makes it smaller and gives attackers less to work with.",
        "`USER app` runs the process as the unprivileged user the .NET images include, instead of root. `ENTRYPOINT` in the JSON (exec) form makes the app process PID 1, so it receives the SIGTERM a container platform sends when it stops a container.",
      ],
    },
    {
      kind: "code",
      title: "Build, tag, push, run",
      blocks: [
        {
          lang: "bash",
          code: src`
docker build -t conperio.azurecr.io/academy:1.5.0 .
docker tag conperio.azurecr.io/academy:1.5.0 conperio.azurecr.io/academy:latest
az acr login --name conperio          # or: docker login conperio.azurecr.io
docker push conperio.azurecr.io/academy:1.5.0
docker push conperio.azurecr.io/academy:latest

docker run -d --name academy -p 8080:8080 -v academy-data:/data conperio.azurecr.io/academy:1.5.0
docker logs -f academy                # follow its output
docker exec -it academy sh            # a shell inside the running container (if it has one)
docker image inspect --format '{{index .RepoDigests 0}}' conperio.azurecr.io/academy:1.5.0
`,
        },
      ],
      notes: [
        "Tagging doesn't copy anything: `docker image ls` shows both tags with the same image ID. `-p 8080:8080` publishes the container's port 8080 on the host; `-v academy-data:/data` mounts a named volume so the database survives the container being replaced. Anything written elsewhere in the container is lost when it's removed.",
      ],
    },
    {
      kind: "table",
      title: "Habits of a good production image",
      head: ["Habit", "Why"],
      rows: [
        ["Pin the base image (`node:22-alpine`, not `node`), and rebuild regularly", "Pinning makes builds repeatable; rebuilding picks up the base image's security fixes. An image that's never rebuilt never gets patched."],
        ["Small base images: `-alpine`, `-slim`, distroless or chiseled", "Fewer packages means fewer vulnerabilities to patch and a faster pull."],
        ["Run as a non-root user", "If the app is compromised, the attacker isn't root inside the container."],
        ["No secrets in the image", "Every layer is kept. A password copied in and deleted in a later step is still in the earlier layer, readable by anyone who can pull the image. Pass secrets at run time (environment, mounted files, a secret store)."],
        ["A `.dockerignore` file", "Keeps `.git`, `node_modules`, local `.env` files and build output out of the build context, so they can't end up in the image."],
        ["Scan images in CI", "Tools such as Trivy, Grype or Docker Scout list known vulnerabilities in the packages inside; fail the build on critical ones."],
        ["Deploy by digest, or by tags nobody reuses", "So what runs is exactly what was tested."],
      ],
    },
  ],
  quiz: [
    {
      question: "A Kubernetes Deployment uses image academy:latest. Someone pushes a new build as latest. What do the running pods do?",
      answer: "Nothing yet; pods started later may pull the new image, so different pods can end up running different versions",
      distractors: ["They all restart with the new image immediately", "The push is rejected because latest is in use", "They keep the old image forever"],
      why: "Running containers never change their image. A pod that's rescheduled or restarted on another node pulls whatever latest points at then. That's why production deploys pin a version or a digest.",
    },
    {
      question: "A Dockerfile has COPY .env /app/.env and then RUN rm /app/.env. Is the secret gone from the image?",
      answer: "No: it's still in the layer created by the COPY, and anyone who can pull the image can extract it",
      distractors: ["Yes, the RUN step deleted it", "Yes, because .env files are ignored automatically", "Only if the image is pushed to a public registry"],
      why: "Each instruction adds a layer on top; deleting a file only hides it in a later layer. Keep secrets out of the build context with .dockerignore and supply them at run time.",
    },
    {
      question: "What does a multi-stage build achieve?",
      answer: "The build tools stay in earlier stages; the final image contains only what's needed to run",
      distractors: ["It builds for several CPU architectures at once", "It runs several containers from one image", "It splits the app into microservices"],
      why: "COPY --from copies just the compiled output into a fresh, smaller base image. (Building for several architectures is a different feature: docker buildx with --platform.)",
    },
    {
      question: "Which reference is guaranteed to give the same image every time it's pulled?",
      answer: "conperio.azurecr.io/academy@sha256:3f9a...",
      distractors: ["conperio.azurecr.io/academy:latest", "conperio.azurecr.io/academy:1.5.0", "conperio.azurecr.io/academy:stable"],
      why: "A digest is a hash of the content, so it can't point at anything else. Tags, even version-number tags, can be overwritten unless the registry makes them immutable.",
    },
  ],
  pitfalls: [
    "Deploying `:latest` to production. You can't tell what's running, and a restart can silently upgrade.",
    "Running as root because it's the default.",
    "Building on a laptop and pushing by hand. Build in CI from a commit, so every image can be traced to its source.",
    "Huge images (a full SDK, build caches, test data). They're slow to pull on every new node and full of packages to patch.",
    "Writing data inside the container's filesystem. It disappears when the container is replaced; use a volume or a database.",
  ],
  next: [
    { id: "cloud-kubernetes", label: "Kubernetes in Practice" },
    { id: "cloud-cicd", label: "CI/CD Pipelines" },
    { id: "linux-containers", label: "Containers and Kubernetes (Linux section)" },
  ],
};
