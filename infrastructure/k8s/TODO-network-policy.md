# NetworkPolicy — Prerequisite and Stubs

NetworkPolicy manifests are **not applied** in this directory. Writing policies
to a cluster whose CNI does not enforce them creates false security confidence —
the API server accepts and stores the objects, but no enforcement agent acts on
them and pods communicate freely regardless.

The cluster runs on EKS (`af-south-1`). The default AWS VPC CNI does **not**
enforce NetworkPolicy unless explicitly enabled. Enforcement must be confirmed
before policies are applied.

---

## Step 1 — Confirm CNI enforcement

Run from a machine with cluster access:

```bash
# Check whether the VPC CNI has network policy enforcement enabled
kubectl get configmap amazon-vpc-cni -n kube-system \
  -o jsonpath='{.data.ENABLE_NETWORK_POLICY}' 2>/dev/null || echo "field absent (enforcement off)"

# Check whether Calico is installed as an alternative enforcer
kubectl get pods -n calico-system 2>/dev/null || \
kubectl get pods -n kube-system -l k8s-app=calico-node 2>/dev/null || \
  echo "Calico not found"

# Check whether Cilium is installed
kubectl get pods -n kube-system -l k8s-app=cilium 2>/dev/null || \
  echo "Cilium not found"
```

**If enforcement is confirmed:** apply the stub policies in the `stubs/` section
below after removing the `# STUB` header from each file, then `kubectl apply -f`.

**If enforcement is not enabled:** follow the procedure in Step 2 before
applying any policy.

---

## Step 2 — Enable NetworkPolicy enforcement on EKS (VPC CNI path)

This is the lightest-weight option and does not require replacing the CNI.
Requires EKS 1.27 or later.

```bash
# Enable native network policy support on the VPC CNI add-on
aws eks update-addon \
  --cluster-name andikisha-staging \         # repeat for andikisha-production
  --addon-name vpc-cni \
  --configuration-values '{"enableNetworkPolicy": "true"}' \
  --region af-south-1

# Verify the daemon set has restarted with the new flag
kubectl rollout status daemonset aws-node -n kube-system
kubectl get configmap amazon-vpc-cni -n kube-system \
  -o jsonpath='{.data.ENABLE_NETWORK_POLICY}'
# Expected output: true
```

Alternatively, install Calico in policy-only mode (does not replace the VPC CNI
data plane but adds policy enforcement):
<https://docs.tigera.io/calico/latest/getting-started/kubernetes/managed-public-cloud/eks>

---

## Step 3 — Apply the stub policies

Once enforcement is confirmed, apply the policies below. The default-deny ingress
policy must be applied first so existing pods are not disrupted while individual
allow rules are added.

### Default deny all ingress in andikisha namespace

```yaml
# infrastructure/k8s/base/netpol-default-deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: andikisha
spec:
  podSelector: {}
  policyTypes:
    - Ingress
```

### Per-service allow stubs

One NetworkPolicy per service. The pattern is:
- Allow ingress from `api-gateway` on the HTTP port (for services that receive
  proxied requests from the gateway)
- Allow ingress from other specific internal callers on gRPC ports
- Allow ingress from Prometheus scrapers on the actuator port

Replace `<CALLER_APP>` and ports with actual values per service before applying.

**api-gateway** — receives external traffic via LoadBalancer (no ingress NetworkPolicy
needed from within the cluster; restrict egress to known internal service ports).

```yaml
# infrastructure/k8s/services/api-gateway/netpol.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway
  namespace: andikisha
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
    - Ingress
  ingress:
    - {}   # allow all ingress (api-gateway is the public entry point)
```

**auth-service** — called by api-gateway (HTTP 8081) and all internal services
(gRPC 9081 for JWT validation).

```yaml
# infrastructure/k8s/services/auth-service/netpol.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: auth-service
  namespace: andikisha
spec:
  podSelector:
    matchLabels:
      app: auth-service
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector: {}   # any pod in the andikisha namespace
      ports:
        - port: 8081
          protocol: TCP
        - port: 9081
          protocol: TCP
```

**payroll-service** — called by api-gateway (HTTP 8084) and employee-service,
leave-service (gRPC 9084).

```yaml
# infrastructure/k8s/services/payroll-service/netpol.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: payroll-service
  namespace: andikisha
spec:
  podSelector:
    matchLabels:
      app: payroll-service
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway
        - podSelector:
            matchLabels:
              app: employee-service
        - podSelector:
            matchLabels:
              app: leave-service
      ports:
        - port: 8084
          protocol: TCP
        - port: 9084
          protocol: TCP
```

> **For the remaining 10 Release 01 services and 4 Release 02 services:**
> follow the same pattern. For each service, audit which callers it receives
> from (check the gRPC client wrappers in `infrastructure/grpc/` and the
> api-gateway route configuration) and add one `from` entry per caller.
> Database pods (PostgreSQL) should have their own NetworkPolicy permitting
> ingress only from their owning service.

---

## Checklist before closing this TODO

- [ ] CNI enforcement confirmed (`ENABLE_NETWORK_POLICY: true` or Calico/Cilium running)
- [ ] `netpol-default-deny.yaml` applied and verified (existing traffic unaffected)
- [ ] Per-service NetworkPolicies applied for all 13 Release 01 services
- [ ] Per-service NetworkPolicies applied for 4 Release 02 services when they ship
- [ ] Database-level NetworkPolicies applied (one per PostgreSQL instance)
- [ ] Prometheus scrape paths verified still reachable after policies are applied
- [ ] This file deleted or moved to `docs/decisions/` once all policies are live
