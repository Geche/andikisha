---
name: docker-k8s
description: Docker and Kubernetes patterns for AndikishaHR microservices. Auto-applies when creating Dockerfiles, Docker Compose configs, Kubernetes manifests, or deployment configurations.
---

# Docker and Kubernetes Patterns

## Multi-Stage Dockerfile

Every service uses the same Dockerfile pattern. Build with JDK, run with JRE.

```dockerfile
# infrastructure/docker/Dockerfile.service
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY gradle/ gradle/
COPY gradlew build.gradle.kts settings.gradle.kts gradle.properties ./
COPY shared/ shared/

ARG SERVICE_NAME
COPY services/${SERVICE_NAME}/ services/${SERVICE_NAME}/

RUN chmod +x gradlew
RUN ./gradlew :services:${SERVICE_NAME}:bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup

ARG SERVICE_NAME
COPY --from=builder /app/services/${SERVICE_NAME}/build/libs/*.jar app.jar

USER appuser
EXPOSE 8080 9090

ENTRYPOINT ["java", \
  "-XX:+UseG1GC", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
```

Build: `docker build -f infrastructure/docker/Dockerfile.service --build-arg SERVICE_NAME=employee-service -t andikisha/employee-service:latest .`

## Docker Compose (Local Infrastructure)

```yaml
# infrastructure/docker/docker-compose.infra.yml
services:
  postgres-auth:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: andikisha_auth
      POSTGRES_USER: andikisha
      POSTGRES_PASSWORD: changeme
    ports: ["5433:5432"]
    volumes: [pg_auth:/var/lib/postgresql/data]
    healthcheck:
      test: pg_isready -U andikisha -d andikisha_auth
      interval: 10s
      retries: 5

  # Repeat for each service database with different port

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    ports: ["5672:5672", "15672:15672"]
    environment:
      RABBITMQ_DEFAULT_USER: andikisha
      RABBITMQ_DEFAULT_PASS: changeme
    volumes: [rabbitmq:/var/lib/rabbitmq]
    healthcheck:
      test: rabbitmq-diagnostics -q check_running
      interval: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: [redis:/data]

  zipkin:
    image: openzipkin/zipkin
    ports: ["9411:9411"]
```

## Kubernetes Deployment Template

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {service-name}
  namespace: andikisha-hr
  labels:
    app: {service-name}
    phase: "{phase-number}"
spec:
  replicas: 3
  selector:
    matchLabels:
      app: {service-name}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: {service-name}
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "{http-port}"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      containers:
      - name: {service-name}
        image: andikisha/{service-name}:latest
        ports:
        - containerPort: {http-port}
          name: http
        - containerPort: {grpc-port}
          name: grpc
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: SERVER_PORT
          value: "{http-port}"
        - name: GRPC_SERVER_PORT
          value: "{grpc-port}"
        envFrom:
        - configMapRef:
            name: andikisha-config
        - secretRef:
            name: andikisha-{service}-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: {http-port}
          initialDelaySeconds: 15
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: {http-port}
          initialDelaySeconds: 30
          periodSeconds: 15
        lifecycle:
          preStop:
            exec:
              command: ["sh", "-c", "sleep 10"]
---
apiVersion: v1
kind: Service
metadata:
  name: {service-name}
  namespace: andikisha-hr
spec:
  selector:
    app: {service-name}
  ports:
  - name: http
    port: {http-port}
    targetPort: {http-port}
  - name: grpc
    port: {grpc-port}
    targetPort: {grpc-port}
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {service-name}
  namespace: andikisha-hr
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {service-name}
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Build Commands

```bash
# Local dev
docker compose -f infrastructure/docker/docker-compose.infra.yml up -d
docker compose -f infrastructure/docker/docker-compose.infra.yml down
docker compose -f infrastructure/docker/docker-compose.infra.yml logs -f rabbitmq

# Build single service image
docker build -f infrastructure/docker/Dockerfile.service \
  --build-arg SERVICE_NAME=auth-service \
  -t andikisha/auth-service:$(git rev-parse --short HEAD) .

# Or use Spring Boot buildpacks (no Dockerfile needed)
./gradlew :services:auth-service:bootBuildImage \
  --imageName=andikisha/auth-service:latest

# Kubernetes
kubectl apply -f infrastructure/k8s/base/
kubectl apply -f infrastructure/k8s/services/auth-service/
kubectl get pods -n andikisha-hr
kubectl logs -f deployment/auth-service -n andikisha-hr
```
