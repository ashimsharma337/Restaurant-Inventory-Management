# Kubernetes HPA — Horizontal Pod Autoscaler
**Date:** April 25, 2026  
**Stack:** Minikube · Next.js · metrics-server · autoscaling/v2

---

## 1. What is HPA?

HPA (HorizontalPodAutoscaler) is a Kubernetes controller that **automatically scales the number of pod replicas** in a Deployment up or down based on observed metrics like CPU and memory usage.

Without HPA, your replica count is static — you set `replicas: 2` in your Deployment and it stays at 2 forever, regardless of how much traffic hits it.

With HPA, Kubernetes watches your pods' resource usage and makes scaling decisions automatically:

```
Low traffic  → CPU 2%  → HPA says "2 replicas is fine"
High traffic → CPU 159% → HPA says "need more replicas, adding one"
Traffic gone → CPU 0%  → HPA says "scale back down after 5 min"
```

### HPA vs Manual Scaling

| | Manual (`kubectl scale`) | HPA |
|---|---|---|
| Who decides replica count | You | Kubernetes |
| Reacts to traffic spikes | ❌ Only if you're watching | ✅ Automatically |
| Scales back down | ❌ Manual | ✅ Automatically |
| Requires metrics-server | ❌ | ✅ |

---

## 2. How HPA Works — End to End

### The Control Loop

HPA runs a continuous control loop every 15 seconds (default):

```
┌─────────────────────────────────────────────────────────┐
│                   HPA Control Loop                      │
│                                                         │
│  1. Query metrics-server for current CPU/memory         │
│         ↓                                               │
│  2. Calculate desired replicas:                         │
│     desiredReplicas = ceil(currentReplicas *            │
│                       currentMetric / targetMetric)     │
│         ↓                                               │
│  3. Apply stabilization window                          │
│     (don't act on brief spikes)                         │
│         ↓                                               │
│  4. Apply behavior policies                             │
│     (how many pods to add/remove per period)            │
│         ↓                                               │
│  5. Tell Deployment to update replica count             │
│         ↓                                               │
│  6. Wait 15 seconds → repeat                            │
└─────────────────────────────────────────────────────────┘
```

### The Math — How Replica Count is Calculated

```
desiredReplicas = ceil(currentReplicas × (currentMetric ÷ targetMetric))
```

**Example from our session:**
- currentReplicas = 2
- currentCPU = 159%
- targetCPU = 60%

```
desiredReplicas = ceil(2 × (159 ÷ 60))
               = ceil(2 × 2.65)
               = ceil(5.3)
               = 6   ← but capped at maxReplicas: 4
```

So HPA wanted 6 but we capped at 4 — it scaled to 4.

### What metrics-server Does

metrics-server is a cluster-wide aggregator that:
- Scrapes CPU and memory from every node's kubelet every 60 seconds
- Stores them in memory (not on disk — not for long-term storage)
- Exposes them via the Kubernetes Metrics API
- HPA queries this API to make scaling decisions

```
kubelet (node) → metrics-server → Metrics API → HPA reads → scales Deployment
```

Without metrics-server, HPA shows `<unknown>` for targets and cannot function.

---

## 3. What We Did — Step by Step

### Step 1 — Enable metrics-server on Minikube

```bash
minikube addons enable metrics-server
```

**Why:** metrics-server doesn't run by default on Minikube. HPA needs it to read CPU and memory metrics from pods. Without it, HPA targets show `<unknown>` and no scaling decisions are made.

```bash
kubectl get pods -n kube-system | grep metrics-server
```

**Why:** Verify metrics-server pod is actually running before proceeding. It shows `0/1 Running` briefly while initialising — wait 30 seconds for it to become `1/1 Running`.

### Step 2 — Verify metrics are flowing

```bash
kubectl top pods -n $NS
kubectl top nodes
```

**Why:** Confirms metrics-server is collecting data. If this returns actual numbers (not errors), HPA will work. If it says `metrics not available yet`, wait another 30 seconds.

