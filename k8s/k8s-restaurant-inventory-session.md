# Kubernetes Session — Restaurant Inventory Management
**Date:** April 25, 2026  
**Stack:** Minikube · Next.js · PostgreSQL · SQLite · EFS (hostPath) · CronJob · Sidecar Pattern

---

## 1. Architecture Overview

### What We Built

```
┌─────────────────────────────────────────────────────────────┐
│                        EFS (hostPath PV)                    │
│                     /mnt/data/restaurant-inventory          │
│                        inventory.db (224K)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ writes every 10 min
                           │
                  ┌────────▼────────┐
                  │    CronJob      │
                  │ sqlite-cache-job│
                  │ init-cache.js   │
                  │ → fetches API   │
                  │ → builds SQLite │
                  │ → saves to EFS  │
                  └─────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                     Deployment Pod (x2)                      │
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │ initContainer│    │   sidecar    │    │   main app     │  │
│  │  init-cache  │    │ cache-sidecar│    │  Next.js :3000 │  │
│  │             │    │              │    │                │  │
│  │ runs ONCE   │    │ runs FOREVER │    │ reads SQLite   │  │
│  │ on startup  │    │ polls every  │    │ from /data/    │  │
│  │             │    │ 5 minutes    │    │ writes to PG   │  │
│  └──────┬──────┘    └──────┬───────┘    └───────▲────────┘  │
│         │                  │                    │           │
│         └──────────────────▼────────────────────┘           │
│                      emptyDir (shared-data)                  │
│                      /data/inventory.db                      │
│                      (ephemeral, pod-scoped)                 │
└──────────────────────────────────────────────────────────────┘
```

### Volume Flow

| Volume | Type | Mount in Pod | Purpose |
|---|---|---|---|
| `efs-storage` | PVC (hostPath) | `/efs-data` | Persistent shared DB across pods |
| `shared-data` | emptyDir | `/data` | Fast local reads for the app |
| `temp-storage` | emptyDir | `/tmp` | Next.js scratch space |

### Why Two Volumes?

- **EFS** is the single source of truth — CronJob writes here, survives pod restarts
- **emptyDir** is the fast local copy — app reads from here (no network latency)
- **init-cache** bridges them at startup: copies EFS → emptyDir
- **cache-sidecar** keeps emptyDir fresh: polls EFS every 5 min, copies if checksum changes

---

## 2. Files Created

### `pv-pvc.yml`

```yaml
# PersistentVolume — hostPath (minikube equivalent of AWS EFS)
# On EKS: swap hostPath for EFS StorageClass — PVC stays the same
apiVersion: v1
kind: PersistentVolume
metadata:
  name: efs-pv
  namespace: inventory
  labels:
    type: efs-local
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteMany             # multiple pods can mount simultaneously
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /mnt/data/restaurant-inventory
    type: DirectoryOrCreate
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: efs-pvc
  namespace: inventory
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: manual
  resources:
    requests:
      storage: 5Gi
  selector:
    matchLabels:
      type: efs-local
```

### `cronjob.yml`

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: sqlite-cache-job
  namespace: inventory
spec:
  schedule: "*/10 * * * *"
  concurrencyPolicy: Forbid         # skip if previous run still going
  startingDeadlineSeconds: 300
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  jobTemplate:
    spec:
      backoffLimit: 3
      activeDeadlineSeconds: 600    # kill if running > 10 min
      template:
        spec:
          restartPolicy: OnFailure  # REQUIRED for CronJob pods
          containers:
            - name: sqlite-cache-fetcher
              image: ashimsharma/restaurant-inventory:latest
              imagePullPolicy: Never
              command:
                - sh
                - -c
                - |
                  mkdir -p /data               # CRITICAL — script fails without this
                  node scripts/init-cache.js
              envFrom:
                - configMapRef:
                    name: app-config
              volumeMounts:
                - name: efs-storage
                  mountPath: /data             # script writes to /data/inventory.db
              resources:
                requests:
                  cpu: "250m"
                  memory: "512Mi"
                limits:
                  cpu: "500m"
                  memory: "1Gi"
          volumes:
            - name: efs-storage
              persistentVolumeClaim:
                claimName: efs-pvc
