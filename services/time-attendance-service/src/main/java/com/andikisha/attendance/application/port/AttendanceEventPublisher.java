package com.andikisha.attendance.application.port;

import com.andikisha.attendance.domain.model.AttendanceRecord;

public interface AttendanceEventPublisher {

    void publishClockIn(AttendanceRecord record);

    void publishClockOut(AttendanceRecord record);
}