**Output we saw:**
```
NAME                     CPU(cores)   MEMORY(bytes)
app-5494ff6f6c-ck9xg     2m           52Mi
app-5494ff6f6c-zd4mh     2m           51Mi
```

### Step 3 — Apply HPA

```bash
kubectl apply -f hpa-node-app.yml
```

**Why:** Creates the HPA resource in the cluster. It immediately starts watching the `app` Deployment.

### Step 4 — Verify HPA is reading metrics

```bash
kubectl get hpa -n $NS
```

**Output:**
```
NAME           REFERENCE        TARGETS                        MINPODS  MAXPODS  REPLICAS  AGE
node-app-hpa   Deployment/app   cpu: 2%/60%, memory: 41%/75%  2        4        2         109s
```

**What each column means:**
- `TARGETS` — `current/threshold` for each metric
- `MINPODS` — never scale below this
- `MAXPODS` — never scale above this
- `REPLICAS` — current replica count HPA is maintaining

**Why `<unknown>` appears initially:** metrics-server needs ~60 seconds to collect its first data points after being enabled. `<unknown>` is normal for the first minute.

### Step 5 — Trigger scale-up with a load generator

```bash
kubectl run load-generator -n $NS \
  --image=busybox:latest \
  --restart=Never \
  -- sh -c "while true; do wget -q -O- http://app:3000/api/health; done"
```

**Why:** Simulates heavy traffic by sending an infinite stream of HTTP requests to the app service. This drives CPU usage up past the 60% threshold, triggering HPA to scale up.

**Breaking down the command:**
- `kubectl run` — creates a standalone pod (not a Deployment)
- `--image=busybox:latest` — tiny Linux image with `wget` available
- `--restart=Never` — plain pod, not managed by a ReplicaSet
- `-- sh -c "while true; do ..."` — the command to run inside the container
- `wget -q -O-` — makes an HTTP GET request, `-q` silent, `-O-` prints to stdout
- `http://app:3000` — uses the Kubernetes service name `app` (resolved via cluster DNS)

**Why service name works:** Inside the cluster, Kubernetes DNS resolves service names automatically. `http://app:3000` routes to any healthy pod behind the `app` service — no IP needed.

### Step 6 — Watch HPA and pods in real time

**On Linux/Mac with `watch` installed:**
```bash
watch -n 5 kubectl get hpa,pods -n $NS
```

**On Mac without `watch` (what we used):**
```bash
while true; do kubectl get hpa,pods -n $NS; echo "---"; sleep 5; done
```

**Why:** Lets you see CPU climb and new pods appear without manually re-running the command. `sleep 5` means it refreshes every 5 seconds.

### Step 7 — Observe scale-up

**What we saw:**
```
# t=0: load generator starts
cpu: 2%/60%    REPLICAS: 2

# t=~1min: CPU spikes
cpu: 159%/60%  REPLICAS: 2   ← HPA detected, starting new pod
app-z7rqg      Init:0/1      ← initContainer running

# t=~2min: first new pod ready
cpu: 159%/60%  REPLICAS: 3
app-z7rqg      2/2 Running   ← scaled up successfully
app-qkqdm      1/2 Running   ← HPA adding another

# t=~3min: at max
cpu: 159%/60%  REPLICAS: 4   ← hit maxReplicas cap
```

Scale-up went `2 → 3 → 4`, adding 1 pod per minute — exactly matching the `scaleUp` behavior policy.

### Step 8 — Stop load and observe scale-down

```bash
kubectl delete pod load-generator -n $NS
```

**Why:** Removes the traffic source. CPU drops back to near 0%, triggering the scale-down evaluation.

**What we saw:**
```
# Immediately after deleting load generator
cpu: 0%/60%   REPLICAS: 4   ← HPA sees low CPU but waits...

# 5 minutes later (stabilizationWindowSeconds: 300)
cpu: 0%/60%   REPLICAS: 3   ← scaled down by 1

# 2 minutes later (periodSeconds: 120)
cpu: 0%/60%   REPLICAS: 2   ← back to minimum
```

