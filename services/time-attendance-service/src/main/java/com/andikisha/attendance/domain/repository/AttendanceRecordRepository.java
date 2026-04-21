package com.andikisha.attendance.domain.repository;

import com.andikisha.attendance.domain.model.AttendanceRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    Optional<AttendanceRecord> findByIdAndTenantId(UUID id, String tenantId);

    Optional<AttendanceRecord> findByTenantIdAndEmployeeIdAndAttendanceDate(
            String tenantId, UUID employeeId, LocalDate date);

    List<AttendanceRecord> findByTenantIdAndEmployeeIdAndAttendanceDateBetween(
            String tenantId, UUID employeeId, LocalDate startDate, LocalDate endDate);

    Page<AttendanceRecord> findByTenantIdAndEmployeeIdOrderByAttendanceDateDesc(
            String tenantId, UUID employeeId, Pageable pageable);

    Page<AttendanceRecord> findByTenantIdAndAttendanceDateOrderByClockInDesc(
            String tenantId, LocalDate date, Pageable pageable);

    @Query("""
        SELECT COUNT(ar) FROM AttendanceRecord ar
        WHERE ar.tenantId = :tenantId AND ar.employeeId = :employeeId
        AND ar.attendanceDate BETWEEN :startDate AND :endDate
        AND ar.absent = false AND ar.onLeave = false AND ar.clockIn IS NOT NULL
        """)
    int countPresentDays(String tenantId, UUID employeeId,
                         LocalDate startDate, LocalDate endDate);

    @Query("""
        SELECT COUNT(ar) FROM AttendanceRecord ar
        WHERE ar.tenantId = :tenantId AND ar.employeeId = :employeeId
        AND ar.attendanceDate BETWEEN :startDate AND :endDate
        AND ar.absent = true
        """)
    int countAbsentDays(String tenantId, UUID employeeId,
                        LocalDate startDate, LocalDate endDate);

    @Query("""
        SELECT COALESCE(SUM(ar.regularHours), 0) FROM AttendanceRecord ar
        WHERE ar.tenantId = :tenantId AND ar.employeeId = :employeeId
        AND ar.attendanceDate BETWEEN :startDate AND :endDate
        AND ar.holiday = false
        """)
    BigDecimal sumRegularHours(String tenantId, UUID employeeId,
                           LocalDate startDate, LocalDate endDate);

    @Query(value = """
        SELECT COALESCE(SUM(overtime_hours), 0) FROM attendance_records
        WHERE tenant_id = :tenantId AND employee_id = :employeeId
        AND attendance_date BETWEEN :startDate AND :endDate
        AND is_holiday = false
        AND EXTRACT(DOW FROM attendance_date) BETWEEN 1 AND 5
        """, nativeQuery = true)
    BigDecimal sumWeekdayOvertime(@Param("tenantId") String tenantId,
                                  @Param("employeeId") UUID employeeId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    @Query(value = """
        SELECT COALESCE(SUM(overtime_hours), 0) FROM attendance_records
        WHERE tenant_id = :tenantId AND employee_id = :employeeId
        AND attendance_date BETWEEN :startDate AND :endDate
        AND is_holiday = false
        AND EXTRACT(DOW FROM attendance_date) IN (0, 6)
        """, nativeQuery = true)
    BigDecimal sumWeekendOvertime(@Param("tenantId") String tenantId,
                                  @Param("employeeId") UUID employeeId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    @Query("""
        SELECT COALESCE(SUM(ar.hoursWorked), 0) FROM AttendanceRecord ar
        WHERE ar.tenantId = :tenantId AND ar.employeeId = :employeeId
        AND ar.attendanceDate BETWEEN :startDate AND :endDate
        AND ar.holiday = true
        """)
    BigDecimal sumHolidayHours(String tenantId, UUID employeeId,
                           LocalDate startDate, LocalDate endDate);

    @Query("""
        SELECT COUNT(ar) FROM AttendanceRecord ar
        WHERE ar.tenantId = :tenantId AND ar.employeeId = :employeeId
        AND ar.attendanceDate BETWEEN :startDate AND :endDate
        AND ar.onLeave = true
        """)
    int countLeaveDays(String tenantId, UUID employeeId,
                       LocalDate startDate, LocalDate endDate);

    @Query("""
        SELECT COUNT(ar) FROM AttendanceRecord ar
        WHERE ar.tenantId = :tenantId AND ar.employeeId = :employeeId
        AND ar.attendanceDate BETWEEN :startDate AND :endDate
        AND ar.holiday = true
        """)
    int countHolidayDays(String tenantId, UUID employeeId,
                         LocalDate startDate, LocalDate endDate);

    @Query("""
        SELECT COUNT(ar) FROM AttendanceRecord ar
        WHERE ar.tenantId = :tenantId AND ar.employeeId = :employeeId
        AND ar.attendanceDate BETWEEN :startDate AND :endDate
        AND ar.late = true
        """)
    int countLateDays(String tenantId, UUID employeeId,
                      LocalDate startDate, LocalDate endDate);

    @Query("""
        SELECT COUNT(ar) FROM AttendanceRecord ar
        WHERE ar.tenantId = :tenantId AND ar.employeeId = :employeeId
        AND ar.attendanceDate BETWEEN :startDate AND :endDate
        AND ar.earlyDeparture = true
        """)
    int countEarlyDepartureDays(String tenantId, UUID employeeId,
                                LocalDate startDate, LocalDate endDate);

    boolean existsByTenantIdAndEmployeeIdAndAttendanceDateAndOnLeaveTrue(
            String tenantId, UUID employeeId, LocalDate date);
}