# Implementation Plan: Analytics and Payroll Event Enhancements

## Context
The `analytics-service` requires more granular and accurate data to provide meaningful HR insights. Currently:
- `PayrollApprovedEvent` lacks statutory breakdown (PAYE, NSSF, SHIF, Housing Levy).
- Attendance data is not being captured by the analytics service.
- `LeaveEventListener` suffers from a double-counting bug and lack of context (type/dates) on rejections.

The goal is to enrich the event stream and correct the listener logic to ensure the analytics dashboard reflects accurate Kenyan statutory totals, attendance trends, and leave patterns.

## Implementation Approach

### 1. Statutory Fields in `PayrollApprovedEvent`
- **`shared/andikisha-events`**: Add `BigDecimal totalPAYE`, `totalNSSF`, `totalSHIF`, and `totalHousingLevy` to `PayrollApprovedEvent.java`.
- **`payroll-service`**:
    - Update `RabbitPayrollEventPublisher.java` to accept and map these new totals.
    - Update `PayrollService.java`: In `approvePayroll`, aggregate the statutory totals by summing the values from all `PaySlip` records associated with the `PayrollRun` before publishing the event.

### 2. Implement `AttendanceEventListener`
- **`analytics-service`**: Create `AttendanceEventListener.java` in `infrastructure/messaging`.
- **Logic**: 
    - Listen for `AttendanceRecordedEvent`.
    - Resolve tenant context.
    - Fetch or create the `AttendanceAnalytics` snapshot for the current `YearMonth`.
    - Increment the attendance count and save via `AttendanceAnalyticsRepository`.

### 3. Fix `LeaveEventListener` and `LeaveRejectedEvent`
- **`shared/andikisha-events`**: Add `String leaveType` and `LocalDate startDate` to `LeaveRejectedEvent.java`.
- **`analytics-service`**:
    - Modify `LeaveEventListener.java`:
        - **Remove** the call to `recordSubmission()` inside the `LeaveRejectedEvent` handler to fix the double-counting bug.
        - **Update Period**: Use `YearMonth.from(e.getStartDate()).toString()` instead of `YearMonth.now()`.
        - **Update Type**: Use `e.getLeaveType()` instead of hardcoded `"UNKNOWN"`.

### 4. Verification Plan
- **Unit Tests**: 
    - Verify `PayrollApprovedEvent` stores values correctly.
    - Verify `LeaveEventListener` does not call `recordSubmission` on rejections.
- **Integration Tests**: 
    - Use Testcontainers RabbitMQ to verify `payroll-service` $\rightarrow$ `analytics-service` flow for statutory totals.
- **E2E Tests**:
    - Approve a payroll run and verify the `analytics-service` database updates the statutory totals.
    - Reject a leave request and verify that only one submission is recorded and the rejection is attributed to the correct period and leave type.

## Critical Files
- `shared/andikisha-events/src/main/java/com/andikisha/events/payroll/PayrollApprovedEvent.java`
- `shared/andikisha-events/src/main/java/com/andikisha/events/leave/LeaveRejectedEvent.java`
- `services/payroll-service/src/main/java/com/andikisha/payroll/application/service/PayrollService.java`
- `services/payroll-service/src/main/java/com/andikisha/payroll/infrastructure/messaging/RabbitPayrollEventPublisher.java`
- `services/analytics-service/src/main/java/com/andikisha/analytics/infrastructure/messaging/LeaveEventListener.java`
- `services/analytics-service/src/main/java/com/andikisha/analytics/infrastructure/messaging/AttendanceEventListener.java` (New)
