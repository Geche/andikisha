package com.andikisha.gateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Value("${app.swagger.gateway-url:http://localhost:8080}")
    private String gatewayUrl;

    @Bean
    public OpenAPI andikishaOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("AndikishaHR API")
                        .description("""
                    AndikishaHR Enterprise HR and Payroll SaaS Platform API.

                    This API provides endpoints for employee management, payroll processing,
                    leave management, time and attendance, statutory compliance, document
                    generation, notifications, and integrations with M-Pesa, KRA iTax,
                    NSSF, and SHIF.

                    All endpoints except authentication require a valid JWT Bearer token
                    in the Authorization header and an X-Tenant-ID header identifying the
                    tenant (company).
                    """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("AndikishaHR Engineering")
                                .email("engineering@andikisha.co.ke")
                                .url("https://andikisha.co.ke"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://andikisha.co.ke/terms")))
                .servers(List.of(
                        new Server().url(gatewayUrl).description("API Gateway")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Auth"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("Bearer Auth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT access token obtained from /api/v1/auth/login")));
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder()
                .group("1-authentication")
                .pathsToMatch("/api/v1/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi tenantApi() {
        return GroupedOpenApi.builder()
                .group("2-tenants")
                .pathsToMatch("/api/v1/tenants/**", "/api/v1/plans/**",
                        "/api/v1/feature-flags/**")
                .build();
    }

    @Bean
    public GroupedOpenApi employeeApi() {
        return GroupedOpenApi.builder()
                .group("3-employees")
                .pathsToMatch("/api/v1/employees/**", "/api/v1/departments/**")
                .build();
    }

    @Bean
    public GroupedOpenApi payrollApi() {
        return GroupedOpenApi.builder()
                .group("4-payroll")
                .pathsToMatch("/api/v1/payroll/**")
                .build();
    }

    @Bean
    public GroupedOpenApi leaveApi() {
        return GroupedOpenApi.builder()
                .group("5-leave")
                .pathsToMatch("/api/v1/leave/**")
                .build();
    }

    @Bean
    public GroupedOpenApi attendanceApi() {
        return GroupedOpenApi.builder()
                .group("6-attendance")
                .pathsToMatch("/api/v1/attendance/**")
                .build();
    }

    @Bean
    public GroupedOpenApi complianceApi() {
        return GroupedOpenApi.builder()
                .group("7-compliance")
                .pathsToMatch("/api/v1/compliance/**")
                .build();
    }

    @Bean
    public GroupedOpenApi documentsApi() {
        return GroupedOpenApi.builder()
                .group("8-documents")
                .pathsToMatch("/api/v1/documents/**")
                .build();
    }

    @Bean
    public GroupedOpenApi notificationsApi() {
        return GroupedOpenApi.builder()
                .group("9-notifications")
                .pathsToMatch("/api/v1/notifications/**")
                .build();
    }

    @Bean
    public GroupedOpenApi integrationsApi() {
        return GroupedOpenApi.builder()
                .group("10-integrations")
                .pathsToMatch("/api/v1/payments/**", "/api/v1/filings/**",
                        "/api/v1/integrations/**")
                .build();
    }

    @Bean
    public GroupedOpenApi analyticsApi() {
        return GroupedOpenApi.builder()
                .group("11-analytics")
                .pathsToMatch("/api/v1/analytics/**")
                .build();
    }

    @Bean
    public GroupedOpenApi auditApi() {
        return GroupedOpenApi.builder()
                .group("12-audit")
                .pathsToMatch("/api/v1/audit/**")
                .build();
    }
}