# Phase 2: DevOps Infrastructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete deployment infrastructure — Kubernetes manifests for all 13 services, a GitHub Actions CI/CD pipeline, distributed tracing across all services, and structured JSON logging — so the system can be deployed and observed in production.

**Architecture:** K8s manifests use a `base/` + per-service overlay structure. CI runs on every PR; CD deploys to staging on merge to `master`. Tracing uses Micrometer Brave bridge to Zipkin (already running in infra compose). Logging uses Logstash JSON encoder via `logback-spring.xml` in each service.

**Tech Stack:** Kubernetes, GitHub Actions, Docker, Micrometer Tracing (Brave), Zipkin, Logstash Logback Encoder, Spring Boot Actuator

**Prerequisites:** Phase 1 must be complete. All 13 services must build and test successfully.

---

## Task 10: Kubernetes Manifests — Namespace, ConfigMap, and Base Objects

**Files:**
- Create: `infrastructure/k8s/base/namespace.yaml`
- Create: `infrastructure/k8s/base/resource-defaults.yaml`
- Create: `infrastructure/k8s/base/kustomization.yaml`

---

- [ ] **Step 10.1: Create namespace manifest**

Create `infrastructure/k8s/base/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: andikisha
  labels:
    app.kubernetes.io/part-of: andikisha-hr
    environment: production
```

- [ ] **Step 10.2: Create base kustomization**

Create `infrastructure/k8s/base/kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - namespace.yaml
  - ../services/api-gateway
  - ../services/auth-service
  - ../services/tenant-service
  - ../services/employee-service
  - ../services/payroll-service
  - ../services/compliance-service
  - ../services/time-attendance-service
  - ../services/leave-service
  - ../services/document-service
  - ../services/notification-service
  - ../services/integration-hub-service
  - ../services/analytics-service
  - ../services/audit-service
```

---

## Task 11: Kubernetes Manifests — Per-Service (canonical pattern)

Each service needs a `Deployment`, `Service`, and `HorizontalPodAutoscaler`. We define one canonical template and apply it to all 13 services.

**Files (repeat for each service — shown for api-gateway and payroll-service as examples):**
- Create: `infrastructure/k8s/services/api-gateway/deployment.yaml`
- Create: `infrastructure/k8s/services/api-gateway/service.yaml`
- Create: `infrastructure/k8s/services/api-gateway/kustomization.yaml`
- Create: `infrastructure/k8s/services/payroll-service/deployment.yaml`
- Create: `infrastructure/k8s/services/payroll-service/service.yaml`
- Create: `infrastructure/k8s/services/payroll-service/hpa.yaml`
- Create: `infrastructure/k8s/services/payroll-service/kustomization.yaml`
- *(Repeat for all 13 services)*

---

- [ ] **Step 11.1: Create api-gateway Deployment**

Create `infrastructure/k8s/services/api-gateway/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: andikisha
  labels:
    app: api-gateway
    version: "1.0.0"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      terminationGracePeriodSeconds: 30
      containers:
        - name: api-gateway
          image: andikisha/api-gateway:latest
          ports:
            - containerPort: 8080
              name: http
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: andikisha-secrets
                  key: jwt-secret
            - name: REDIS_HOST
              valueFrom:
                configMapKeyRef:
                  name: andikisha-config
                  key: redis-host
            - name: REDIS_PORT
              value: "6379"
            - name: REDIS_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: andikisha-secrets
                  key: redis-password
            - name: RABBITMQ_HOST
              valueFrom:
                configMapKeyRef:
                  name: andikisha-config
                  key: rabbitmq-host
            - name: RABBITMQ_USERNAME
              valueFrom:
                secretKeyRef:
                  name: andikisha-secrets
                  key: rabbitmq-username
            - name: RABBITMQ_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: andikisha-secrets
                  key: rabbitmq-password
            - name: ZIPKIN_ENDPOINT
              valueFrom:
                configMapKeyRef:
                  name: andikisha-config
                  key: zipkin-endpoint
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8080
            initialDelaySeconds: 45
            periodSeconds: 15
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            failureThreshold: 3
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 5"]
```

- [ ] **Step 11.2: Create api-gateway Service (LoadBalancer for external access)**