```

### `deployment.yml` (key sections)

```yaml
initContainers:
  - name: init-cache
    image: busybox:latest
    command:
      - sh
      - -c
      - |
        mkdir -p /data
        if [ -f /efs-data/inventory.db ]; then
          cp /efs-data/inventory.db /data/inventory.db
          echo "Copied from EFS."
        else
          echo "EFS empty — app starts without cache."
        fi
    volumeMounts:
      - name: shared-data
        mountPath: /data
      - name: efs-storage
        mountPath: /efs-data
        readOnly: true

containers:
  - name: cache-sidecar
    image: busybox:latest
    command:
      - sh
      - -c
      - |
        LAST_CHECKSUM=""
        while true; do
          sleep 300
          if [ -f /efs-data/inventory.db ]; then
            CURRENT_CHECKSUM=$(md5sum /efs-data/inventory.db | awk '{print $1}')
            if [ "$CURRENT_CHECKSUM" != "$LAST_CHECKSUM" ]; then
              cp /efs-data/inventory.db /data/inventory.db.tmp
              mv /data/inventory.db.tmp /data/inventory.db   # atomic rename
              LAST_CHECKSUM="$CURRENT_CHECKSUM"
            fi
          fi
        done
    volumeMounts:
      - name: shared-data
        mountPath: /data
      - name: efs-storage
        mountPath: /efs-data
        readOnly: true

  - name: app
    image: ashimsharma/restaurant-inventory:latest
    volumeMounts:
      - name: shared-data
        mountPath: /data          # reads /data/inventory.db
      - name: temp-storage
        mountPath: /tmp

volumes:
  - name: shared-data
    emptyDir:
      sizeLimit: 1Gi
  - name: efs-storage
    persistentVolumeClaim:
      claimName: efs-pvc
  - name: temp-storage
    emptyDir: {}
```

---

## 3. Bugs Found and Fixed

### deployment.yml bugs

| Bug | Problem | Fix |
|---|---|---|
| `cache-sidecar` in `initContainers` | Infinite loop blocks main app from starting — initContainers must exit | Moved to `containers` |
| Volume name typo | `shared-date` vs `shared-data` | Fixed to `shared-data` |
| Invalid mountPath | `mountPath: /efs-storage` (volume name used as path) | Fixed to `mountPath: /efs-data` |
| Broken checksum logic | Never compared old vs new checksum — copied every poll | Added `!= LAST_CHECKSUM` check |
| Filename typo | `meald_cache.db` | Fixed to `meal_cache.db` |
| Missing volume in main app | `sqlite-cache` volume referenced but never defined | Replaced with `shared-data` |

### cronjob.yml bugs

| Bug | Problem | Fix |
|---|---|---|
| `kind: Cronjob` | Kubernetes is case-sensitive — must be `CronJob` | Fixed capitalisation |
| `resources` nested inside `volumeMounts` | Wrong indentation — treated as child of mounts | Fixed to sibling of `volumeMounts` |
| Volume name mismatch | Defined as `efs` but referenced as `efs-storage` | Made consistent: `efs-storage` |
| Missing `restartPolicy` | Required for CronJob pod templates | Added `restartPolicy: OnFailure` |
| Mount path wrong | EFS mounted at `/app/data` but script writes to `/data` | Fixed to `/data` |
| Missing `mkdir -p` | Script fails if `/data` directory doesn't exist on EFS | Added `mkdir -p /data` before script |

---

## 4. Debugging Journey — What We Did and Why

### Phase 1 — Identifying the failure

```bash
kubectl get jobs -n $NS
# → All three recent jobs showed STATUS: Failed
```

**Why:** Jobs failed but pods were already deleted — Kubernetes cleans up CronJob pods quickly after failure. We couldn't see logs.

### Phase 2 — Catching the pod before it disappears

```bash
kubectl create job --from=cronjob/sqlite-cache-job manual-debug -n $NS
kubectl get pods -n $NS -w
```

**Why:** `--from=cronjob` creates a one-off Job using the exact same spec as the CronJob. Watching with `-w` lets us see the pod appear in real time.

**Problem:** Pod still disappeared too fast before we could grab logs.

### Phase 3 — Using `kubectl run` as a debug sandbox

```bash
kubectl run debug-job -n $NS \
  --image=ashimsharma/restaurant-inventory:latest \
  --image-pull-policy=Never \
  --restart=Never \
  --command -- node scripts/init-cache.js
