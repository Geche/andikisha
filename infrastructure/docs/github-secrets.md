# Required GitHub Actions Secrets

Configure in: GitHub → Settings → Secrets and variables → Actions

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