Create `infrastructure/k8s/services/api-gateway/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: andikisha
  labels:
    app: api-gateway
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: "nlb"
    service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
spec:
  type: LoadBalancer
  selector:
    app: api-gateway
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
```

- [ ] **Step 11.3: Create api-gateway kustomization.yaml**

Create `infrastructure/k8s/services/api-gateway/kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
```

- [ ] **Step 11.4: Create payroll-service Deployment with HPA**

Create `infrastructure/k8s/services/payroll-service/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payroll-service
  namespace: andikisha
  labels:
    app: payroll-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: payroll-service
  template:
    metadata:
      labels:
        app: payroll-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8084"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      terminationGracePeriodSeconds: 60
      containers:
        - name: payroll-service
          image: andikisha/payroll-service:latest
          ports:
            - containerPort: 8084
              name: http
            - containerPort: 9084
              name: grpc
          env:
            - name: SPRING_PROFILES_ACTIVE
              value: "prod"
            - name: DB_HOST
              valueFrom:
                configMapKeyRef:
                  name: andikisha-config
                  key: payroll-db-host
            - name: DB_PORT
              value: "5432"
            - name: DB_NAME
              value: "payroll_db"
            - name: DB_USERNAME
              valueFrom:
                secretKeyRef:
                  name: andikisha-secrets
                  key: payroll-db-username
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: andikisha-secrets
                  key: payroll-db-password
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: andikisha-secrets
                  key: jwt-secret
            - name: RABBITMQ_HOST
              valueFrom:
                configMapKeyRef:
                  name: andikisha-config
                  key: rabbitmq-host
            - name: RABBITMQ_USERNAME
              valueFrom:
                secretKeyRef:
                  name: andikisha-secrets
                  key: rabbitmq-username
            - name: RABBITMQ_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: andikisha-secrets
                  key: rabbitmq-password
            - name: EMPLOYEE_SERVICE_HOST
              value: "employee-service"
            - name: EMPLOYEE_SERVICE_GRPC_PORT
              value: "9082"
            - name: LEAVE_SERVICE_HOST
              value: "leave-service"
            - name: LEAVE_SERVICE_GRPC_PORT
              value: "9087"
            - name: ZIPKIN_ENDPOINT
              valueFrom:
                configMapKeyRef:
                  name: andikisha-config
                  key: zipkin-endpoint
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /actuator/health/liveness
              port: 8084
            initialDelaySeconds: 60
            periodSeconds: 15
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /actuator/health/readiness
              port: 8084
            initialDelaySeconds: 45
            periodSeconds: 10
            failureThreshold: 3
```

- [ ] **Step 11.5: Create payroll-service ClusterIP Service**

Create `infrastructure/k8s/services/payroll-service/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: payroll-service
  namespace: andikisha
  labels:
    app: payroll-service
spec:
  type: ClusterIP
  selector:
    app: payroll-service
  ports:
    - name: http
      port: 8084
      targetPort: 8084
    - name: grpc
      port: 9084
      targetPort: 9084
```

- [ ] **Step 11.6: Create payroll-service HPA**

Create `infrastructure/k8s/services/payroll-service/hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: payroll-service-hpa
  namespace: andikisha
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: payroll-service
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

- [ ] **Step 11.7: Create shared ConfigMap and Secrets templates**

Create `infrastructure/k8s/base/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: andikisha-config
  namespace: andikisha
data:
  rabbitmq-host: "rabbitmq"
  redis-host: "redis"
  zipkin-endpoint: "http://zipkin:9411/api/v2/spans"
  auth-db-host: "auth-postgres"
  tenant-db-host: "tenant-postgres"
  employee-db-host: "employee-postgres"
  payroll-db-host: "payroll-postgres"
  compliance-db-host: "compliance-postgres"
  leave-db-host: "leave-postgres"
  attendance-db-host: "attendance-postgres"
  document-db-host: "document-postgres"
  notification-db-host: "notification-postgres"
  integration-db-host: "integration-postgres"
  analytics-db-host: "analytics-postgres"
  audit-db-host: "audit-postgres"
