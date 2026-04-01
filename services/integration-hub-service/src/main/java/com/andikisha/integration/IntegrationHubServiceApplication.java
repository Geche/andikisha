package com.andikisha.integration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class IntegrationHubServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntegrationHubServiceApplication.class, args);
    }
}
