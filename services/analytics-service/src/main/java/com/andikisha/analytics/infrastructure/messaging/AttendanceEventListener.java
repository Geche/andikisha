package com.andikisha.analytics.infrastructure.messaging;

import com.andikisha.analytics.domain.model.AttendanceAnalytics;
import com.andikisha.analytics.domain.repository.AttendanceAnalyticsRepository;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.attendance.ClockInEvent;
import com.andikisha.events.attendance.ClockOutEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;

@Component
public class AttendanceEventListener {

    private static final Logger log = LoggerFactory.getLogger(AttendanceEventListener.class);
    private static final ZoneId EAT = ZoneId.of("Africa/Nairobi");

    private final AttendanceAnalyticsRepository repository;

    public AttendanceEventListener(AttendanceAnalyticsRepository repository) {
        this.repository = repository;
    }

    @RabbitListener(queues = "analytics.attendance-events")
    @Transactional
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case ClockInEvent e -> {
                    String period = periodOf(e.getClockInTime());
                    AttendanceAnalytics analytics = getOrCreate(e.getTenantId(), period);
                    analytics.recordClockIn();
                    repository.save(analytics);
                    log.info("Attendance analytics updated: clock-in recorded for period {}", period);
                }
                case ClockOutEvent e -> {
                    String period = periodOf(e.getClockOutTime());
                    AttendanceAnalytics analytics = getOrCreate(e.getTenantId(), period);
                    // hoursWorked from the event represents total session hours.
                    // Regular vs overtime split is not available in the event; all recorded as regular.
                    analytics.addHours(e.getHoursWorked(), BigDecimal.ZERO);
                    repository.save(analytics);
                    log.info("Attendance analytics updated: {} hours recorded for period {}",
                            e.getHoursWorked(), period);
                }
                default -> log.debug("Ignoring attendance event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }

    private AttendanceAnalytics getOrCreate(String tenantId, String period) {
        return repository.findByTenantIdAndPeriod(tenantId, period)
                .orElseGet(() -> {
                    AttendanceAnalytics a = AttendanceAnalytics.create(tenantId, period);
                    return repository.save(a);
                });
    }

    private String periodOf(Instant instant) {
        return YearMonth.from(instant.atZone(EAT)).toString();
    }
}