```

Create `infrastructure/k8s/base/secret-template.yaml` (values filled by CI pipeline from AWS Secrets Manager):

```yaml
# DO NOT commit real values. This file is a template.
# The CI/CD pipeline replaces ${VAR} placeholders using AWS Secrets Manager
# via External Secrets Operator before applying to the cluster.
apiVersion: v1
kind: Secret
metadata:
  name: andikisha-secrets
  namespace: andikisha
type: Opaque
stringData:
  jwt-secret: "${JWT_SECRET}"
  redis-password: "${REDIS_PASSWORD}"
  rabbitmq-username: "${RABBITMQ_USERNAME}"
  rabbitmq-password: "${RABBITMQ_PASSWORD}"
  payroll-db-username: "${PAYROLL_DB_USERNAME}"
  payroll-db-password: "${PAYROLL_DB_PASSWORD}"
  # ... add all 12 DB credentials
  mpesa-consumer-key: "${MPESA_CONSUMER_KEY}"
  mpesa-consumer-secret: "${MPESA_CONSUMER_SECRET}"
  mpesa-security-credential: "${MPESA_SECURITY_CREDENTIAL}"
  credential-encryption-key: "${CREDENTIAL_ENCRYPTION_KEY}"
```

- [ ] **Step 11.8: Create remaining 11 service manifests**

Apply the same pattern from Steps 11.4–11.6 for each remaining service. Use this reference table:

| Service | HTTP Port | gRPC Port | Memory Request | HPA |
|---------|-----------|-----------|----------------|-----|
| auth-service | 8081 | 9081 | 256Mi | No |
| tenant-service | 8083 | 9083 | 256Mi | No |
| employee-service | 8082 | 9082 | 256Mi | No |
| compliance-service | 8085 | 9085 | 256Mi | No |
| time-attendance-service | 8086 | 9086 | 256Mi | No |
| leave-service | 8087 | 9087 | 256Mi | No |
| document-service | 8088 | 9088 | 256Mi | No |
| notification-service | 8089 | 9089 | 256Mi | No |
| integration-hub-service | 8090 | 9090 | 512Mi | No |
| analytics-service | 8091 | 9091 | 512Mi | Yes (CPU 70%) |
| audit-service | 8092 | — | 256Mi | No |

For each service: copy the deployment pattern from Step 11.4, replace port numbers, service name, and DB host configmap key. All services use `ClusterIP` (not `LoadBalancer`) — only api-gateway is LoadBalancer.

- [ ] **Step 11.9: Validate all manifests with kubectl dry-run**

```bash
kubectl apply --dry-run=client -f infrastructure/k8s/base/namespace.yaml
kubectl apply --dry-run=client -R -f infrastructure/k8s/services/
```

Expected: `configured (dry run)` or `created (dry run)` for all manifests. Zero errors.

- [ ] **Step 11.10: Commit**

```bash
git add infrastructure/k8s/
git commit -m "feat(k8s): add Kubernetes manifests for all 13 services

CB-11: Zero K8s manifests existed. Added Deployments (with liveness/readiness
probes, resource limits, graceful shutdown), ClusterIP Services (gRPC + HTTP
ports), HPA for payroll-service and analytics-service, shared ConfigMap and
Secret template, and base kustomization. api-gateway uses LoadBalancer."
```

---

## Task 12: GitHub Actions CI Pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

---

- [ ] **Step 12.1: Create CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ master, main, 'feature/**', 'fix/**' ]
  pull_request:
    branches: [ master, main ]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-test:
    name: Build & Test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      checks: write
      pull-requests: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: gradle

      - name: Validate Gradle wrapper
        uses: gradle/wrapper-validation-action@v2

      - name: Build (compile only — fast feedback)
        run: ./gradlew classes testClasses --parallel --build-cache
        env:
          GRADLE_OPTS: "-Dorg.gradle.daemon=false"

      - name: Checkstyle
        run: ./gradlew checkstyleMain checkstyleTest --parallel
        continue-on-error: false

      - name: Unit Tests
        run: ./gradlew test --parallel --build-cache
        env:
          GRADLE_OPTS: "-Dorg.gradle.daemon=false -Dorg.gradle.workers.max=4"

      - name: Publish Test Results
        uses: EnricoMi/publish-unit-test-result-action@v2
        if: always()
        with:
          files: '**/build/test-results/test/**/*.xml'

      - name: Upload Test Reports
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-reports
          path: '**/build/reports/tests/'
          retention-days: 7

  docker-build:
    name: Docker Build (verify images build)
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.event_name == 'push'
    strategy:
      matrix:
        service:
          - api-gateway
          - auth-service
          - tenant-service
          - employee-service
          - payroll-service
          - compliance-service
          - time-attendance-service
          - leave-service
          - document-service
          - notification-service
          - integration-hub-service
          - analytics-service
          - audit-service

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: gradle

      - name: Build fat JAR
        run: ./gradlew :services:${{ matrix.service }}:bootJar

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Docker image (no push on PR)
        uses: docker/build-push-action@v5
        with:
          context: .
          file: infrastructure/docker/Dockerfile.service
          build-args: SERVICE_NAME=${{ matrix.service }}
          push: false
          tags: andikisha/${{ matrix.service }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

- [ ] **Step 12.2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat(ci): add GitHub Actions CI pipeline

CB-11: No CI pipeline existed. Added build → checkstyle → test → docker-build
pipeline that runs on every push and PR. Tests run in parallel with 4 workers.
Docker images built for all 13 services on every push to verify Dockerfile
correctness. Test results published as PR checks."
```