```

**Why:** `kubectl run` with `--restart=Never` creates a plain pod (not a Job). It stays in `Error` state after failing — it's never auto-deleted. Gives us time to read logs.

**Key lesson:** `--env-from` is not supported by `kubectl run`. Use `--overrides` for that.

### Phase 4 — First error: directory doesn't exist

```bash
kubectl logs debug-job -n $NS
# → [init] Fatal: Cannot open database because the directory does not exist
```

**Why:** `init-cache.js` hardcodes `DB_PATH = '/data/inventory.db'` but `/data` didn't exist in the CronJob pod. The CronJob was mounting EFS at `/app/data` — wrong path.

**Fix:** Added `mkdir -p /data` before the script, and changed CronJob mount to `/data`.

### Phase 5 — Second error: Postgres connection failed

```bash
kubectl logs debug-job-3 -n $NS
# → [init] SQLite schema ready
# → [init] SQLite: upserted 14 categories  
# → [init] Fatal:                            ← empty message = connection error
```

**Why:** The debug pod had no env vars (no `--env-from`), so `POSTGRES_HOST`, `POSTGRES_USER` etc. were all undefined. Postgres connection failed silently.

**Fix:** Used `--overrides` to inject `envFrom`:

```bash
kubectl run debug-job-4 -n $NS \
  --image=ashimsharma/restaurant-inventory:latest \
  --image-pull-policy=Never \
  --restart=Never \
  --overrides='{
    "spec": {
      "containers": [{
        "name": "debug-job-4",
        "image": "ashimsharma/restaurant-inventory:latest",
        "imagePullPolicy": "Never",
        "command": ["sh", "-c", "mkdir -p /data && node scripts/init-cache.js"],
        "envFrom": [{"configMapRef": {"name": "app-config"}}]
      }]
    }
  }' --command -- sh -c "mkdir -p /data && node scripts/init-cache.js"
```

### Phase 6 — Reading the actual script

```bash
kubectl exec -it app-7c4889fbb4-pgvm5 -n $NS -c app -- sh -c "cat scripts/init-cache.js"
# → const DB_PATH = '/data/inventory.db';
```

**Why this matters:** We were guessing the path (`/app/data/mealdb-cache/meal_cache.db`). Always read the actual source code to confirm paths — assumptions cause mismatches.

**Lesson:** The script is the source of truth. All Kubernetes config (mounts, paths) must match what the code actually uses.

### Phase 7 — Confirming EFS was empty

```bash
kubectl exec -it <pod> -n $NS -c cache-sidecar -- sh
ls /efs-data/    # → empty
ls /data/        # → mealdb-cache/ (emptyDir, created by init-cache mkdir -p)
```

**Why:** Confirmed that EFS had never been written to successfully. The `mealdb-cache/` directory in emptyDir was created by our `mkdir -p` in init-cache, not by the CronJob.

### Phase 8 — Full success

```bash
# After fixing all paths and applying corrected files:
kubectl create job --from=cronjob/sqlite-cache-job manual-debug-5 -n $NS
kubectl get pods -n $NS -w
# → manual-debug-5-xcb84    0/1   Completed   ✅
# → sqlite-cache-job-xxxxx  0/1   Completed   ✅ (real CronJob fired too!)
```

After a `kubectl rollout restart deployment/app -n $NS`:

```bash
kubectl exec -it <new-pod> -n $NS -c cache-sidecar -- sh -c "ls -lh /data/"
# → -rw-r--r-- 1 root root 224.0K Apr 25 22:54 inventory.db ✅
```

---

## 5. Key kubectl Commands Reference

### Cluster health

```bash
minikube status
kubectl cluster-info
kubectl get nodes -o wide
```

### Namespace & resources

```bash
kubectl get namespaces
kubectl get all -n $NS
kubectl get pods -n $NS -o wide
kubectl get pods -n $NS -w          # live watch
```

### Pod inspection

```bash
# Logs for specific container in a multi-container pod
kubectl logs <pod> -n $NS -c <container>
kubectl logs <pod> -n $NS -c <container> --previous   # crashed container

