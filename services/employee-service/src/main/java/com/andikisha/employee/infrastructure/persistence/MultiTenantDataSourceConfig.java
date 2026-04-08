package com.andikisha.employee.infrastructure.persistence;

import org.springframework.context.annotation.Configuration;

/**
 * Placeholder for schema-per-tenant datasource routing (Phase 2 infrastructure).
 *
 * <p>When implemented this class will configure a Spring
 * {@code AbstractRoutingDataSource} that resolves the active datasource (or
 * schema search_path) from {@code TenantContext.getTenantId()} on every
 * request.  The current Phase-1 deployment uses a single shared schema with
 * {@code tenant_id} column isolation on every table.
 *
 * <p>Implementation checklist when ready:
 * <ol>
 *   <li>Extend {@code AbstractRoutingDataSource} and override
 *       {@code determineCurrentLookupKey()} to return
 *       {@code TenantContext.getTenantId()}.</li>
 *   <li>Register one DataSource per tenant, or switch the PostgreSQL
 *       {@code search_path} via a JDBC connection decorator.</li>
 *   <li>Provision per-tenant schemas in the tenant-service on
 *       {@code TenantCreatedEvent}.</li>
 * </ol>
 */
@Configuration
public class MultiTenantDataSourceConfig {
    // No beans yet — see Javadoc above.
}
