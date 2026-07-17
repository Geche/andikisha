package com.andikisha.recruitment.infrastructure.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Enables JPA auditing so BaseEntity's @CreatedDate / @LastModifiedDate are populated on write.
 * Without this, inserts send null for created_at/updated_at and violate the NOT NULL columns.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {}
