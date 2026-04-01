rootProject.name = "andikisha"

// Shared libraries
include("shared:andikisha-common")
include("shared:andikisha-proto")
include("shared:andikisha-events")

// Phase 1: Foundation Services
include("services:api-gateway")
include("services:auth-service")
include("services:employee-service")
include("services:tenant-service")

// Phase 2: Core HR Services
include("services:payroll-service")
include("services:compliance-service")
include("services:time-attendance-service")
include("services:leave-service")

// Phase 3: Supporting Services
include("services:document-service")
include("services:notification-service")
include("services:integration-hub-service")

// Phase 4: Intelligence Services
include("services:analytics-service")
include("services:audit-service")