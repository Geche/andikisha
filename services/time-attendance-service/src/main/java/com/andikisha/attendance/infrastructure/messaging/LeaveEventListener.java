package com.andikisha.attendance.infrastructure.messaging;

import com.andikisha.attendance.application.service.AttendanceService;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.leave.LeaveApprovedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.UUID;

@Component
public class LeaveEventListener {

    private static final Logger log = LoggerFactory.getLogger(LeaveEventListener.class);
    private final AttendanceService attendanceService;

    public LeaveEventListener(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @RabbitListener(queues = "attendance.leave-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            if (event instanceof LeaveApprovedEvent e) {
                UUID employeeId = UUID.fromString(e.getEmployeeId());
                LocalDate current = e.getStartDate();
                while (!current.isAfter(e.getEndDate())) {
                    if (isWorkingDay(current)) {
                        attendanceService.markLeaveDay(e.getTenantId(), employeeId, current);
                    }
                    current = current.plusDays(1);
                }
                log.info("Marked leave days for employee {} ({} to {})",
                        e.getEmployeeId(), e.getStartDate(), e.getEndDate());
            }
        } finally {
            TenantContext.clear();
        }
    }

    private boolean isWorkingDay(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY;
    }
}
