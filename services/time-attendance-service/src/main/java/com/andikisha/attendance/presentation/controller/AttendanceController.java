package com.andikisha.attendance.presentation.controller;

import com.andikisha.attendance.application.dto.request.ClockInRequest;
import com.andikisha.attendance.application.dto.request.ClockOutRequest;
import com.andikisha.attendance.application.dto.response.AttendanceResponse;
import com.andikisha.attendance.application.dto.response.MonthlySummaryResponse;
import com.andikisha.attendance.application.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/attendance")
@Tag(name = "Time and Attendance", description = "Clock in/out, attendance tracking")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/clock-in")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Record a clock-in")
    public AttendanceResponse clockIn(
            @RequestHeader("X-Employee-ID") String employeeId,
            @Valid @RequestBody ClockInRequest request) {
        return attendanceService.clockIn(UUID.fromString(employeeId), request);
    }

    @PostMapping("/clock-out")
    @Operation(summary = "Record a clock-out")
    public AttendanceResponse clockOut(
            @RequestHeader("X-Employee-ID") String employeeId,
            @Valid @RequestBody ClockOutRequest request) {
        return attendanceService.clockOut(UUID.fromString(employeeId), request);
    }

    @GetMapping("/employees/{employeeId}")
    @Operation(summary = "Get attendance history for an employee")
    public Page<AttendanceResponse> getEmployeeAttendance(
            @PathVariable UUID employeeId,
            Pageable pageable) {
        return attendanceService.getEmployeeAttendance(employeeId, pageable);
    }

    @GetMapping("/daily")
    @Operation(summary = "Get all attendance for a specific date")
    public Page<AttendanceResponse> getDailyAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Pageable pageable) {
        return attendanceService.getDailyAttendance(date, pageable);
    }

    @GetMapping("/employees/{employeeId}/monthly-summary")
    @Operation(summary = "Get monthly attendance summary for payroll")
    public MonthlySummaryResponse getMonthlySummary(
            @PathVariable UUID employeeId,
            @RequestParam String period) {
        return attendanceService.getMonthlySummary(employeeId, period);
    }
}