# Shell into a running container
kubectl exec -it <pod> -n $NS -c <container> -- sh

# Describe pod — shows events, mount status, restart reasons
kubectl describe pod <pod> -n $NS
```

### Storage

```bash
kubectl get pv                        # cluster-scoped, no namespace
kubectl get pvc -n $NS
kubectl describe pvc <name> -n $NS
```

### CronJob & Jobs

```bash
kubectl get cronjob -n $NS
kubectl get jobs -n $NS
kubectl describe job <job-name> -n $NS

# Manually trigger a CronJob immediately
kubectl create job --from=cronjob/<cronjob-name> <manual-name> -n $NS
```

### Deployment

```bash
kubectl get deployments -n $NS
kubectl describe deployment <name> -n $NS
kubectl rollout restart deployment/<name> -n $NS
kubectl rollout status deployment/<name> -n $NS
```

### Debug pod (stays alive after failure)

```bash
# Simple — no env vars
kubectl run debug-pod -n $NS \
  --image=<image> \
  --image-pull-policy=Never \
  --restart=Never \
  --command -- <command>

# With ConfigMap env vars (use --overrides)
kubectl run debug-pod -n $NS \
  --image=<image> \
  --image-pull-policy=Never \
  --restart=Never \
  --overrides='{
    "spec": {
      "containers": [{
        "name": "debug-pod",
        "image": "<image>",
        "imagePullPolicy": "Never",
        "command": ["sh", "-c", "<command>"],
        "envFrom": [{"configMapRef": {"name": "<configmap-name>"}}]
      }]
    }
  }' --command -- sh -c "<command>"

# Read logs (pod stays in Error state — no rush)
kubectl logs debug-pod -n $NS

# Clean up when done
kubectl delete pod debug-pod -n $NS
```

### Minikube specific

```bash
minikube ssh                          # shell into the minikube node
minikube service <svc> -n $NS --url   # get URL for a service
minikube addons enable metrics-server # needed for HPA
```

---

## 6. Concepts Learned

### initContainers vs containers (sidecars)

| | initContainers | containers |
|---|---|---|
| Run order | Sequential, one at a time | All start in parallel |
| Must exit? | Yes — must exit 0 before next starts | No — run for pod lifetime |
| Use for | Setup tasks, copying files | Long-running processes |
| Sidecar loops | ❌ Never — blocks main app | ✅ Fine here |

**Rule:** If a container has a `while true` loop, it must be in `containers`, not `initContainers`.

### CronJob vs Job vs Pod

| Resource | Lifecycle | Use for |
|---|---|---|
| `Pod` | Lives until deleted manually | Ad-hoc debugging |
| `Job` | Runs until completion or backoffLimit | One-off tasks |
| `CronJob` | Spawns Jobs on a schedule | Recurring tasks |

**Key CronJob fields:**
- `concurrencyPolicy: Forbid` — don't start a new job if the last one is still running
- `restartPolicy: OnFailure` — required on pod template inside a CronJob
- `backoffLimit: 3` — retry up to 3 times before marking failed
- `activeDeadlineSeconds` — must be longer than the job takes, shorter than the schedule interval

### PV vs PVC

- **PersistentVolume (PV):** The actual storage — cluster-scoped, no namespace
- **PersistentVolumeClaim (PVC):** What pods reference — namespace-scoped
- Pods never reference PVs directly — always via PVCs
- `storageClassName` and `accessModes` must match exactly between PV and PVC for binding

### hostPath vs EFS

| | hostPath (minikube) | EFS (production) |
|---|---|---|
| Backed by | Minikube node filesystem | AWS managed NFS |
| Access modes | ReadWriteMany ✅ | ReadWriteMany ✅ |
| Survives pod restart | ✅ | ✅ |
| Survives node restart | ✅ (minikube) | ✅ |
| Migration effort | Change PV only — PVC stays same | ✅ |

### emptyDir

- Ephemeral — created when pod starts, deleted when pod dies
- Shared between all containers in the same pod (by volume name)
- Used here as fast local storage — app reads from here instead of EFS directly
- `init-cache` populates it at startup, `cache-sidecar` refreshes it at runtime

### Atomic file copy pattern

```sh
cp source.db destination.db.tmp   # write to temp file first
mv destination.db.tmp destination.db  # atomic rename — app never reads partial file
```

**Why:** If you copy directly to the destination and the app reads mid-copy, it gets a corrupted/incomplete file. `mv` on the same filesystem is atomic — the file is either the old version or the new version, never in between.

### Checksum-based change detection

```sh
CURRENT=$(md5sum /efs-data/inventory.db | awk '{print $1}')
if [ "$CURRENT" != "$LAST_CHECKSUM" ]; then
  # file changed — copy it