---

## Task 13: GitHub Actions CD Pipeline

**Files:**
- Create: `.github/workflows/cd-staging.yml`
- Create: `.github/workflows/cd-production.yml`

---

- [ ] **Step 13.1: Create staging CD workflow**

Create `.github/workflows/cd-staging.yml`:

```yaml
name: CD — Staging

on:
  push:
    branches: [ master ]

env:
  AWS_REGION: af-south-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.af-south-1.amazonaws.com
  EKS_CLUSTER: andikisha-staging

jobs:
  push-and-deploy:
    name: Push Images & Deploy to Staging
    runs-on: ubuntu-latest
    environment: staging
    permissions:
      id-token: write
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v2

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: gradle

      - name: Build all fat JARs
        run: ./gradlew bootJar --parallel

      - name: Build and push all Docker images
        run: |
          SERVICES=(api-gateway auth-service tenant-service employee-service \
                    payroll-service compliance-service time-attendance-service \
                    leave-service document-service notification-service \
                    integration-hub-service analytics-service audit-service)

          for SERVICE in "${SERVICES[@]}"; do
            IMAGE_TAG="${{ env.ECR_REGISTRY }}/andikisha/${SERVICE}:${{ github.sha }}"
            docker build \
              --build-arg SERVICE_NAME=${SERVICE} \
              -f infrastructure/docker/Dockerfile.service \
              -t ${IMAGE_TAG} .
            docker push ${IMAGE_TAG}
            echo "${SERVICE}_IMAGE=${IMAGE_TAG}" >> $GITHUB_ENV
          done

      - name: Update kubeconfig for EKS
        run: aws eks update-kubeconfig --name ${{ env.EKS_CLUSTER }} --region ${{ env.AWS_REGION }}

      - name: Deploy to staging with kustomize
        run: |
          # Update image tags in kustomization
          cd infrastructure/k8s
          kustomize edit set image \
            andikisha/api-gateway=${{ env.ECR_REGISTRY }}/andikisha/api-gateway:${{ github.sha }} \
            andikisha/payroll-service=${{ env.ECR_REGISTRY }}/andikisha/payroll-service:${{ github.sha }}
          # (repeat for all 13 services)
          kubectl apply -k .

      - name: Wait for rollout
        run: |
          kubectl rollout status deployment/api-gateway -n andikisha --timeout=5m
          kubectl rollout status deployment/payroll-service -n andikisha --timeout=5m

      - name: Smoke test staging
        run: |
          GATEWAY_URL=$(kubectl get svc api-gateway -n andikisha \
            -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
          curl -sf http://${GATEWAY_URL}/api/v1/gateway/health | jq '.status'
```

- [ ] **Step 13.2: Create production CD workflow (manual trigger)**

Create `.github/workflows/cd-production.yml`:

```yaml
name: CD — Production

on:
  workflow_dispatch:
    inputs:
      image_tag:
        description: 'Image tag to deploy (GitHub SHA from staging)'
        required: true
      confirm:
        description: 'Type DEPLOY to confirm production deployment'
        required: true

env:
  AWS_REGION: af-south-1
  ECR_REGISTRY: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.af-south-1.amazonaws.com
  EKS_CLUSTER: andikisha-production

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production   # requires manual approval in GitHub
    if: ${{ github.event.inputs.confirm == 'DEPLOY' }}

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_PROD_DEPLOY_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Update kubeconfig for production EKS
        run: aws eks update-kubeconfig --name ${{ env.EKS_CLUSTER }} --region ${{ env.AWS_REGION }}

      - name: Deploy to production
        run: |
          TAG=${{ github.event.inputs.image_tag }}
          cd infrastructure/k8s
          kustomize edit set image \
            andikisha/api-gateway=${{ env.ECR_REGISTRY }}/andikisha/api-gateway:${TAG}
          # (repeat for all 13 services)
          kubectl apply -k .

      - name: Monitor rollout
        run: |
          for SERVICE in api-gateway auth-service payroll-service leave-service; do
            kubectl rollout status deployment/${SERVICE} -n andikisha --timeout=10m
          done
```

- [ ] **Step 13.3: Add GitHub Actions secrets documentation**

Create `infrastructure/docs/github-secrets.md`:

```markdown
# Required GitHub Actions Secrets

Set these in GitHub → Settings → Secrets and variables → Actions.

## AWS
- `AWS_ACCOUNT_ID` — AWS account ID (12 digits)
- `AWS_DEPLOY_ROLE_ARN` — IAM role ARN for staging deployment (OIDC)
- `AWS_PROD_DEPLOY_ROLE_ARN` — IAM role ARN for production deployment (OIDC)

## Database (one per service)
Set via AWS Secrets Manager — the External Secrets Operator syncs these to K8s.
Do NOT add DB passwords as GitHub secrets. Use AWS Secrets Manager paths:
- `/andikisha/prod/payroll-db-password`
- `/andikisha/prod/auth-db-password`
- (... etc. one per service)

## Application Secrets
- `/andikisha/prod/jwt-secret` (minimum 32-byte base64-encoded string)
- `/andikisha/prod/redis-password`
- `/andikisha/prod/rabbitmq-password`
- `/andikisha/prod/mpesa-consumer-key`
- `/andikisha/prod/mpesa-consumer-secret`
- `/andikisha/prod/credential-encryption-key`
```

- [ ] **Step 13.4: Commit**

```bash
git add .github/workflows/cd-staging.yml .github/workflows/cd-production.yml infrastructure/docs/
git commit -m "feat(ci): add staging and production CD pipelines

CB-11: No deployment automation existed. Staging deploys automatically on
every merge to master. Production deploys via manual workflow_dispatch with
confirmation gate and requires GitHub environment approval. Both use OIDC
for AWS credentials — no long-lived access keys in secrets."
```

---

## Task 14: Distributed Tracing (Micrometer Brave + Zipkin)

Zipkin is already running in the infra compose, but no service sends it any spans.

**Files (repeat for each of the 13 services):**
- Modify: `services/{service}/build.gradle.kts` — add tracing dependencies
- Modify: `services/{service}/src/main/resources/application.yml` — add tracing config

---

- [ ] **Step 14.1: Add tracing dependencies to all 13 build.gradle.kts files**

For each service's `build.gradle.kts`, add these three dependencies in the `dependencies` block:

```kotlin
    // Distributed tracing — Brave bridge to Zipkin
    implementation("io.micrometer:micrometer-tracing-bridge-brave")
    implementation("io.zipkin.reporter2:zipkin-reporter-brave")
    implementation("io.zipkin.reporter2:zipkin-sender-okhttp3")
```

Run this to verify all 13 services compile with the new deps:

```bash
./gradlew classes --parallel
```

Expected: `BUILD SUCCESSFUL` — no unresolved dependency errors.

- [ ] **Step 14.2: Add tracing config to all 13 application.yml files**

For each service's `src/main/resources/application.yml`, add under the `management` section:

```yaml
management:
  tracing:
    sampling:
      probability: 1.0    # 100% in pre-prod/staging; tune to 0.1 (10%) in production
  zipkin:
    tracing:
      endpoint: ${ZIPKIN_ENDPOINT:http://localhost:9411/api/v2/spans}
```

