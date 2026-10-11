import { src, type OpsLessonData } from "../types.ts";

export const kubernetes: OpsLessonData = {
  parts: [
    {
      kind: "text",
      paragraphs: [
        "Kubernetes (often written K8s) runs containers across a group of machines called nodes, together a cluster. You describe what you want in YAML files (\"three copies of academy:1.5.0, reachable on port 80\"), send them to the cluster's API with `kubectl apply`, and controllers keep changing reality until it matches. The Linux section's Containers and Kubernetes lesson shows that reconciliation loop and rolling updates. This one covers the parts you use every day: how objects find each other through labels, health checks, configuration, resource limits, and how to work out why a pod isn't running.",
        "Most companies don't run Kubernetes themselves: they rent a managed cluster (AKS on Azure, EKS on AWS, GKE on Google Cloud) where the provider runs the control plane, the brain of the cluster, and you manage the nodes and what runs on them.",
      ],
    },
    {
      kind: "table",
      title: "The objects you'll meet first",
      head: ["Object", "What it is"],
      rows: [
        ["Pod", "one or more containers that are scheduled together and share a network address. The smallest thing Kubernetes runs. Pods are disposable: they get replaced, not repaired."],
        ["Deployment", "keeps N identical pods running from a template, and replaces them gradually when the template changes (a rolling update)"],
        ["Service", "one stable name and IP address in front of a changing set of pods, spreading traffic across the ready ones. Other apps call `http://academy-api`, never a pod."],
        ["Ingress", "routes HTTP traffic from outside the cluster to Services by host name and path, usually with TLS"],
        ["ConfigMap / Secret", "settings and secrets kept outside the image and handed to pods as environment variables or files"],
        ["Namespace", "a folder for objects: one per team or app, with its own permissions and quotas"],
        ["PersistentVolumeClaim", "a request for storage that outlives any pod, for databases and uploads"],
      ],
    },
    {
      kind: "code",
      title: "A Deployment, its Service and its configuration",
      blocks: [
        {
          lang: "yaml",
          label: "academy-api.yaml",
          code: src`
apiVersion: apps/v1
kind: Deployment
metadata:
  name: academy-api
  namespace: academy
spec:
  replicas: 3
  selector:
    matchLabels:
      app: academy
      tier: api
  template:
    metadata:
      labels:
        app: academy
        tier: api
    spec:
      containers:
        - name: api
          image: conperio.azurecr.io/academy:1.5.0
          ports:
            - containerPort: 8080
          envFrom:
            - configMapRef:
                name: academy-config
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: academy-db
                  key: password
          resources:
            requests:
              cpu: 250m
              memory: 256Mi
            limits:
              memory: 512Mi
          readinessProbe:
            httpGet:
              path: /api/health
              port: 8080
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /api/health
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
---
apiVersion: v1
kind: Service
metadata:
  name: academy-api
  namespace: academy
spec:
  selector:
    app: academy
    tier: api
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: academy-config
  namespace: academy
data:
  LOG_LEVEL: info
  FEATURE_NEW_EDITOR: "true"
`,
        },
      ],
      notes: [
        "Labels are the glue. The Deployment's `selector` must match the labels in its pod `template`; the Service's `selector` picks the pods it sends traffic to. Nothing refers to a pod by name.",
        "`cpu: 250m` means 250 millicores, a quarter of a CPU; `256Mi` is 256 mebibytes. Requests are what the scheduler reserves when choosing a node; limits are the ceiling. A container that goes over its memory limit is killed (OOMKilled); one that hits a CPU limit is slowed down instead. Many teams set a memory limit but no CPU limit, as here.",
        "The Secret is created separately, for example with `kubectl create secret generic academy-db --from-literal=password=...`. Secret values are only base64-encoded, not encrypted: anyone allowed to read Secrets in the namespace can read the password, so access to them must be restricted, and many teams load them from a vault (Azure Key Vault, AWS Secrets Manager) instead.",
      ],
    },
    {
      kind: "widget",
      widget: "k8sSelectors",
      title: "Try it: which pods does the Service send traffic to?",
      intro: "Edit the Service's selector and flip pods' readiness.",
    },
    {
      kind: "table",
      title: "Three probes",
      head: ["Probe", "Question it asks", "When it fails"],
      rows: [
        ["Readiness", "Can this pod take requests right now?", "the pod is removed from the Service's endpoints until it passes again. Nothing is restarted."],
        ["Liveness", "Is this process stuck beyond repair?", "the container is restarted"],
        ["Startup", "Has a slow-starting app finished starting?", "liveness and readiness checks wait until it passes; if it never does, the container is restarted"],
      ],
      notes: [
        "A liveness probe that checks the database is a classic outage multiplier: the database has a hiccup, every pod fails liveness, Kubernetes restarts all of them at once, and now nothing is running. Liveness should check only the process itself; readiness can check its dependencies.",
      ],
    },
    {
      kind: "code",
      title: "kubectl for troubleshooting",
      blocks: [
        {
          lang: "bash",
          code: src`
kubectl config current-context                 # which cluster am I talking to?
kubectl get pods -n academy                    # -n picks the namespace
kubectl get pods -n academy --show-labels
kubectl describe pod academy-api-6f8d7c5b9-w2zkx -n academy   # read the Events at the bottom
kubectl logs academy-api-6f8d7c5b9-w2zkx -n academy --previous # output of the crashed container
kubectl get events -n academy --sort-by=.lastTimestamp
kubectl get endpointslices -n academy -l kubernetes.io/service-name=academy-api   # which pod IPs is the Service using?
kubectl rollout status deployment/academy-api -n academy
kubectl rollout undo deployment/academy-api -n academy         # back to the previous version
`,
        },
        {
          lang: "bash",
          code: "kubectl get pods -n academy",
          unverified: true,
          output: src`
NAME                           READY   STATUS             RESTARTS      AGE
academy-api-7d9f8b6c4-2xkqp    1/1     Running            0             3h12m
academy-api-7d9f8b6c4-m8w2t    1/1     Running            0             3h12m
academy-api-5c47d9f8b-q4lzr    0/1     Running            0             4m
academy-api-6f8d7c5b9-w2zkx    0/1     CrashLoopBackOff   5 (41s ago)   6m
academy-api-84b6d9c7f-tq9mx    0/1     ImagePullBackOff   0             2m
`,
        },
      ],
      notes: [
        "Pod names are the Deployment name, a hash of the pod template (one per version) and a random suffix. Different hashes in one list mean two versions are running, as in the middle of a rollout.",
      ],
    },
    {
      kind: "table",
      title: "What the status column is telling you",
      head: ["Status", "Usual cause", "Look at"],
      rows: [
        ["Pending", "no node has enough free CPU or memory for the requests, or a volume can't be attached", "`kubectl describe pod`: the Events explain why scheduling failed"],
        ["ImagePullBackOff / ErrImagePull", "wrong image name or tag, or the cluster isn't allowed to pull from the private registry", "the image reference, and pull credentials"],
        ["CrashLoopBackOff", "the container starts and exits, again and again; Kubernetes waits longer between each restart", "`kubectl logs --previous`: usually a missing setting or a failed connection at start-up"],
        ["OOMKilled (in describe, exit code 137)", "the container used more memory than its limit", "memory use, a leak, or a limit set too low"],
        ["CreateContainerConfigError", "a ConfigMap or Secret (or a key in it) that the pod refers to doesn't exist", "the names in `envFrom` and `secretKeyRef`"],
        ["Running but 0/1 ready", "the readiness probe is failing; the pod gets no traffic", "the probe's path and port, and the app's logs"],
      ],
    },
  ],
  quiz: [
    {
      question: "A Service has selector app: academy, tier: api. A pod has labels app: academy, tier: api, version: v2, and is ready. Does it get traffic?",
      answer: "Yes: it has every label in the selector; extra labels don't matter",
      distractors: ["No, because version isn't in the selector", "Only if the Service also selects version: v2", "No, Services select pods by name"],
      why: "A selector matches pods that have all of its labels. Extra labels on the pod are ignored, which is how canary releases work: old and new versions share the selected labels.",
    },
    {
      question: "kubectl get pods shows CrashLoopBackOff. What's the most useful next command?",
      answer: "kubectl logs <pod> --previous",
      distractors: ["kubectl delete pod <pod>", "kubectl get nodes", "kubectl rollout restart deployment"],
      why: "The current container may have only just started; --previous shows the output of the one that crashed, which usually says why. Deleting the pod just gets you a new pod that crashes the same way.",
    },
    {
      question: "A container uses more memory than its limit. What happens?",
      answer: "It's killed (OOMKilled) and restarted",
      distractors: ["It's slowed down until memory use drops", "The node gives it more memory", "Nothing, limits are advisory"],
      why: "Memory can't be taken back from a running process, so the kernel kills it. CPU is different: over the CPU limit, the container is throttled, not killed.",
    },
    {
      question: "A pod's readiness probe starts failing. What does Kubernetes do?",
      answer: "Stops sending it traffic through the Service, without restarting it",
      distractors: ["Restarts the container", "Deletes the pod and creates a new one", "Nothing until the liveness probe also fails"],
      why: "Readiness controls traffic; liveness controls restarts. A pod can be alive but temporarily not ready, for example while warming a cache.",
    },
    {
      question: "Why is it risky to make the liveness probe check that the database is reachable?",
      answer: "A short database outage would make every pod fail liveness and be restarted at the same time",
      distractors: ["Liveness probes can't make network calls", "It makes pods start more slowly", "It exposes the database password"],
      why: "Restarting the app doesn't fix the database, and restarting everything at once turns a blip into an outage. Check dependencies in readiness, if at all.",
    },
  ],
  pitfalls: [
    "Running `kubectl` against the wrong cluster. Check `kubectl config current-context` before anything destructive, and make production contexts look different in your prompt.",
    "No resource requests: the scheduler packs too many pods on a node and they starve each other.",
    "Fixing things with `kubectl edit` in production. The next deploy from the YAML in Git undoes your fix; change the YAML instead.",
    "Treating Secrets as encrypted. Restrict who can read them.",
    "One replica of everything. A node being drained for an upgrade then means downtime.",
  ],
  next: [
    { id: "cloud-cicd", label: "CI/CD Pipelines" },
    { id: "cloud-observability", label: "Observability: Metrics, Logs, Traces and Alerts" },
  ],
};
