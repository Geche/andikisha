---
name: flyway-migration
description: Flyway database migration patterns for AndikishaHR. Auto-applies when creating SQL migrations, altering tables, adding indexes, or managing schema-per-tenant provisioning.
---

# Flyway Migration Patterns

## File Naming

Versioned: V{number}__{description}.sql (double underscore)
Repeatable: R__{description}.sql (for views, functions)

Number sequentially per service. Check existing migrations before choosing the next number.

```
services/employee-service/src/main/resources/db/migration/
  V1__create_departments.sql
  V2__create_positions.sql
  V3__create_employees.sql
  V4__create_employment_contracts.sql
  V5__create_employee_history.sql
  V6__add_employee_email_index.sql
```

## Table Creation Template

Every table must include: id (UUID PK), tenant_id, created_at, updated_at, version.

```sql
-- V{N}__{description}.sql
-- Service: {service-name}
-- Author: {name}
-- Date: {YYYY-MM-DD}
-- Description: {what this migration does and why}

CREATE TABLE {table_name} (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       VARCHAR(50) NOT NULL,

    -- domain columns --

    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    version         BIGINT NOT NULL DEFAULT 0
);

-- Mandatory: tenant isolation index
CREATE INDEX idx_{table}_tenant ON {table_name}(tenant_id);

-- Optional: composite indexes for common query patterns
-- CREATE INDEX idx_{table}_tenant_status ON {table_name}(tenant_id, status);
```

## Column Type Conventions

| Java Type | PostgreSQL Type | Notes |
|-----------|----------------|-------|
| UUID | UUID | Always use gen_random_uuid() default |
| String | VARCHAR(n) | Specify max length, never use TEXT for indexed columns |
| String (long) | TEXT | For descriptions, notes, reasons |
| BigDecimal (money) | NUMERIC(15,2) | Always 15 precision, 2 scale |
| LocalDate | DATE | For hire dates, leave dates |
| LocalDateTime | TIMESTAMP | For audit timestamps |
| Instant | TIMESTAMP | Alternative for audit fields |
| Enum | VARCHAR(30) | Store as string, never as integer |
| boolean | BOOLEAN | With NOT NULL DEFAULT |
| Long | BIGINT | For version column |

## Constraints

```sql
-- Unique within tenant
UNIQUE(tenant_id, employee_number)
UNIQUE(tenant_id, national_id)

-- Foreign keys within same service only
REFERENCES departments(id)

-- Never create cross-service foreign keys
-- employee_id UUID NOT NULL  (no REFERENCES, just a UUID column)
```

## Adding Columns to Existing Tables

```sql
-- V{N}__add_{column}_to_{table}.sql
ALTER TABLE {table_name} ADD COLUMN {column_name} {type};

-- If NOT NULL, add with default first, then drop default
ALTER TABLE {table_name} ADD COLUMN {column_name} {type} NOT NULL DEFAULT {value};
ALTER TABLE {table_name} ALTER COLUMN {column_name} DROP DEFAULT;

-- Add index if queried frequently
CREATE INDEX idx_{table}_{column} ON {table_name}({column_name});
```

## Seed Data

Use V{N}__seed_{description}.sql for reference data (roles, permissions, plans, leave types).

```sql
-- V4__seed_default_roles.sql
INSERT INTO roles (id, tenant_id, name, created_at, updated_at, version) VALUES
    (gen_random_uuid(), 'SYSTEM', 'SUPER_ADMIN', NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'ADMIN', NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'HR_MANAGER', NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'HR', NOW(), NOW(), 0),
    (gen_random_uuid(), 'SYSTEM', 'EMPLOYEE', NOW(), NOW(), 0)
ON CONFLICT DO NOTHING;
```

## Rules

- Never use Hibernate ddl-auto to create or update schemas in any environment.
- Never modify a migration that has already been applied. Create a new migration instead.
- Always test migrations against a copy of production data before deploying.
- Include rollback comments (what to run to undo) as SQL comments in the migration.
- Keep migrations small and focused. One logical change per file.
