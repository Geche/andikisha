package com.andikisha.payroll.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.payroll.application.dto.request.RunPayrollRequest;
import com.andikisha.payroll.application.dto.response.PayrollRunResponse;
import com.andikisha.payroll.application.mapper.PayrollMapper;
import com.andikisha.payroll.application.port.PayrollEventPublisher;
import com.andikisha.payroll.application.service.KenyanTaxCalculator;
import com.andikisha.payroll.application.service.PayrollService;
import com.andikisha.payroll.domain.exception.PayrollRunNotFoundException;
import com.andikisha.payroll.domain.model.PayFrequency;
import com.andikisha.payroll.domain.model.PaySlip;
import com.andikisha.payroll.domain.model.PayrollRun;
import com.andikisha.payroll.domain.model.PayrollStatus;
import com.andikisha.payroll.domain.repository.PaySlipRepository;
import com.andikisha.payroll.domain.repository.PayrollRunRepository;
import com.andikisha.payroll.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.payroll.infrastructure.grpc.LeaveGrpcClient;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayrollServiceTest {

    private static final String TENANT_ID = "unit-test-tenant";
    private static final String PERIOD    = "2024-01";

    @Mock PayrollRunRepository payrollRunRepository;
    @Mock PaySlipRepository paySlipRepository;
    @Mock KenyanTaxCalculator taxCalculator;
    @Mock EmployeeGrpcClient employeeClient;
    @Mock LeaveGrpcClient leaveClient;
    @Mock PayrollMapper mapper;
    @Mock PayrollEventPublisher eventPublisher;
    @Mock PlatformTransactionManager transactionManager;
    @Mock Clock clock;

    private PayrollService service;

    @BeforeEach
    void setUp() {
        // lenient() because not every test exercises transactionManager or clock
        TransactionStatus txStatus = mock(TransactionStatus.class);
        lenient().when(transactionManager.getTransaction(any())).thenReturn(txStatus);
        lenient().when(clock.instant()).thenReturn(Instant.parse("2024-01-31T12:00:00Z"));
        lenient().when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        service = new PayrollService(payrollRunRepository, paySlipRepository, taxCalculator,
                employeeClient, leaveClient, mapper, eventPublisher, transactionManager, clock);

        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // -------------------------------------------------------------------------
    // initiatePayroll
    // -------------------------------------------------------------------------

    @Test
    void initiatePayroll_happyPath_savesAndPublishesEvent() {
        when(payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
                TENANT_ID, PERIOD, PayFrequency.MONTHLY, PayrollStatus.CANCELLED))
                .thenReturn(false);
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        PayrollRunResponse expected = minimalRunResponse();
        when(mapper.toResponse(any(PayrollRun.class))).thenReturn(expected);

        PayrollRunResponse result = service.initiatePayroll(
                new RunPayrollRequest(PERIOD, "MONTHLY"), "hr-admin");

        assertThat(result).isEqualTo(expected);
        verify(payrollRunRepository).save(any(PayrollRun.class));
        verify(eventPublisher).publishPayrollInitiated(any(PayrollRun.class));
    }

    @Test
    void initiatePayroll_withNullFrequency_defaultsToMonthly() {
        when(payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
                TENANT_ID, PERIOD, PayFrequency.MONTHLY, PayrollStatus.CANCELLED))
                .thenReturn(false);
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any(PayrollRun.class))).thenReturn(minimalRunResponse());

        // payFrequency = null → should default to MONTHLY
        service.initiatePayroll(new RunPayrollRequest(PERIOD, null), "hr-admin");

        verify(payrollRunRepository).existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
                TENANT_ID, PERIOD, PayFrequency.MONTHLY, PayrollStatus.CANCELLED);
    }

    @Test
    void initiatePayroll_whenDuplicatePeriodExists_throwsBusinessRuleException() {
        when(payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
                TENANT_ID, PERIOD, PayFrequency.MONTHLY, PayrollStatus.CANCELLED))
                .thenReturn(true);

        assertThatThrownBy(() -> service.initiatePayroll(
                new RunPayrollRequest(PERIOD, "MONTHLY"), "hr-admin"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining(PERIOD);

        verify(payrollRunRepository, never()).save(any());
        verifyNoInteractions(eventPublisher);
    }

    // -------------------------------------------------------------------------
    // approvePayroll
    // -------------------------------------------------------------------------

    @Test
    void approvePayroll_happyPath_approvesAndPublishesEvent() {
        PayrollRun run = buildCalculatedRun();
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.of(run));
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any(PayrollRun.class))).thenReturn(minimalRunResponse());

        service.approvePayroll(runId, "cfo-user");

        assertThat(run.getStatus()).isEqualTo(PayrollStatus.APPROVED);
        assertThat(run.getApprovedBy()).isEqualTo("cfo-user");
        verify(eventPublisher).publishPayrollApproved(run);
    }

    @Test
    void approvePayroll_whenRunNotFound_throwsPayrollRunNotFoundException() {
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.approvePayroll(runId, "cfo-user"))
                .isInstanceOf(PayrollRunNotFoundException.class);

        verifyNoInteractions(eventPublisher);
    }

    @Test
    void approvePayroll_whenRunNotInCalculatedState_throwsBusinessRuleException() {
        PayrollRun draftRun = PayrollRun.create(TENANT_ID, PERIOD, PayFrequency.MONTHLY, "hr");
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.of(draftRun));

        assertThatThrownBy(() -> service.approvePayroll(runId, "cfo-user"))
                .isInstanceOf(BusinessRuleException.class);

        verifyNoInteractions(eventPublisher);
    }

    // -------------------------------------------------------------------------
    // cancelPayroll
    // -------------------------------------------------------------------------

    @Test
    void cancelPayroll_fromDraft_cancelsProperly() {
        PayrollRun run = PayrollRun.create(TENANT_ID, PERIOD, PayFrequency.MONTHLY, "hr");
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.of(run));
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.cancelPayroll(runId, "Duplicate run");

        assertThat(run.getStatus()).isEqualTo(PayrollStatus.CANCELLED);
        verify(payrollRunRepository).save(run);
    }

    @Test
    void cancelPayroll_whenNotFound_throwsPayrollRunNotFoundException() {
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancelPayroll(runId, "reason"))
                .isInstanceOf(PayrollRunNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // getPayrollRun
    // -------------------------------------------------------------------------

    @Test
    void getPayrollRun_whenFound_returnsResponse() {
        PayrollRun run = PayrollRun.create(TENANT_ID, PERIOD, PayFrequency.MONTHLY, "hr");
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.of(run));
        PayrollRunResponse expected = minimalRunResponse();
        when(mapper.toResponse(run)).thenReturn(expected);

        assertThat(service.getPayrollRun(runId)).isEqualTo(expected);
    }

    @Test
    void getPayrollRun_whenNotFound_throwsPayrollRunNotFoundException() {
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPayrollRun(runId))
                .isInstanceOf(PayrollRunNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Returns a PayrollRun in CALCULATED state with one pay slip. */
    private PayrollRun buildCalculatedRun() {
        PayrollRun run = PayrollRun.create(TENANT_ID, PERIOD, PayFrequency.MONTHLY, "hr");
        run.markCalculating();
        run.addPaySlip(PaySlip.builder()
                .tenantId(TENANT_ID)
                .employeeId(UUID.randomUUID())
                .employeeNumber("EMP-0001")
                .employeeName("Test Employee")
                .basicPay(BigDecimal.valueOf(100_000))
                .housingAllowance(BigDecimal.ZERO)
                .transportAllowance(BigDecimal.ZERO)
                .medicalAllowance(BigDecimal.ZERO)
                .otherAllowances(BigDecimal.ZERO)
                .totalAllowances(BigDecimal.ZERO)
                .grossPay(BigDecimal.valueOf(100_000))
                .paye(BigDecimal.valueOf(25_000))
                .nssf(BigDecimal.valueOf(2_160))
                .nssfEmployer(BigDecimal.valueOf(2_160))
                .shif(BigDecimal.valueOf(2_750))
                .housingLevy(BigDecimal.valueOf(1_500))
                .housingLevyEmployer(BigDecimal.valueOf(1_500))
                .helb(BigDecimal.ZERO)
                .otherDeductions(BigDecimal.ZERO)
                .personalRelief(BigDecimal.valueOf(2_400))
                .insuranceRelief(BigDecimal.valueOf(412))
                .totalDeductions(BigDecimal.valueOf(31_410))
                .netPay(BigDecimal.valueOf(68_590))
                .currency("KES")
                .paymentPhone("+254700000001")
                .build());
        run.finishCalculation();
        return run;
    }

    private PayrollRunResponse minimalRunResponse() {
        return new PayrollRunResponse(
                UUID.randomUUID(), PERIOD, "MONTHLY", "DRAFT",
                0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, "KES", "hr-admin", null, null, null,
                LocalDateTime.now());
    }
}
