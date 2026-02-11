- Wherever applicable, `kubectl get all` returns a list of `pods, services, daemon sets, deployments, replica sets, jobs, cronjobs, and stateful sets`. 

- To display all namespaces within the cluster, use the kubectl get command: 
```bash 
kubectl get namespaces
# or the short version
kubectl get ns
# Output
NAME              STATUS   AGE
default           Active   14d
inventory         Active   56s
kube-node-lease   Active   14d
kube-public       Active   14d
kube-system       Active   14d

kubectl config view | grep namespace # gives the current name space
```

# 🧠 Big Picture (Docker → Kubernetes mapping)
|Docker Compose	              | Kubernetes.              |
|-----------------------------|--------------------------|
| service	                  |     Deployment.          |
| ports	                      |     Service              |
| env_file	                  |     ConfigMap / Secret   |
| depends_on	              |     Readiness probes     |
| volume	                  |     PV + PVC             |
| container_name	          |     Pod name (auto)      |

# 🏗️ Target Architecture (Minikube)

You will run:

- Node App → Deployment + Service

- Postgres → Deployment + Service + PVC

- pgAdmin → Deployment + Service

- Volumes
    - PersistentVolume + PVC → Postgres data
    - emptyDir → optional cache / temp usage

# 📁 Suggested Folder Structure

Create this in your repo:
```cpp
k8s/
├── app/
│   ├── deployment.yaml
│   └── service.yaml
├── postgres/
│   ├── pv.yaml
│   ├── pvc.yaml
│   ├── deployment.yaml
│   └── service.yaml
├── pgadmin/
│   ├── deployment.yaml
│   └── service.yaml
├── configmap.yaml
└── namespace.yaml (optional)
```

# 1️⃣ Namespace (optional but professional)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: inventory
```

Apply:
```bash
kubectl apply -f k8s/namespace.yaml
```

```bash 
kubectl get namespaces
# or the short version
kubectl get ns
# Output
NAME              STATUS   AGE
default           Active   14d
inventory         Active   56s
kube-node-lease   Active   14d
kube-public       Active   14d
kube-system       Active   14d
```


# 2️⃣ ConfigMap (env vars)

This replaces .env
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: inventory
data:
  POSTGRES_HOST: postgres
  POSTGRES_PORT: "5432"
  POSTGRES_DB: mydb
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres
  NODE_ENV: production
```

Apply:
```bash
kubectl apply -f k8s/configmap.yaml
```
Then we can check, our configmap with these command
```bash
kubectl get configmaps  # Gives current namespace
kubectl get configmaps -A # Congifmaps across all namespace 
# Target a specific namespace
kubectl get configmaps -n <namespace-name>
```

# 3️⃣ Postgres Persistent Volume (PV)

Minikube supports hostPath (perfect for learning).
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/postgres
```
Then apply
```bash
kubectl apply -f k8s/postgres/pv.yaml  # apply  
kubectl get pv                         # List all PVs 
kubectl describe pv <pv-name>          # Get detailed information for a specific PV 
```

# 4️⃣ Postgres Persistent Volume Claim (PVC)
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: inventory
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```
```bash
kubectl apply -f postgres/pvc.yaml               # apply
kubectl get pvc                                  # List all PVCs in the current namespace
kubectl get pvc -A                               # List all PVCs across all namespaces
```

# 5️⃣ Postgres Deployment (with PVC)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: inventory
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          envFrom:
            - configMapRef:
                name: app-config
          volumeMounts:
            - mountPath: /var/lib/postgresql/data
              name: postgres-storage
      volumes:
        - name: postgres-storage
          persistentVolumeClaim:
            claimName: postgres-pvc
```
NOTE: Added below code to avoid noisy neighbour issue
```yaml
resources: # <--- Add this block to avoid "Noisy Neighbor issue"
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```
NOTE: `The Noisy Neighbor issue occurs when one application (the "noise") consumes an unfair share of shared resources—like CPU, RAM, or Disk I/O—causing other applications on the same hardware to slow down or crash.`
Solution: To prevent this, you use Resource Quotas:
1. `Requests`: Acts like a "reservation." It ensures the container always has a minimum amount of resources available.
2. `Limits`: Acts like a "fence." it prevents the container from ever taking more than its allowed share, no matter how much it "screams."

**The Problem: Missing Resource Limits**: The error isn't actually a "hard" error from Kubernetes that prevents the pod from running; it is likely a linting warning or a policy violation (from a tool like kube-linter, checkov, or a Kubernetes Admission Controller).

```bash
kubectl get deployments.            # all deployments in the current namespace 
kubectl get deployments -n <namespace-name> # List all deployments in a specific namespace
# Example 
kubectl get deployments -n inventory
# Output
ashim@mac postgres % kubectl get deployments -n inventory                          
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
postgres   1/1     1            1           19h
```

# 6️⃣ Postgres Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: inventory
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
```
```bash 
kubectl apply -f service.yaml         # create the Service in your cluster
kubectl get svc                       # listn all services in current namespace 
kubectl get services --all-namespaces # view Services across all namespaces
```


