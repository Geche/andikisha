package com.andikisha.analytics.infrastructure.messaging;

import com.andikisha.analytics.domain.model.PayrollSummary;
import com.andikisha.analytics.domain.repository.PayrollSummaryRepository;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.payroll.PayrollApprovedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PayrollEventListener {

    private static final Logger log = LoggerFactory.getLogger(PayrollEventListener.class);
    private final PayrollSummaryRepository repository;

    public PayrollEventListener(PayrollSummaryRepository repository) {
        this.repository = repository;
    }

    @RabbitListener(queues = "analytics.payroll-events")
    @Transactional
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case PayrollApprovedEvent e -> {
                    var existing = repository.findByTenantIdAndPeriod(
                            e.getTenantId(), e.getPeriod());

                    if (existing.isPresent()) {
                        log.info("Payroll summary already exists for period {}", e.getPeriod());
                        return;
                    }

                    PayrollSummary summary = PayrollSummary.create(
                            e.getTenantId(), e.getPeriod(), e.getEmployeeCount(),
                            e.getTotalGross(), e.getTotalNet(),
                            e.getTotalPaye(), e.getTotalNssf(),
                            e.getTotalShif(), e.getTotalHousingLevy(),
                            e.getPayrollRunId(), e.getApprovedBy()
                    );
                    repository.save(summary);

                    log.info("Payroll summary created for period {} employees {}",
                            e.getPeriod(), e.getEmployeeCount());
                }
                default -> log.debug("Ignoring payroll event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }
}
