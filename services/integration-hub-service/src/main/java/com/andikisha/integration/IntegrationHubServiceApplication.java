package com.andikisha.integration;

import com.andikisha.integration.infrastructure.config.IntegrationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(IntegrationProperties.class)
public class IntegrationHubServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntegrationHubServiceApplication.class, args);
    }
}
