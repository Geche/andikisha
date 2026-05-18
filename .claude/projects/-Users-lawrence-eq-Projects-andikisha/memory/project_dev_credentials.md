---
name: project-dev-credentials
description: Dev demo account passwords, tenant ID, portal URLs, and Redis licence seed command
metadata:
  type: project
---

All passwords were reset to `Password123!` on 2026-05-18. Passwords are BCrypt-hashed in the `andikisha_auth` database `users` table.

## Demo Accounts

| Role | Email | Password | Portal URL |
|---|---|---|---|
| ADMIN | admin@demo.co.ke | Password123! | http://localhost:3000 |
| EMPLOYEE | jane.w@demo.co.ke | Password123! | http://localhost:3000 |
| SUPER_ADMIN | superadmin@andikisha.com | Password123! | http://localhost:3003 |

## Tenant ID (demo tenant)
`1cc12430-7c3a-45b7-8973-469622778c9d`

## Redis Licence Cache Seed
The gateway enforces a Redis licence check. Run this after any Redis restart:
```
docker exec andikisha-redis redis-cli -a changeme SET "licence:status:1cc12430-7c3a-45b7-8973-469622778c9d" "ACTIVE" EX 86400
```

## Reset Passwords (if needed)
```bash
HASH=$(node -e "const b=require('/tmp/node_modules/bcryptjs'); console.log(b.hashSync('Password123!',12))")
docker exec andikisha-postgres-auth psql -U andikisha -d andikisha_auth -c \
  "UPDATE users SET password_hash='$HASH' WHERE email IN ('admin@demo.co.ke','jane.w@demo.co.ke','superadmin@andikisha.com');"
```

## Rate Limit Note
The tenant-portal BFF (`/api/auth/login`) has an in-memory rate limiter: 10 attempts per 15 minutes per IP.
If locked out, restart the Next.js dev server or wait 15 minutes.

**Why:** Passwords were generated at tenant provisioning time (random) and are not stored in plain text anywhere. The DB column is `password_hash` (BCrypt). Reset via DB direct update as above.
