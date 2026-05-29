# Required GitHub Actions Secrets

Configure in: GitHub → Settings → Secrets and variables → Actions

## Dokploy / VPS

| Secret | Description |
|--------|-------------|
| `DOKPLOY_WEBHOOK_URL` | Redeploy webhook URL — copy from Dokploy UI → your compose service → Deployments tab |
| `API_DOMAIN` | Public API hostname e.g. `api.andikisha.co.ke` — used for post-deploy health verification in CI |

## Domain variables (set in Dokploy environment, not GitHub secrets)

These are read from the `.env` file on the VPS (or from Dokploy's Environment tab):

| Variable | Example | Description |
|----------|---------|-------------|
| `GHCR_OWNER` | `geche` | Lowercase GitHub username/org that owns the ghcr.io packages |
| `RELEASE_TAG` | `abc1234` | Git SHA to deploy; omit or set to `latest` for normal deploys. Set to a previous SHA to roll back. |
| `API_DOMAIN` | `api.andikisha.co.ke` | Public API domain (also set as GitHub secret for CI health check) |
| `TENANT_DOMAIN` | `app.andikisha.co.ke` | Tenant portal domain |
| `PLATFORM_DOMAIN` | `platform.andikisha.co.ke` | Platform portal domain |
| `LANDING_DOMAIN` | `andikisha.co.ke` | Landing site domain |

## AWS
| Secret | Description |
|--------|-------------|
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID |
| `AWS_DEPLOY_ROLE_ARN` | IAM role ARN for staging OIDC deployment |
| `AWS_PROD_DEPLOY_ROLE_ARN` | IAM role ARN for production OIDC deployment |

## Application secrets (synced from AWS Secrets Manager via External Secrets Operator)
| AWS Secrets Manager path | K8s secret key |
|--------------------------|----------------|
| `/andikisha/prod/jwt-secret` | `jwt-secret` |
| `/andikisha/prod/redis-password` | `redis-password` |
| `/andikisha/prod/rabbitmq-username` | `rabbitmq-username` |
| `/andikisha/prod/rabbitmq-password` | `rabbitmq-password` |
| `/andikisha/prod/auth-db-username` | `auth-db-username` |
| `/andikisha/prod/auth-db-password` | `auth-db-password` |
| `/andikisha/prod/payroll-db-username` | `payroll-db-username` |
| `/andikisha/prod/payroll-db-password` | `payroll-db-password` |
| *(one pair per remaining service)* | |
| `/andikisha/prod/mpesa-consumer-key` | `mpesa-consumer-key` |
| `/andikisha/prod/mpesa-consumer-secret` | `mpesa-consumer-secret` |
| `/andikisha/prod/mpesa-security-credential` | `mpesa-security-credential` |
| `/andikisha/prod/credential-encryption-key` | `credential-encryption-key` |

## OIDC trust policy
The deploy roles must trust `token.actions.githubusercontent.com` with condition
`sub == repo:YOUR_ORG/andikisha:ref:refs/heads/master` for staging and
`sub == repo:YOUR_ORG/andikisha:environment:production` for production.
