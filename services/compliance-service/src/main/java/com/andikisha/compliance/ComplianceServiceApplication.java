package com.andikisha.compliance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

// scanBasePackages must include andikisha-common so that GlobalExceptionHandler
// (@RestControllerAdvice) and other shared beans are registered in the context.
@SpringBootApplication(scanBasePackages = {"com.andikisha.compliance", "com.andikisha.common"})
@EnableJpaAuditing
public class ComplianceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ComplianceServiceApplication.class, args);
    }
}