## K8s Service Refresher
**Definition**: A stable, permanent entry point (IP/DNS) for a set of Pods.

**Purpose**: Pods are ephemeral (they die and change IPs). Services stay the same so other apps can find them reliably.

**Service Types**
- ClusterIP (Default): Internal-only. Use for backend communication (e.g., App → DB).

- NodePort: Exposes a port on every Node's IP. Used for simple external access.

- LoadBalancer: Provisions a cloud provider balancer. The standard way to expose apps to the internet.


# 7️⃣ Node App Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: inventory
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node-app
  template:
    metadata:
      labels:
        app: node-app
    spec:
      containers:
        - name: app
          image: your-dockerhub-username/restaurant-inventory:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: app-config
          volumeMounts:
            - name: temp-storage
              mountPath: /tmp
      volumes:
        - name: temp-storage
          emptyDir: {}
```
## 🔍 Why emptyDir?
- Lives as long as the Pod
- Perfect for:
    - temp files
    - cache
    - uploads
- Deleted when pod restarts
After, applying deployment, we need to apply service as well for the app.

```bash 
kubectl get deployments
kubectl get pods                           # List pods in the currently active namespace:
kubectl apply -f my-service.yaml
kubectl get pods -n <namespace-name>.      # List pods in a specific namespace
```
## Extra Info: 
A Deployment manages Pods, but the Pods' IPs can change. To provide a stable endpoint, create a Kubernetes Service to route traffic to the Pods. 
Create a service file, e.g., `my-service.yaml`
```yaml 
apiVersion: v1
kind: Service
metadata:
  name: my-application-service
spec:
  selector:
    app: my-application # Matches the labels in your Deployment template
  type: LoadBalancer # Use LoadBalancer for external access, or ClusterIP for internal only
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80 # Matches the containerPort in your Deployment
```

# 8️⃣ Node App Service
```yaml
apiVersion: v1
kind: Service
metadata:
  name: app
  namespace: inventory
spec:
  type: NodePort
  selector:
    app: node-app
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30007
```
```bash 
kubectl get pods -n inventory        # See the running pods 
kubectl apply -f service.yaml        # expose application 
minikube service app -n inventory    # Access in Minikube
# Go to http://localhost:3000
# Access your application
```

# 9️⃣ pgAdmin Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pgadmin
  namespace: inventory
spec:
  replicas: 1
  selector:
    matchLabels:
      app: pgadmin
  template:
    metadata:
      labels:
        app: pgadmin
    spec:
      containers:
        - name: pgadmin
          image: dpage/pgadmin4
          ports:
            - containerPort: 80
          env:
            - name: PGADMIN_DEFAULT_EMAIL
              value: admin@admin.com
            - name: PGADMIN_DEFAULT_PASSWORD
              value: admin
```
```yaml
🔌 pgAdmin Service
apiVersion: v1
kind: Service
metadata:
  name: pgadmin
  namespace: inventory
spec:
  type: NodePort
  selector:
    app: pgadmin
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30005
```
🚀 Deploy Everything
```bash
kubectl apply -f k8s/
```

🌍 Access in Minikube
```bash
minikube service app -n inventory
minikube service pgadmin -n inventory
```

🧪 Debug Commands 
```bash
kubectl get pods -n inventory
kubectl logs pod-name -n inventory
kubectl exec -it pod-name -n inventory -- sh
kubectl describe pod pod-name -n inventory
kubectl get pvc -n inventory
kubectl get pv
```
# Extra Notes: 

The `kubectl describe` command `provides a detailed, human-readable overview of a specific Kubernetes resource or group of resources`. It aggregates information from various API sources to offer a comprehensive snapshot of a resource's configuration, status, and related events, making it an essential tool for troubleshooting. 

## Key Functions and Use Cases:

**Detailed Inspection**: Unlike `kubectl get`, which provides a high-level summary, `kubectl describe` compiles extensive details, including labels, annotations, current state, resource limits (CPU/memory), and dependencies with other components.