fi
```

**Why:** Without this, the sidecar copies the file on every poll (every 5 min) even if nothing changed — wasteful I/O. Checksum comparison means we only copy when the CronJob has actually updated the file.

---

## 7. Lessons Learned

1. **Read the source code first.** `DB_PATH` in `init-cache.js` was the ground truth. All Kubernetes mount paths must match what the code actually uses — never assume.

2. **`kubectl run --restart=Never` is your debug best friend.** CronJob pods disappear too fast. A plain pod stays in `Error` state and lets you read logs at your own pace.

3. **`kubectl run` doesn't support `--env-from`.** Use `--overrides` JSON to inject ConfigMap env vars into a debug pod.

4. **Sidecars with infinite loops go in `containers`, not `initContainers`.** An infinite loop in `initContainers` will block the main app from ever starting.

5. **`mkdir -p` before any script that writes files.** Never assume a directory exists in a fresh container — especially on a freshly mounted EFS volume.

6. **After fixing a broken deployment, rollout restart.** If pods started before the fix (e.g. before CronJob populated EFS), they need a restart to re-run `init-cache` and pick up the data.

7. **CronJob `kind` is case-sensitive.** `Cronjob` silently fails — must be `CronJob`.

8. **`activeDeadlineSeconds` should be shorter than your schedule interval.** If your CronJob runs every 10 min (`*/10`), set `activeDeadlineSeconds: 600` (10 min) — not 3600. Otherwise a hung job blocks the next scheduled run.

---

## 8. Final State Verification

```bash
# All pods healthy
kubectl get pods -n $NS -o wide
# → app pods: 2/2 Running
# → postgres, pgadmin: 1/1 Running

# EFS has the database
kubectl exec -it <app-pod> -n $NS -c cache-sidecar -- ls -lh /efs-data/
# → -rw-r--r-- 1 root root 224.0K inventory.db

# emptyDir has the database (copied by init-cache)
kubectl exec -it <app-pod> -n $NS -c cache-sidecar -- ls -lh /data/
# → -rw-r--r-- 1 root root 224.0K inventory.db

# CronJob is scheduled and running
kubectl get cronjob -n $NS
# → sqlite-cache-job  */10 * * * *  False  ...

# Script output — 598 meals, 6332 ingredients
# [init] ✓ Categories : 14
# [init] ✓ Meals      : 598
# [init] ✓ Ingredients: 6332
# [init] Done. Exiting.
```

---

## 9. Next Step — HPA (Horizontal Pod Autoscaler)

Prerequisites before creating HPA:

```bash
# Enable metrics-server (required — HPA needs CPU/memory metrics)
minikube addons enable metrics-server

# Verify it's running
kubectl get pods -n kube-system | grep metrics-server

