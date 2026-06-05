# gRPC Trust Boundary Investigation — 2026-06-05

## Summary

The gRPC ports (9081–9092) are **container-network only** in the VPS/Dokploy production deployment. No gRPC port has a `ports:` mapping in `docker-compose.yml`, no Traefik route targets any gRPC port, and all gRPC client configuration uses Docker service-name DNS that resolves within the internal bridge network. The gRPC ports are not reachable from the public internet. Specifically, auth-service gRPC (9081) — where `provisionTenantAdmin` lives — is not publicly accessible.

H-4 should be classified as **Medium / hardening backlog**: the current trust model relies on Docker network isolation, which is sound for a single-VPS deployment. The finding recommends filing it as a backlog item with a note that it becomes more important if the deployment ever grows beyond a single VPS or if the Docker network configuration changes.

One material unknown remains: the VPS firewall configuration is not documented in the repository. Lawrence should confirm the firewall posture via `ufw status verbose` on the VPS to complete the picture.

---

## Evidence gathered

### 1. docker-compose port configuration

**Source:** `docker-compose.yml` (the Dokploy/VPS production file) — **observed**.

| Service | gRPC env var | `ports:` for gRPC? | `expose:` for gRPC? | Networks |
|---------|-------------|-------------------|--------------------|-|
| auth-service | `GRPC_PORT: "9081"` | ❌ None | ❌ None | `internal` only |
| tenant-service | `GRPC_PORT: "9083"` | ❌ None | ❌ None | `internal` only |
| employee-service | `GRPC_PORT: "9082"` | ❌ None | ❌ None | `internal` only |
| payroll-service | `GRPC_PORT: "9084"` | ❌ None | ❌ None | `internal` only |
| compliance-service | `GRPC_PORT: "9085"` | ❌ None | ❌ None | `internal` only |
| time-attendance-service | `GRPC_PORT: "9086"` | ❌ None | ❌ None | `internal` only |
| leave-service | `GRPC_PORT: "9087"` | ❌ None | ❌ None | `internal` only |
| document-service | `GRPC_PORT: "9088"` | ❌ None | ❌ None | `internal` only |
| notification-service | `GRPC_PORT: "9089"` | ❌ None | ❌ None | `internal` only |
| integration-hub-service | `GRPC_PORT: "9090"` | ❌ None | ❌ None | `internal` only |
| analytics-service | `GRPC_PORT: "9091"` | ❌ None | ❌ None | `internal` only |
| audit-service | *(no gRPC — event-driven only, noted in comment)* | — | — | `internal` only |
| api-gateway | *(no gRPC server — REST gateway only)* | — | — | `internal` + `dokploy-network` |