Scale-down went `4 → 3 → 2`, removing 1 pod every 2 minutes after the 5-minute stabilization window.

---

## 4. The `watch` Command

### What is `watch`?

`watch` is a **Linux utility** that repeatedly executes a command at a fixed interval and displays the output fullscreen — like a live-refreshing dashboard.

```bash
watch -n 5 kubectl get pods    # re-runs every 5 seconds
watch -n 1 kubectl get hpa     # re-runs every 1 second
```

It's extremely useful for monitoring Kubernetes resources in real time without manually re-running commands.

### Is it a Linux utility?

Yes — `watch` is a standard Linux utility that comes pre-installed on most Linux distributions (Ubuntu, Debian, CentOS, etc.). It is **not** included with macOS by default because macOS uses BSD-based tools, not GNU/Linux tools.

### How to install `watch` on Mac

**Option 1 — Homebrew (recommended):**
```bash
# Install Homebrew first if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install watch
brew install watch
```

**Option 2 — Verify installation:**
```bash
which watch      # should print /opt/homebrew/bin/watch
watch --version  # should print version info
```

### What we used instead (Mac workaround)

Since `watch` wasn't installed, we used a shell loop that does the same thing:

```bash
while true; do kubectl get hpa,pods -n $NS; echo "---"; sleep 5; done
```

**Breaking it down:**
- `while true` — loop forever
- `do ... done` — body of the loop
- `kubectl get hpa,pods -n $NS` — the command to run (gets both HPA and pods in one call)
- `echo "---"` — prints a separator line between each refresh
- `sleep 5` — waits 5 seconds before the next iteration
- `Ctrl+C` — stops the loop

**Difference from `watch`:** `watch` clears the screen and re-renders in place (cleaner). The `while true` loop appends output — it scrolls. Functionally identical for our purposes.

---

## 5. HPA Configuration File Explained

```yaml
# autoscaling/v2 supports multiple metrics (CPU + memory simultaneously)
# v1 only supported CPU — always use v2
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: node-app-hpa
  namespace: inventory
spec:

  # Which Deployment to control
  # name must exactly match metadata.name in deployment.yml
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app

  # Hard boundaries — HPA never goes outside these
  minReplicas: 2    # matches replicas: 2 in deployment.yml
  maxReplicas: 4

  metrics:
    # CPU threshold: scale up when average CPU > 60% of requested (100m)
    # 60% of 100m = 60m per pod
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 60

    # Memory threshold: scale up when average memory > 75% of requested (128Mi)
    # 75% of 128Mi = 96Mi per pod
    # Note: memory scaling is less common — memory doesn't release quickly
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 75

  # behavior controls the SPEED of scaling, not the trigger
  # Without this, HPA uses aggressive defaults that can cause thrashing
  behavior:

    scaleUp:
      # Don't react to a spike until it's sustained for 60 seconds
      stabilizationWindowSeconds: 60
      policies:
        - type: Pods
          value: 1          # add max 1 pod per period
          periodSeconds: 60 # period = 1 minute
                            # max scale-up rate = 1 pod/min → 2→3→4 over 2 min

    scaleDown:
      # Don't scale down until load has been low for 5 full minutes
      # Prevents: scale down → traffic returns → scale up → repeat (thrashing)
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1           # remove max 1 pod per period
          periodSeconds: 120 # period = 2 minutes
                             # max scale-down rate = 1 pod/2min → 4→3→2 over 4 min
```

### Bug that was in the original file

```yaml
# WRONG — name had the apiVersion value
scaleTargetRef:
  apiVersion: apps/v1
  kind: Deployment
  name: apps/v1       ← copied apiVersion by mistake

# CORRECT
scaleTargetRef:
  apiVersion: apps/v1
  kind: Deployment
  name: app           ← must match Deployment metadata.name
```

