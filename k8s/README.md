# Kubernetes Deployment Guide for SentinelX

This folder contains the Kubernetes manifests to deploy the SentinelX platform.

## Prerequisites

1. A running Kubernetes cluster (Minikube, Kind, or a cloud provider like EKS/GKE).
2. `kubectl` configured to communicate with your cluster.
3. Build the Docker images locally (if using Minikube/Kind):

```bash
# Build Backend
docker build -t sentinelx-backend ./backend

# Build Frontend
docker build -t sentinelx-frontend ./frontend
```

If using Minikube, remember to point your shell to Minikube's Docker daemon before building:
```bash
eval $(minikube docker-env)
```

## Deployment Steps

1. **Create the Namespace:**
   ```bash
   kubectl apply -f namespace.yaml
   ```

2. **Deploy Configuration and Secrets:**
   ```bash
   kubectl apply -f configmap.yaml
   kubectl apply -f secrets.yaml
   ```

3. **Deploy the Database:**
   ```bash
   kubectl apply -f postgres-pvc.yaml
   kubectl apply -f postgres-deployment.yaml
   ```

4. **Deploy the Backend:**
   ```bash
   kubectl apply -f backend-deployment.yaml
   ```

5. **Deploy the Frontend:**
   ```bash
   kubectl apply -f frontend-deployment.yaml
   ```

## Accessing the Platform

- **Frontend:** Since the frontend service is of type `LoadBalancer`, you can access it via the external IP. If using Minikube, run:
  ```bash
  minikube service frontend-service -n sentinelx
  ```

- **Backend:** The backend is accessible within the cluster at `http://backend-service:3000`.

## Notes

- The images are tagged as `latest` and `imagePullPolicy` is set to `IfNotPresent`.
- The secrets in `secrets.yaml` should be updated with actual values for a production environment.
