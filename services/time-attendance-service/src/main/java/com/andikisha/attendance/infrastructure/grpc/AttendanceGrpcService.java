package com.andikisha.attendance.infrastructure.grpc;

import com.andikisha.attendance.application.service.AttendanceService;
import com.andikisha.attendance.application.dto.response.MonthlySummaryResponse;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.proto.attendance.AttendanceServiceGrpc;
import com.andikisha.proto.attendance.GetMonthlyHoursRequest;
import com.andikisha.proto.attendance.MonthlyHoursResponse;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.UUID;

@GrpcService
public class AttendanceGrpcService
        extends AttendanceServiceGrpc.AttendanceServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(AttendanceGrpcService.class);
    private final AttendanceService attendanceService;

    public AttendanceGrpcService(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @Override
    public void getMonthlyHours(GetMonthlyHoursRequest request,
                                StreamObserver<MonthlyHoursResponse> observer) {
        TenantContext.setTenantId(request.getTenantId());
        try {
            MonthlySummaryResponse summary = attendanceService.getMonthlySummary(
                    UUID.fromString(request.getEmployeeId()), request.getPeriod());

            observer.onNext(MonthlyHoursResponse.newBuilder()
                    .setEmployeeId(summary.employeeId().toString())
                    .setPeriod(summary.period())
                    .setRegularHours(summary.regularHours().doubleValue())
                    .setOvertimeWeekday(summary.overtimeWeekday().doubleValue())
                    .setOvertimeWeekend(summary.overtimeWeekend().doubleValue())
                    .setOvertimeHoliday(summary.overtimeHoliday().doubleValue())
                    .setDaysPresent(summary.daysPresent())
                    .setDaysAbsent(summary.daysAbsent())
                    .build());
            observer.onCompleted();
        } catch (Exception e) {
            log.error("GetMonthlyHours failed", e);
            observer.onError(io.grpc.Status.INTERNAL
                    .withDescription("Failed to get monthly hours").asException());
        } finally {
            TenantContext.clear();
        }
    }
}