```yaml
# WRONG — behavior nested inside metrics as a list item
metrics:
  - type: Resource
    resource: ...
  - type: Resource
    resource: ...
  - behavior:         ← has a dash, treated as third metrics item — invalid
      scaleUp: ...

# CORRECT — behavior is a sibling of metrics, not inside it
metrics:
  - type: Resource
    resource: ...
  - type: Resource
    resource: ...
behavior:             ← no dash, same indent level as metrics
  scaleUp: ...
```

---

## 6. Stabilization Windows — Why They Matter

### The thrashing problem

Without stabilization windows, HPA can oscillate:

```
t=0:  CPU spikes → scale up to 4
t=1:  CPU drops  → scale down to 2
t=2:  CPU spikes → scale up to 4   ← thrashing!
t=3:  CPU drops  → scale down to 2
```

This is bad because:
- Pods take time to start (your initContainer runs on every new pod)
- Constant churn wastes resources
- Users may hit pods that are still warming up

### How stabilization windows fix it

```
scaleUp stabilization = 60s:
  CPU must be above threshold for 60s before HPA acts
  → ignores brief spikes (a single slow request won't trigger scale-up)

scaleDown stabilization = 300s:
  CPU must be below threshold for 300s before HPA acts
  → keeps extra capacity for 5 minutes after load drops
  → if traffic returns within 5 min, no scale-down happened — no churn
```

### What we observed

```
# Scale-up: acted after ~60s of high CPU
cpu: 159%  → waited stabilization window → added pod

# Scale-down: waited full 5 minutes after load generator deleted
cpu: 0%    → held at 4 replicas for 5 min → then 4→3→2
```

---

## 7. How New Pods Start During Scale-Up

When HPA adds a replica, the new pod goes through your full startup sequence:

```
HPA decides: need more replicas
      ↓
Deployment creates new pod
      ↓
┌─── initContainer: init-cache ───────────────────────┐
│  Checks EFS for inventory.db                        │
│  If found → copies to emptyDir                      │
│  Exits → main containers start                      │
└─────────────────────────────────────────────────────┘
      ↓
┌─── containers start in parallel ────────────────────┐
│  cache-sidecar: begins polling EFS every 5 min      │
│  app: Next.js starts, reads /data/inventory.db      │
└─────────────────────────────────────────────────────┘
      ↓
readinessProbe passes (/api/health returns 200)
      ↓
Pod added to Service — starts receiving traffic
```

**What we saw in output:**
```
app-5494ff6f6c-z7rqg   Init:0/1   ← initContainer running
app-5494ff6f6c-z7rqg   1/2        ← initContainer done, one container up
app-5494ff6f6c-z7rqg   2/2        ← both containers ready, pod in service
```

The `2/2` means both `cache-sidecar` and `app` are ready. The initContainer is not counted in the ready count because it already exited.

---

## 8. How Scale-Down Works

When HPA removes a replica, Kubernetes does it gracefully:

```
HPA decides: too many replicas
      ↓
Deployment picks a pod to terminate (usually newest first)
      ↓
Pod gets SIGTERM signal
      ↓
Kubernetes removes pod from Service endpoints immediately
(no new traffic routed to it)
      ↓
Pod has 30 seconds (terminationGracePeriodSeconds) to finish
handling in-flight requests
      ↓
Pod is deleted
```

This is why `maxUnavailable: 0` in your Deployment matters — combined with HPA's gradual `1 pod per 2 min` scale-down, users never lose all capacity.

---

## 9. All Commands Reference

### Setup

```bash
# Enable metrics-server (Minikube only)
minikube addons enable metrics-server

# Verify metrics-server is running
kubectl get pods -n kube-system | grep metrics-server

# Verify metrics are flowing (wait 60s after enabling)
kubectl top pods -n $NS
kubectl top nodes
```

### Apply and inspect HPA

