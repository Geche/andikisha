---
name: rabbitmq-events
description: RabbitMQ event-driven communication patterns for AndikishaHR. Auto-applies when creating event publishers, listeners, exchange/queue configuration, or dead letter handling.
---

# RabbitMQ Event Patterns

## Exchange Strategy

Topic exchanges per domain. Routing keys match event types.

| Exchange | Routing Keys |
|----------|-------------|
| employee.events | employee.created, employee.updated, employee.terminated, employee.salary_changed |
| payroll.events | payroll.initiated, payroll.approved, payroll.processed, payment.completed |
| leave.events | leave.requested, leave.approved, leave.rejected |
| tenant.events | tenant.created, tenant.suspended, tenant.plan_changed |
| compliance.events | compliance.rate_changed |

## Queue Naming

Pattern: {consumer-service}.{producer-domain}-events
Examples: payroll.employee-events, notification.payroll-events, audit.all-events

## Dead Letter Configuration

Every queue must have a dead letter exchange. Failed messages move to DLQ after 3 retries with exponential backoff.

```java
@Bean
Queue employeeEventsQueue() {
    return QueueBuilder.durable("payroll.employee-events")
        .withArgument("x-dead-letter-exchange", "dlx.payroll")
        .withArgument("x-dead-letter-routing-key", "dlq.payroll.employee")
        .build();
}
```

## Event Class Rules

- All events extend BaseEvent (provides eventId, eventType, tenantId, timestamp)
- Events are immutable. Use final fields only. No setters.
- Events carry only IDs and changed values, not full entity snapshots
- Events must be serializable to JSON via Jackson

## Listener Pattern

Always set and clear TenantContext. Always use try/finally.

```java
@RabbitListener(bindings = @QueueBinding(
    value = @Queue(value = "payroll.employee-events", durable = "true"),
    exchange = @Exchange(value = "employee.events", type = ExchangeTypes.TOPIC),
    key = {"employee.created", "employee.terminated", "employee.salary_changed"}
))
public void handle(BaseEvent event) {
    TenantContext.setTenantId(event.getTenantId());
    try {
        switch (event) {
            case EmployeeCreatedEvent e -> service.handleCreated(e);
            case EmployeeTerminatedEvent e -> service.handleTerminated(e);
            default -> log.warn("Unhandled: {}", event.getEventType());
        }
    } finally {
        TenantContext.clear();
    }
}
```
