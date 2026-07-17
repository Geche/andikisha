package com.andikisha.recruitment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// scanBasePackages includes com.andikisha.common so the SHARED @RestControllerAdvice
// (com.andikisha.common.exception.GlobalExceptionHandler → typed ErrorResponse) and the
// shared tenant classes are component-scanned. This service intentionally has NO local
// exception advice (Decision 2), matching document-service.
@SpringBootApplication(scanBasePackages = {"com.andikisha.recruitment", "com.andikisha.common"})
public class RecruitmentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RecruitmentServiceApplication.class, args);
    }
}