```bash
# Create/update HPA
kubectl apply -f hpa-node-app.yml

# Quick status check
kubectl get hpa -n $NS

# Detailed HPA info — shows events, scaling decisions, conditions
kubectl describe hpa node-app-hpa -n $NS
```

### Load testing

```bash
# Start load generator
kubectl run load-generator -n $NS \
  --image=busybox:latest \
  --restart=Never \
  -- sh -c "while true; do wget -q -O- http://app:3000/api/health; done"

# Stop load generator
kubectl delete pod load-generator -n $NS
```

### Monitoring (Mac — no watch installed)

```bash
# Watch HPA + pods refresh every 5 seconds
while true; do kubectl get hpa,pods -n $NS; echo "---"; sleep 5; done

# Watch just HPA
while true; do kubectl get hpa -n $NS; sleep 5; done

# Stop with Ctrl+C
```

### Monitoring (Linux / Mac with watch installed)

```bash
# Install watch on Mac
brew install watch

# Use watch
watch -n 5 kubectl get hpa,pods -n $NS
watch -n 2 kubectl top pods -n $NS
```

### Manual scaling (override HPA temporarily)

```bash
# Manually set replicas — HPA will fight this and revert it
kubectl scale deployment app --replicas=3 -n $NS

# To truly pause HPA, delete it
kubectl delete hpa node-app-hpa -n $NS

# Or patch minReplicas temporarily
kubectl patch hpa node-app-hpa -n $NS \
  -p '{"spec":{"minReplicas": 1}}'
```

### Cleanup

```bash
# Delete HPA (Deployment keeps running at current replica count)
kubectl delete hpa node-app-hpa -n $NS

# Delete load generator pod
kubectl delete pod load-generator -n $NS
```

---

## 10. Key Concepts Summary

### HPA evaluates ALL metrics — takes the highest

If CPU says 3 replicas and memory says 4 replicas, HPA scales to **4**. It always satisfies the most demanding metric.

### minReplicas should match Deployment replicas

If your Deployment has `replicas: 2` and HPA has `minReplicas: 2`, they agree. If HPA's min is lower than your Deployment's replicas, HPA may scale you down below what you intended.

### Resource requests are the baseline for percentages

`averageUtilization: 60` means 60% of the pod's **requested** CPU/memory — not the limit, not the node capacity.

```
CPU request in deployment.yml:  100m
HPA CPU threshold:              60%
Trigger point:                  60m per pod on average
```

This is why setting accurate `requests` in your Deployment matters — HPA's math depends on them.

### HPA and RollingUpdate work together

Your Deployment has:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0   # never remove a pod before replacement is ready
    maxSurge: 1         # allow 1 extra pod during transitions
```

When HPA adds a pod, it goes through the rolling update mechanism — ensuring the new pod is healthy (readinessProbe passes) before it enters the Service's endpoint pool.

### Scale-up is fast, scale-down is slow — by design

| | Our config | Why |
|---|---|---|
| Scale-up stabilization | 60s | React to real load quickly |
| Scale-down stabilization | 300s | Don't remove capacity too soon |
| Scale-up rate | 1 pod/min | Gradual — avoid thundering herd |
| Scale-down rate | 1 pod/2min | Very gradual — conservative |

---

## 11. What Happened in Our Session — Timeline

```
t=0min   metrics-server enabled, HPA applied
         cpu: 2%/60%  memory: 41%/75%  replicas: 2

t=10min  load-generator started
         cpu: 159%/60% → HPA triggered scale-up

t=11min  app-z7rqg created (Init:0/1 → 1/2 → 2/2)
         replicas: 3

t=12min  app-qkqdm created (still starting)
         replicas: 4  ← hit maxReplicas

t=17min  load-generator deleted
         cpu: 0%/60%  replicas: 4  ← stabilization window starts

t=22min  300s stabilization window expires
         replicas: 3  ← scale-down begins

t=24min  replicas: 2  ← back to minimum, scale-down complete
```
