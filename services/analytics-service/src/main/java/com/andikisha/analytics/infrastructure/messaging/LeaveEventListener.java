package com.andikisha.analytics.infrastructure.messaging;

import com.andikisha.analytics.domain.model.LeaveAnalytics;
import com.andikisha.analytics.domain.repository.LeaveAnalyticsRepository;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.leave.LeaveApprovedEvent;
import com.andikisha.events.leave.LeaveRejectedEvent;
import com.andikisha.events.leave.LeaveRequestedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;

@Component
public class LeaveEventListener {

    private static final Logger log = LoggerFactory.getLogger(LeaveEventListener.class);
    private final LeaveAnalyticsRepository repository;

    public LeaveEventListener(LeaveAnalyticsRepository repository) {
        this.repository = repository;
    }

    @RabbitListener(queues = "analytics.leave-events")
    @Transactional
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case LeaveRequestedEvent e -> {
                    String period = YearMonth.from(e.getStartDate()).toString();
                    LeaveAnalytics analytics = getOrCreate(
                            e.getTenantId(), period, e.getLeaveType());
                    analytics.recordSubmission();
                    repository.save(analytics);
                    log.info("Leave analytics updated: {} submission recorded", e.getLeaveType());
                }
                case LeaveApprovedEvent e -> {
                    String period = YearMonth.from(e.getStartDate()).toString();
                    LeaveAnalytics analytics = getOrCreate(
                            e.getTenantId(), period, e.getLeaveType());
                    analytics.recordApproval(e.getDays());
                    repository.save(analytics);
                    log.info("Leave analytics updated: {} approved {} days",
                            e.getLeaveType(), e.getDays());
                }
                case LeaveRejectedEvent e -> {
                    String period = YearMonth.now().toString();
                    LeaveAnalytics analytics = getOrCreate(
                            e.getTenantId(), period, e.getLeaveType());
                    analytics.recordRejection();
                    repository.save(analytics);
                    log.info("Leave analytics updated: {} rejection recorded", e.getLeaveType());
                }
                default -> log.debug("Ignoring leave event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }

    private LeaveAnalytics getOrCreate(String tenantId, String period, String leaveType) {
        return repository.findByTenantIdAndPeriodAndLeaveType(tenantId, period, leaveType)
                .orElseGet(() -> {
                    LeaveAnalytics la = LeaveAnalytics.create(tenantId, period, leaveType);
                    return repository.save(la);
                });
    }
}