**Troubleshooting**: It is the primary command for diagnosing issues with resources like pods, deployments, or services. The Events section of the output is particularly useful as it provides a chronological timeline of activities, warnings, and errors (e.g., ImagePullBackOff, FailedScheduling, or probe failures) that explain a resource's current state.

**Understanding Resource Lifecycle**: The command helps users understand the lifecycle and state transitions of a resource by showing details of scheduling decisions, container creation, and restarts.

## Common kubectl describe Commands

You can use `kubectl describe` with most Kubernetes resource types. The basic syntax is `kubectl describe [resource_type] [resource_name]`. 

`kubectl describe pod <pod-name>`: Provides detailed information about a specific pod, including container status, assigned node, IP address, conditions, and all related events.

`kubectl describe service <service-name>`: Shows details about a service, such as its type (ClusterIP, NodePort, etc.), selector labels, and the endpoints (pod IPs and ports) it is routing traffic to.

`kubectl describe deployment <deployment-name>`: Displays the configuration and status of a deployment, including the number of replicas, strategy, selector, and events related to its rollout and scaling.

`kubectl describe node <node-name>`: Shows information about a specific node, including its capacity (CPU, memory), taints, conditions, and the pods running on it. 

Example:

```bash
kubectl describe pod app-577dff6777-x2zx8 -n inventory
Name:             app-577dff6777-x2zx8
Namespace:        inventory
Priority:         0
Service Account:  default
Node:             minikube/192.168.49.2
Start Time:       Wed, 11 Feb 2026 11:37:22 -0500
Labels:           app=node-app
                  pod-template-hash=577dff6777
Annotations:      <none>
Status:           Running
IP:               10.244.0.7
IPs:
  IP:           10.244.0.7
Controlled By:  ReplicaSet/app-577dff6777
Containers:
  app:
    Container ID:   docker://aef3dbc121ce31caf0fe001d216438d32aa456b0c7ca7cedcc87ee4b0667cc88
    Image:          ashimsharma/restaurant-inventory-management-app:v1.0
    Image ID:       docker-pullable://ashimsharma/restaurant-inventory-management-app@sha256:42e1655f53eded841d1853fab8c3e7142f6b74ebb682e0bff02038909ee52a42
    Port:           3000/TCP
    Host Port:      0/TCP
    State:          Running
      Started:      Wed, 11 Feb 2026 11:37:56 -0500
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     500m
      memory:  256Mi
    Requests:
      cpu:     100m
      memory:  128Mi
    Environment Variables from:
      app-config  ConfigMap  Optional: false
    Environment:  <none>
    Mounts:
      /tmp from temp-storage (rw)
      /var/run/secrets/kubernetes.io/serviceaccount from kube-api-access-m5bdk (ro)
Conditions:
  Type                        Status
  PodReadyToStartContainers   True 
  Initialized                 True 
  Ready                       True 
  ContainersReady             True 
  PodScheduled                True 
Volumes:
  temp-storage:
    Type:       EmptyDir # (a temporary directory that shares a pod's lifetime)
    Medium:     
    SizeLimit:  <unset>
  kube-api-access-m5bdk:
    Type:                    Projected (a volume that contains injected data from multiple sources)
    TokenExpirationSeconds:  3607
    ConfigMapName:           kube-root-ca.crt
    Optional:                false
    DownwardAPI:             true
QoS Class:                   Burstable
Node-Selectors:              <none>
Tolerations:                 node.kubernetes.io/not-ready:NoExecute op=Exists for 300s
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:                      <none>
```

# Advanced Debug (Very Useful Skill)

Enter pgAdmin pod:
```bash
kubectl exec -it <pgadmin-pod-name> -n inventory -- sh
# Then test:
ping postgres
```

You saw 
```bash 
PING postgres (10.100.200.204): 56 data bytes
```
## What happened?
- Kubernetes has built-in DNS.
- When a Service is created like:
```yaml
kind: Service
metadata:
  name: postgres
```
Kubernetes automatically creates a DNS record:
```bash
postgres → 10.100.200.204 (ClusterIP)
```
So inside the cluster:
```bash
pgadmin → DNS lookup → postgres → 10.100.200.204 → forwarded to postgres pod
```
That IP you saw:
```bash
10.100.200.204
```
- is the ClusterIP of the Postgres service.
- It is not the pod IP.
- It is a stable virtual IP managed by Kubernetes.
- just validated:
    ✔ DNS works
    ✔ Service exists
    ✔ Network works
    ✔ Pods can talk internally