Also add the `logging.pattern.level` to include trace and span IDs in every log line:

```yaml
logging:
  pattern:
    level: "%5p [${spring.application.name},%X{traceId:-},%X{spanId:-}]"
```

- [ ] **Step 14.3: Verify tracing works locally**

Start the infra stack:
```bash
cd infrastructure/docker && docker compose -f docker-compose.infra.yml up -d zipkin
```

Run payroll-service locally with:
```bash
./gradlew :services:payroll-service:bootRun
```

Make a request:
```bash
curl http://localhost:8084/actuator/health
```

Open Zipkin UI at `http://localhost:9411` and verify a span appears for payroll-service.

Expected: Span visible in Zipkin with service name `payroll-service`.

- [ ] **Step 14.4: Commit**

```bash
git add services/*/build.gradle.kts services/*/src/main/resources/application.yml
git commit -m "feat(observability): add distributed tracing to all 13 services

Zipkin was running but receiving zero spans. Added micrometer-tracing-bridge-brave
and zipkin-reporter-brave to all 13 services. Trace/span IDs now appear in every
log line. 100% sampling in pre-prod; tune ZIPKIN_ENDPOINT via env var in production."
```

---

## Task 15: Structured JSON Logging

Plain-text logs are not queryable in ELK/CloudWatch. Need Logstash JSON format across all services.

**Files (repeat for each of the 13 services):**
- Modify: `services/{service}/build.gradle.kts` — add logstash encoder
- Create: `services/{service}/src/main/resources/logback-spring.xml`

---

- [ ] **Step 15.1: Add logstash-logback-encoder dependency to all 13 build.gradle.kts files**

Add to each service's `build.gradle.kts`:

```kotlin
    implementation("net.logstash.logback:logstash-logback-encoder:8.0")
```

- [ ] **Step 15.2: Create logback-spring.xml for each service**

Create `services/{service}/src/main/resources/logback-spring.xml` for all 13 services. Replace `{SERVICE_NAME}` with the service name in each file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <springProperty scope="context" name="appName" source="spring.application.name"/>
    <springProperty scope="context" name="activeProfile" source="spring.profiles.active" defaultValue="dev"/>

    <!-- JSON output for production and staging -->
    <springProfile name="prod,staging">
        <appender name="JSON_CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
            <encoder class="net.logstash.logback.encoder.LogstashEncoder">
                <includeMdcKeyName>tenantId</includeMdcKeyName>
                <includeMdcKeyName>requestId</includeMdcKeyName>
                <includeMdcKeyName>traceId</includeMdcKeyName>
                <includeMdcKeyName>spanId</includeMdcKeyName>
                <customFields>{"service":"${appName}","env":"${activeProfile}"}</customFields>
                <throwableConverter class="net.logstash.logback.stacktrace.ShortenedThrowableConverter">
                    <maxDepthPerCause>10</maxDepthPerCause>
                    <shortenedClassNameLength>20</shortenedClassNameLength>
                    <rootCauseFirst>true</rootCauseFirst>
                </throwableConverter>
            </encoder>
        </appender>

        <root level="INFO">
            <appender-ref ref="JSON_CONSOLE"/>
        </root>

        <!-- Reduce framework noise in production -->
        <logger name="org.hibernate.SQL" level="WARN"/>
        <logger name="org.springframework.security" level="WARN"/>
        <logger name="io.grpc" level="WARN"/>
    </springProfile>

    <!-- Human-readable output for dev and test -->
    <springProfile name="dev,test,default">
        <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
            <encoder>
                <pattern>%d{HH:mm:ss.SSS} %highlight(%-5level) [%thread] [%X{tenantId:-no-tenant}] %cyan(%logger{36}) - %msg%n</pattern>
            </encoder>
        </appender>

        <root level="DEBUG">
            <appender-ref ref="CONSOLE"/>
        </root>

        <logger name="org.hibernate.SQL" level="DEBUG"/>
        <logger name="org.hibernate.type.descriptor.sql.BasicBinder" level="TRACE"/>
    </springProfile>
