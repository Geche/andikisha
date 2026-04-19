package com.andikisha.attendance.infrastructure.messaging;

import com.andikisha.attendance.application.service.AttendanceService;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.tenant.TenantCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class TenantEventListener {

    private static final Logger log = LoggerFactory.getLogger(TenantEventListener.class);
    private final AttendanceService attendanceService;

    public TenantEventListener(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @RabbitListener(queues = "attendance.tenant-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            if (event instanceof TenantCreatedEvent e) {
                attendanceService.createDefaultSchedule(e.getTenantId());
                log.info("Created default work schedule for tenant {}", e.getTenantId());
            }
        } finally {
            TenantContext.clear();
        }
    }
}
