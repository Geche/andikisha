package com.andikisha.document.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record DocumentProperties(
        Storage storage,
        Grpc grpc
) {
    public record Storage(String basePath) {}
    public record Grpc(Payroll payroll) {}
    public record Payroll(int deadlineSeconds) {}
}