</configuration>
```

- [ ] **Step 15.3: Verify dev profile still produces readable output**

```bash
./gradlew :services:payroll-service:bootRun
```

Make a request and confirm logs are human-readable (not JSON) in dev mode.

Expected: Console shows coloured human-readable log lines.

- [ ] **Step 15.4: Verify prod profile produces JSON**

```bash
SPRING_PROFILES_ACTIVE=prod ./gradlew :services:payroll-service:bootRun
```

Expected: Console shows JSON lines like:
```json
{"@timestamp":"2026-04-29T...","level":"INFO","service":"payroll-service","message":"..."}
```

- [ ] **Step 15.5: Remove format_sql from base application.yml (it was dev-only)**

For each of the 10 services that have `format_sql: true` in their base `application.yml` (not `application-dev.yml`), move or remove it:

In `application.yml`, find and remove:
```yaml
    properties:
      hibernate:
        format_sql: true
```

In `application-dev.yml` (create if it doesn't exist), add:
```yaml
spring:
  jpa:
    properties:
      hibernate:
        format_sql: true
        show_sql: true
```

Services affected: analytics, audit, compliance, document, employee, integration-hub, leave, notification, payroll, tenant, time-attendance.

- [ ] **Step 15.6: Build and run all tests to confirm no regressions**

```bash
./gradlew build --parallel
```

Expected: `BUILD SUCCESSFUL` — all 573 tests pass.

- [ ] **Step 15.7: Commit**

```bash
git add services/*/src/main/resources/logback-spring.xml services/*/build.gradle.kts services/*/src/main/resources/application.yml services/*/src/main/resources/application-dev.yml
git commit -m "feat(observability): add structured JSON logging to all 13 services

Plain-text logs were not queryable in CloudWatch/ELK. Added logback-spring.xml
with LogstashEncoder for prod/staging profiles. Dev profile retains coloured
human-readable output. Moved format_sql: true from base application.yml to
application-dev.yml for all 10 affected services."
```

---

## Task 16: Full-Stack Docker Compose

No single Docker Compose file exists that brings up all 13 services together for integration testing or on-call reproduction.

**Files:**
- Create: `infrastructure/docker/docker-compose.full.yml`
- Create: `infrastructure/docker/.env.example`
- Modify: `infrastructure/docker/docker-compose.infra.yml` — replace hardcoded credentials with env-var substitution

---

- [ ] **Step 16.1: Create .env.example**

Create `infrastructure/docker/.env.example`:

```bash
# Copy this file to .env and fill in values
# .env is gitignored — never commit real values

# PostgreSQL
POSTGRES_PASSWORD=changeme-dev-only
POSTGRES_USER=andikisha

# RabbitMQ
RABBITMQ_DEFAULT_USER=andikisha
RABBITMQ_DEFAULT_PASS=changeme-dev-only

# Redis
REDIS_PASSWORD=changeme-dev-only

# JWT
JWT_SECRET=dGhpcy1pcy1hLXRlc3Qtc2VjcmV0LXRoYXQtaXMtbG9uZy1lbm91Z2gtZm9yLUhTMjU2

# M-Pesa (Sandbox)
MPESA_CONSUMER_KEY=your-sandbox-key
MPESA_CONSUMER_SECRET=your-sandbox-secret
MPESA_SECURITY_CREDENTIAL=your-sandbox-credential
MPESA_CALLBACK_IP_VALIDATION_DISABLED=true

# Tracing
ZIPKIN_ENDPOINT=http://zipkin:9411/api/v2/spans
```

- [ ] **Step 16.2: Update docker-compose.infra.yml to use env-var substitution**

Open `infrastructure/docker/docker-compose.infra.yml`. Replace all occurrences of hardcoded `changeme` with env-var fallbacks:

```bash
# Run this sed to replace all 13 POSTGRES_PASSWORD occurrences
sed -i 's/POSTGRES_PASSWORD: changeme/POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}/g' infrastructure/docker/docker-compose.infra.yml
sed -i 's/RABBITMQ_DEFAULT_PASS: changeme/RABBITMQ_DEFAULT_PASS: ${RABBITMQ_DEFAULT_PASS:-changeme}/g' infrastructure/docker/docker-compose.infra.yml
```

Also add Redis authentication:
```yaml
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD:-changeme}
    # ... rest of existing config