**Key observation:** The only services that join the `dokploy-network` (Traefik's external network, reachable from the public internet) are `api-gateway`, `tenant-portal`, `platform-portal`, and `landing`. All backend Java services with gRPC ports are on the `internal` bridge network exclusively.

The `internal` network is defined as:
```yaml
networks:
  internal:
    driver: bridge
  dokploy-network:
    external: true
```

Standard Docker bridge networking does not expose container ports to the host's network interfaces unless explicitly mapped via `ports:`. No gRPC port (9081–9092) appears in any `ports:` directive anywhere in the file.

No `expose:` directives are used in the production compose for any service. The distinction between `ports:` and `expose:` is moot here — neither is present for gRPC ports.

---

### 2. Dokploy / Traefik routing rules

**Source:** Traefik labels in `docker-compose.yml` — **observed**.

Every Traefik route in the file uses `traefik.http.*` labels — HTTP/HTTPS routing only. Four services have routes:

| Service | Hostname pattern | Target port | Protocol |
|---------|-----------------|-------------|----------|
| api-gateway | `${API_DOMAIN}` | 8080 | HTTPS (HTTP with redirect) |
| tenant-portal | `${TENANT_DOMAIN}` | 3000 | HTTPS |
| platform-portal | `${PLATFORM_DOMAIN}` | 3000 | HTTPS |
| landing | `${LANDING_DOMAIN}` | 3000 | HTTPS |

**No Traefik route targets any gRPC port (9081–9092).** There is no `traefik.tcp.*` label (which would be required for TCP-level gRPC routing), and no `traefik.grpc.*` label. gRPC is not routed through Traefik.

---

### 3. VPS firewall rules

**Source:** Not found in the repository — **unknown**.

The repository contains no `ufw` configuration, no iptables scripts, no provisioning scripts, and no documentation of the VPS firewall state. The deployment-gap-analysis.md (`docs/deployment-gap-analysis.md`) confirms the VPS is `gechevps.polcacreations.com` but does not document firewall rules.

**What can be inferred:** Dokploy's typical setup opens ports 80, 443, and 3000 (Dokploy admin UI) on the host network. Standard VPS deployments do not forward Docker bridge subnet traffic to external interfaces — the Docker bridge is isolated by default.

**What cannot be determined from the repo:** Whether the VPS has a cloud provider security group layer, whether `ufw` is active and its configured rules, and whether any Docker bridge subnet is inadvertently exposed via routing misconfiguration.

**Action required:** To fully close this investigation, run `ufw status verbose` on the VPS and confirm that ports 9081–9092 are not listed as `ALLOW`. The analysis below treats Docker bridge isolation as the primary control; the firewall is a requested verification, not a critical gap.

---

### 4. Application-level gRPC server configuration

**Source:** Each service's `application.yml` — **observed**.

| Service | gRPC server port | Bind address | TLS/mTLS |
|---------|-----------------|-------------|----------|
| auth-service | `${GRPC_PORT:9081}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| employee-service | `${GRPC_PORT:9082}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| tenant-service | `${GRPC_PORT:9083}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| payroll-service | `${GRPC_PORT:9084}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| compliance-service | `${GRPC_PORT:9085}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| time-attendance-service | `${GRPC_PORT:9086}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| leave-service | `${GRPC_PORT:9087}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| document-service | `${GRPC_PORT:9088}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| notification-service | `${GRPC_PORT:9089}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| integration-hub-service | `${GRPC_PORT:9090}` | *(default: 0.0.0.0)* | ❌ Plaintext |
| analytics-service | `${GRPC_PORT:9091}` | *(default: 0.0.0.0)* | ❌ Plaintext |

No service sets `grpc.server.address` to restrict to localhost. The default in `grpc-spring-boot-starter` is to bind on `0.0.0.0`. Within a Docker container on an isolated bridge network, `0.0.0.0` means all of the container's network interfaces — which, given the compose configuration, is only the `internal` bridge interface.

No TLS or mTLS is configured anywhere. All client-side configurations use `negotiation-type: plaintext`.

---

### 5. gRPC client configuration

**Source:** Each service's `application.yml` — **observed**.

| Caller | Callee | Configured endpoint | Type |
|--------|--------|---------------------|------|
| auth-service | employee-service | `static://${EMPLOYEE_SERVICE_HOST:employee-service}:${EMPLOYEE_GRPC_PORT:9082}` | Docker service-name DNS |
| tenant-service | auth-service | `static://${AUTH_SERVICE_HOST:localhost}:${AUTH_SERVICE_GRPC_PORT:9081}` | Docker service-name DNS |
| payroll-service | employee-service | `static://${EMPLOYEE_SERVICE_HOST}:${EMPLOYEE_GRPC_PORT:9082}` | Docker service-name DNS |
| payroll-service | leave-service | `static://${LEAVE_SERVICE_HOST}:${LEAVE_GRPC_PORT:9087}` | Docker service-name DNS |
| compliance-service | payroll-service | `static://${PAYROLL_SERVICE_HOST:localhost}:${PAYROLL_SERVICE_GRPC_PORT:9084}` | Docker service-name DNS |
| document-service | payroll-service | `static://${PAYROLL_SERVICE_HOST}:${PAYROLL_GRPC_PORT:9084}` | Docker service-name DNS |
| leave-service | employee-service | `static://${EMPLOYEE_SERVICE_HOST:employee-service}:${EMPLOYEE_GRPC_PORT:9082}` | Docker service-name DNS |
| employee-service (auth) | employee-service | `static://localhost:9082` *(local)* | Loopback |

**All gRPC client endpoints reference Docker service names** (`auth-service`, `employee-service`, `leave-service`, `payroll-service`). In production, these resolve via Docker's embedded DNS within the `internal` bridge network. No client is configured to call a public IP, a VPS external hostname, or any address outside the container network. This confirms inter-service gRPC is strictly internal.

Note: `tenant-service` and `compliance-service` have `localhost` as the fallback default in their `AUTH_SERVICE_HOST` and `PAYROLL_SERVICE_HOST` variables respectively. These defaults apply in development; in production, the `docker-compose.yml` sets the environment variables to the Docker service names (`AUTH_SERVICE_HOST: auth-service`, etc.).

---

## Trust boundary determination

| gRPC port | Service | Classification | Rationale |
|-----------|---------|----------------|-----------|
| 9081 | auth-service | **Container-network only** | No `ports:` mapping; service on `internal` network only; no Traefik route |
| 9082 | employee-service | **Container-network only** | Same as above |
| 9083 | tenant-service | **Container-network only** | Same as above |
| 9084 | payroll-service | **Container-network only** | Same as above |
| 9085 | compliance-service | **Container-network only** | Same as above |
| 9086 | time-attendance-service | **Container-network only** | Same as above |
| 9087 | leave-service | **Container-network only** | Same as above |
| 9088 | document-service | **Container-network only** | Same as above |
| 9089 | notification-service | **Container-network only** | Same as above |
| 9090 | integration-hub-service | **Container-network only** | Same as above |
| 9091 | analytics-service | **Container-network only** | Same as above |

The VPS firewall configuration is **unknown** from the repository, but given that no port mapping exists and Docker bridge networking provides its own isolation layer, the analysis is that gRPC ports are not externally reachable. Requesting firewall verification adds a second defensive layer of confirmation.

---

## Recommendation for H-4

**Recommended severity: Medium / backlog hardening item.**

The finding H-4 (`provisionTenantAdmin` gRPC has no per-call authentication) is a real architectural gap — there is no mechanism to verify that a gRPC caller is authorized before executing privileged operations. But in the current VPS/Dokploy deployment, the network configuration provides effective isolation: gRPC ports are on a container bridge network unreachable from the public internet, and all callers use internal Docker DNS names.

The threat model where H-4 matters is: a compromised container on the `internal` network could call any gRPC endpoint without any authentication. In a single-VPS single-tenant deployment, a compromised container is already catastrophic regardless of gRPC auth. Per-call gRPC authentication would not meaningfully reduce the blast radius of a container breach in this topology.

**Recommended action:** File as a security hardening backlog item.

```
SEC-BACKLOG-004: Add per-call authentication to internal gRPC endpoints.

Current trust model: Docker bridge network isolation. All gRPC ports are on the
`internal` Docker network with no `ports:` mapping and no Traefik routing. gRPC
is not reachable from outside the VPS.

Threat model gap: A compromised container on `internal` can call any gRPC
endpoint with no authentication check on the callee side. provisionTenantAdmin
(auth-service gRPC) is the highest-risk method — it creates admin accounts.

When this becomes urgent: (1) If the deployment grows to multiple VPS nodes and
containers communicate over an untrusted network; (2) If a service mesh or
microservice-to-microservice policy enforcement is introduced; (3) If the current
single-VPS model is replaced by ECS, EKS, or another orchestrator where network
policies are the primary isolation mechanism.

Fix shape when implemented: Either mTLS (transport-layer, mutual cert
authentication) or per-call metadata with a signed service token. The per-call
token approach is simpler: inject a shared secret into each service's environment,
and the gRPC server validates the secret in a server interceptor before processing
any request. mTLS is stronger but requires a PKI.
```

**If the VPS firewall verification reveals any port 9081–9092 is open to the public internet**, this immediately becomes **Critical — fix this week**. The H-4 fix becomes urgent in that scenario because network isolation has failed and per-call auth is the only remaining defense.

---

## Broader observations

### AWS/EKS artifacts still in the repository

The project migrated from AWS EKS to Dokploy VPS, but several artifacts still reference the old deployment target:

1. **`CLAUDE.md` (project instructions):** Stack section lists `Docker, Kubernetes` and Project Structure section references `infrastructure/k8s/ # Kubernetes manifests`. These imply Kubernetes is part of the active stack, which it is not. **Recommended update:** Remove `Kubernetes` from the stack list and change `infrastructure/k8s/ # Kubernetes manifests` to a note that this is legacy/reference material retained for possible future use.

2. **`infrastructure/k8s/` directory:** Contains 76 YAML files (K8s deployments, services, HPAs, PDBs, etc.) from the EKS era. These are not used in the current Dokploy deployment. The files include K8s `Service` objects that would expose gRPC via ClusterIP in a Kubernetes cluster — but this is irrelevant to the current VPS configuration. **Recommended action:** Either archive this directory with a `README.md` noting it is legacy, or delete it if K8s is not on the near-term roadmap.

3. **`docs/deployment-gap-analysis.md`:** This document explicitly acknowledges that `cd-staging.yml` and `cd-production.yml` were "dead AWS EKS workflows." The gap analysis is dated 2026-05-29 and was written precisely to document the EKS→Dokploy migration. No update needed here — it's already accurate.

4. **K8s gRPC exposure model (for reference):** In the K8s era, gRPC ports were exposed via `ClusterIP` services — internal to the Kubernetes cluster, not publicly reachable. `auth-service`'s K8s service.yaml exposed both port 8081 (HTTP) and 9081 (gRPC) as ClusterIP. This was the same trust model as the current Docker bridge network: internal to the cluster, not external. The migration preserved the security posture for gRPC.

---

## Honest framing

- All findings labeled **observed** are read directly from files in the repository.
- The "container-network only" classification is **observed** (from compose file structure) with one **inferred** component: that Docker bridge networking does not route to external interfaces without explicit `ports:` mappings. This is standard Docker behavior, not specific to this deployment.
- The firewall posture is **unknown** — not found in the repository. The analysis treats Docker network isolation as the primary control; firewall verification is a recommended second step.
- The Dokploy admin UI may contain additional routing configuration (e.g., manual route entries added through the web interface rather than compose labels). The compose file shows no such routes for gRPC, and the Dokploy documentation states that routes are applied via container labels or the UI. Nothing in the UI configuration can be verified from the repo alone — this is a second **unknown** element, but a low-probability one given that gRPC requires explicit TCP routing configuration in Traefik.
