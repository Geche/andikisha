---
description: Wire up RabbitMQ event communication between two services. Creates the event class, publisher, listener, exchange/queue config, and tests.
---

Set up async event communication between two AndikishaHR microservices via RabbitMQ.

## Inputs Required

Ask the user for:
1. Publishing service (e.g. employee-service)
2. Consuming service (e.g. payroll-service)
3. Event name (e.g. EmployeeTerminated)
4. Event payload fields (e.g. employeeId:String, reason:String, terminatedBy:String)
5. What the consumer should do when it receives the event

## What To Generate

1. **Event class** in shared/andikisha-events (extends BaseEvent): Java class with constructor, getters, eventType string.

2. **Publisher port interface** in publishing service's application/port/ (if not exists).

3. **RabbitMQ publisher implementation** in publishing service's infrastructure/messaging/. Sends to topic exchange with routing key matching eventType.

4. **RabbitMQ config** in publishing service: TopicExchange bean, dead letter exchange and queue.

5. **RabbitMQ listener** in consuming service's infrastructure/messaging/. Uses @RabbitListener with @QueueBinding. Sets TenantContext from event in try/finally block. Delegates to application service.

6. **RabbitMQ config** in consuming service: Queue bean, binding to exchange with routing key.

7. **Service method** in consuming service that handles the event logic.

8. Routing key convention: {domain}.{action} (e.g. employee.terminated)
9. Queue naming convention: {consumer}.{publisher}-events (e.g. payroll.employee-events)
10. Exchange naming convention: {domain}.events (e.g. employee.events)

Verify that the Jackson2JsonMessageConverter bean exists in both services for JSON serialization.
