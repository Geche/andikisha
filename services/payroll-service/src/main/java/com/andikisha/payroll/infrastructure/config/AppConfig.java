package com.andikisha.payroll.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class AppConfig {

    /**
     * Exposes a UTC clock as a bean so services can use LocalDateTime.now(clock)
     * instead of LocalDateTime.now(). This makes timestamps testable and
     * timezone-consistent across environments.
     */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
