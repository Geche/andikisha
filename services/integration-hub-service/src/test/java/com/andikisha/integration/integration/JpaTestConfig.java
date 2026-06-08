package com.andikisha.integration.integration;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Enables JPA auditing inside the {@code @DataJpaTest} slice. The slice does not
 * load the production {@code @Configuration} that carries {@code @EnableJpaAuditing}
 * (integration-hub {@code infrastructure.config.JpaConfig}), so without this the
 * {@code @CreatedDate}/{@code @LastModifiedDate} columns on {@code BaseEntity}
 * stay null and inserts fail the {@code created_at} NOT NULL constraint.
 * Mirrors the same helper in compliance- and tenant-service.
 */
@TestConfiguration
@EnableJpaAuditing
class JpaTestConfig {}
