package com.andikisha.employee.application.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class EmployeeNumberGenerator {

    private final JdbcTemplate jdbcTemplate;

    public EmployeeNumberGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Atomically increments the per-tenant counter and returns the next employee number.
     * Uses PostgreSQL's INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING to avoid race
     * conditions when multiple requests create employees for the same tenant concurrently.
     * Must be called within an active transaction so the lock is held until commit.
     */
    public String generate(String tenantId) {
        Integer next = jdbcTemplate.queryForObject("""
                INSERT INTO employee_number_sequences (tenant_id, last_number)
                VALUES (?, 1)
                ON CONFLICT (tenant_id) DO UPDATE
                    SET last_number = employee_number_sequences.last_number + 1
                RETURNING last_number
                """,
                Integer.class, tenantId);
        return String.format("EMP-%04d", next);
    }
}
