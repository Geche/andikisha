-- infrastructure/docker/init-db.sql
-- Creates all AndikishaHR databases in a single PostgreSQL instance.
-- Mounted at /docker-entrypoint-initdb.d/ — runs once on first container start.
-- The connecting user (POSTGRES_USER) becomes the owner of each database.

CREATE DATABASE andikisha_auth;
CREATE DATABASE andikisha_tenant;
CREATE DATABASE andikisha_employee;
CREATE DATABASE andikisha_payroll;
CREATE DATABASE andikisha_leave;
CREATE DATABASE andikisha_compliance;
CREATE DATABASE andikisha_time;
CREATE DATABASE andikisha_document;
CREATE DATABASE andikisha_notify;
CREATE DATABASE andikisha_integration;
CREATE DATABASE andikisha_analytics;
CREATE DATABASE andikisha_audit;
