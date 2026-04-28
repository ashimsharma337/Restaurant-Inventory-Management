# kubectl exec — Shelling into Containers 
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
---

## Command Syntax

```bash
kubectl exec -it <pod-name> -n <namespace> -c <container-name> -- <shell>
```

### Breakdown

```bash
kubectl exec -it app-5494ff6f6c-ck9xg -n inventory -c cache-sidecar -- sh
#            │                          │             │                  │
#            │                          │             │                  └─ command to run inside
#            │                          │             └─ which container (-c flag)
#            │                          └─ namespace (-n flag)
#            └─ pod name
#
# -i = interactive (keeps stdin open so you can type)
# -t = allocate a TTY (gives you a proper terminal experience)
# -- = separator between kubectl args and the container command
```

---

## The Common Error

```bash
kubectl exec -it <pod> -n $NS -c cache-sidecar -- bash
# OCI runtime exec failed: exec failed: unable to start container process:
# exec: "bash": executable file not found in $PATH: unknown
# command terminated with exit code 127
```

**Why:** The command syntax is correct — `bash` is simply not installed in the `busybox` image. Busybox only ships with `sh`.

**Fix:** Use `sh` instead of `bash`.

```bash
kubectl exec -it <pod> -n $NS -c cache-sidecar -- sh
```

---

## Which Shell to Use per Image

| Base Image | Available Shell | Command |
|---|---|---|
| `busybox` | `sh` only | `-- sh` |
| `alpine` | `sh` only | `-- sh` |
| `ubuntu` / `debian` | `bash` and `sh` | `-- bash` or `-- sh` |
| `node` | `bash` and `sh` | `-- bash` or `-- sh` |
| `distroless` | neither | ❌ cannot exec in |

**Rule of thumb:** When in doubt, try `sh` first — it exists in almost every image. `bash` is only guaranteed on Debian/Ubuntu based images.

---

## What Happens Without `-c` on a Multi-Container Pod

If you omit `-c`, kubectl defaults to the **first container** defined in the pod spec and prints a notice:

```bash
kubectl exec -it app-5494ff6f6c-ck9xg -n inventory -- sh
# Defaulted container "cache-sidecar" out of: cache-sidecar, app, init-cache (init)
```

Always specify `-c` explicitly when working with multi-container pods to avoid confusion.

---

## Quick Reference — Restaurant Inventory Pod

```bash
# Shell into cache-sidecar (busybox — use sh)
kubectl exec -it <pod> -n $NS -c cache-sidecar -- sh

# Shell into init-cache (busybox — use sh)
# Note: initContainers only exist while running — not accessible after they exit
kubectl exec -it <pod> -n $NS -c init-cache -- sh

# Shell into main app container (Node.js — has bash)
kubectl exec -it <pod> -n $NS -c app -- bash
```

---

## Run a One-Off Command Without Entering Shell

You don't always need an interactive shell. Use `sh -c` to run a single command and exit:

```bash
# Check EFS mount contents
kubectl exec -it <pod> -n $NS -c cache-sidecar -- sh -c "ls -lh /efs-data/"

# Check emptyDir contents
kubectl exec -it <pod> -n $NS -c cache-sidecar -- sh -c "ls -lh /data/"

# Read a file from the app container
kubectl exec -it <pod> -n $NS -c app -- sh -c "cat scripts/init-cache.js"

# Check environment variables
kubectl exec -it <pod> -n $NS -c app -- sh -c "env | grep POSTGRES"

# Check disk usage
kubectl exec -it <pod> -n $NS -c cache-sidecar -- sh -c "df -h"
```

---

## Exiting the Shell

```bash
exit      # or Ctrl+D
```

---

## Key Flags Summary

| Flag | Meaning | When to use |
|---|---|---|
| `-i` | Interactive — keeps stdin open | Always for interactive shells |
| `-t` | TTY — proper terminal experience | Always for interactive shells |
| `-n` | Namespace | Always (unless default namespace) |
| `-c` | Container name | Always on multi-container pods |
| `--` | Separator | Always — separates kubectl args from container command |