# Check current resource usage
kubectl top pods -n $NS
kubectl top nodes
```

HPA will:
- Watch CPU usage of the `app` deployment
- Scale up when CPU > 70% (up to 5 replicas)
- Scale down when CPU < 70% (down to minimum 2 replicas)
- Work with `RollingUpdate` strategy already configured in deployment 


# Kubernetes Refresher — Restaurant Inventory Management
Let's get you re-oriented with your cluster before touching anything. Here's a structured sequence to go from "what's running?" to "ready to make changes".

## Phase 1 — Cluster Health Check
Start here to confirm minikube and your cluster are healthy.
bash# Is minikube running?
minikube status

### What's the cluster info?
```sh
kubectl cluster-info
```
# Check nodes (should see 1 minikube node)
```sh
kubectl get nodes -o wide
```
## Phase 2 — Namespace Orientation
Your app likely lives in a dedicated namespace. Find it first.

```bash
# List all namespaces
kubectl get namespaces

# If you remember the name, set it as a shortcut for the session
export NS=<your-namespace>

# Or check all resources across all namespaces at once
kubectl get all --all-namespaces
```
## Phase 3 — Pods (your main focus today)
```bash
# All pods in your namespace
kubectl get pods -n $NS -o wide

# Watch pods live (great when you're redeploying)
kubectl get pods -n $NS -w

# Describe a specific pod — shows initContainer + sidecar status, events, restarts
kubectl describe pod <pod-name> -n $NS

# Check logs per container (critical with multi-container pods)
kubectl logs <pod-name> -n $NS -c <init-container-name>   # initContainer logs
kubectl logs <pod-name> -n $NS -c <sidecar-name>           # sidecar logs
kubectl logs <pod-name> -n $NS -c <main-app-name>          # main app logs

# Previous logs (if a container crashed/restarted)
kubectl logs <pod-name> -n $NS -c <container-name> --previous
```
## Phase 4 — Deployments & ReplicaSets
```bash
# See your deployment (this is what HPA will target)
kubectl get deployments -n $NS
kubectl describe deployment <deployment-name> -n $NS

# ReplicaSets (managed by your deployment)
kubectl get rs -n $NS

## Phase 5 — Storage (PV / PVC)
bash# PersistentVolumes are cluster-scoped (no namespace)
kubectl get pv

# PersistentVolumeClaims are namespace-scoped
kubectl get pvc -n $NS

# Inspect a specific PVC
kubectl describe pvc <pvc-name> -n $NS
```
Since you switched to emptyDir for the sidecar/initContainer shared volume, you may not see PVCs for that — but you might still have one for PostgreSQL data.

## Pase 6 — Services & Networking
```bash
# All services in namespace
kubectl get svc -n $NS

# Get the minikube URL for a NodePort/LoadBalancer service
minikube service <service-name> -n $NS --url

# Ingress (if configured)
kubectl get ingress -n $NS
```
## Phase 7 — CronJobs
```bash
# List CronJobs
kubectl get cronjob -n $NS

# Describe a CronJob
kubectl describe cronjob <cronjob-name> -n $NS

# See Jobs spawned by the CronJob
kubectl get jobs -n $NS
```
## Phase 8 — ConfigMaps & Secrets
```bash
# ConfigMaps (your env vars, command overrides live here)
kubectl get configmap -n $NS
kubectl describe configmap <name> -n $NS

# Secrets
kubectl get secrets -n $NS
```
## Phase 9 — HPA (Horizontal Pod Autoscaler) — what we'll implement
```bash
# Check if metrics-server is running (required for HPA)
kubectl get pods -n kube-system | grep metrics-server

# Enable it in minikube if not present
minikube addons enable metrics-server

# After we create HPA, monitor it with
kubectl get hpa -n $NS
kubectl describe hpa <hpa-name> -n $NS

# Live resource usage (once metrics-server is up)
kubectl top pods -n $NS
kubectl top nodes
```
Suggested Order of Attack Today
1. minikube status → cluster-info → get nodes
2. get namespaces → set $NS
3. get pods → describe your main pod (check initContainer + sidecar state)
4. get deployments → this confirms your HPA target
5. get pv / pvc → storage audit
6. get svc → confirm app is reachable via minikube
7. get cronjob → see if old CronJob is still around
8. enable metrics-server → prerequisite for HPA
9. Then we modify initContainer/sidecar logic + create HPA

Run through Phase 1–3 first and paste what you see — especially the describe pod output. That'll tell us the current state of your initContainer + sidecar before we touch anything.

## TO DO ...... Ingress