```

- [ ] **Step 16.3: Create docker-compose.full.yml**

Create `infrastructure/docker/docker-compose.full.yml`:

```yaml
# Full-stack compose: all 13 services + infrastructure
# Usage: docker compose -f docker-compose.infra.yml -f docker-compose.full.yml up -d
# Requires: .env file with values from .env.example

version: '3.9'

services:
  api-gateway:
    build:
      context: ../..
      dockerfile: infrastructure/docker/Dockerfile.service
      args:
        SERVICE_NAME: api-gateway
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: dev
      JWT_SECRET: ${JWT_SECRET}
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD:-changeme}
      RABBITMQ_HOST: rabbitmq
      RABBITMQ_USERNAME: ${RABBITMQ_DEFAULT_USER:-andikisha}
      RABBITMQ_PASSWORD: ${RABBITMQ_DEFAULT_PASS:-changeme}
      ZIPKIN_ENDPOINT: http://zipkin:9411/api/v2/spans
    depends_on:
      rabbitmq:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  auth-service:
    build:
      context: ../..
      dockerfile: infrastructure/docker/Dockerfile.service
      args:
        SERVICE_NAME: auth-service
    ports:
      - "8081:8081"
      - "9081:9081"
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_HOST: auth-postgres
      DB_NAME: auth_db
      DB_USERNAME: ${POSTGRES_USER:-andikisha}
      DB_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
      JWT_SECRET: ${JWT_SECRET}
      RABBITMQ_HOST: rabbitmq
      RABBITMQ_USERNAME: ${RABBITMQ_DEFAULT_USER:-andikisha}
      RABBITMQ_PASSWORD: ${RABBITMQ_DEFAULT_PASS:-changeme}
      ZIPKIN_ENDPOINT: http://zipkin:9411/api/v2/spans
    depends_on:
      auth-postgres:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  # ... (repeat pattern for all 13 services)
  # payroll-service: port 8084/9084, DB payroll-postgres, add EMPLOYEE_SERVICE_HOST/GRPC_PORT
  # employee-service: port 8082/9082, DB employee-postgres
  # tenant-service: port 8083/9083, DB tenant-postgres, add AUTH_SERVICE_HOST/GRPC_PORT
  # compliance-service: port 8085/9085, DB compliance-postgres
  # leave-service: port 8087/9087, DB leave-postgres
  # time-attendance-service: port 8086/9086, DB attendance-postgres
  # document-service: port 8088/9088, DB document-postgres
  # notification-service: port 8089/9089, DB notification-postgres
  # integration-hub-service: port 8090/9090, DB integration-postgres, add MPESA env vars
  # analytics-service: port 8091/9091, DB analytics-postgres
  # audit-service: port 8092:8092, DB audit-postgres
```

Add a `.gitignore` entry:
```bash
echo "infrastructure/docker/.env" >> .gitignore
```

- [ ] **Step 16.4: Commit**

```bash
git add infrastructure/docker/ .gitignore
git commit -m "feat(docker): add full-stack docker-compose and env-var credential substitution

No single compose file existed to run all 13 services. Added docker-compose.full.yml
and .env.example. Replaced 13 hardcoded 'changeme' passwords in infra compose with
env-var substitution. Added Redis authentication. Added .env.example to document
all required env vars for new developers."
```

---

## Final Verification

- [ ] **Step V.1: Run full build**

```bash
./gradlew build --parallel
```

Expected: `BUILD SUCCESSFUL`

- [ ] **Step V.2: Validate K8s manifests**

```bash
kubectl apply --dry-run=client -R -f infrastructure/k8s/
```

Expected: All manifests valid. Zero errors.

- [ ] **Step V.3: Verify CI pipeline syntax**

```bash
# Install act (GitHub Actions local runner) if available
# act -n   # dry run — validates workflow YAML
cat .github/workflows/ci.yml | python3 -c "import sys,yaml; yaml.safe_load(sys.stdin)" && echo "YAML valid"
```

Expected: No YAML parse errors.

- [ ] **Step V.4: Tag the DevOps milestone**

```bash
git tag -a v0.9.1-devops -m "Phase 2 complete: K8s manifests, CI/CD, tracing, and structured logging"
```
