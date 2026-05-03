package com.andikisha.payroll.application.mapper;

import com.andikisha.payroll.application.dto.response.PaySlipResponse;
import com.andikisha.payroll.application.dto.response.PayrollRunResponse;
import com.andikisha.payroll.domain.model.PaySlip;
import com.andikisha.payroll.domain.model.PayrollRun;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T01:54:47+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class PayrollMapperImpl implements PayrollMapper {

    @Override
    public PayrollRunResponse toResponse(PayrollRun run) {
        if ( run == null ) {
            return null;
        }

        UUID id = null;
        String period = null;
        int employeeCount = 0;
        BigDecimal totalGross = null;
        BigDecimal totalBasic = null;
        BigDecimal totalAllowances = null;
        BigDecimal totalPaye = null;
        BigDecimal totalNssf = null;
        BigDecimal totalShif = null;
        BigDecimal totalHousingLevy = null;
        BigDecimal totalNet = null;
        String currency = null;
        String initiatedBy = null;
        String approvedBy = null;
        LocalDateTime approvedAt = null;
        LocalDateTime completedAt = null;
        LocalDateTime createdAt = null;

        id = run.getId();
        period = run.getPeriod();
        employeeCount = run.getEmployeeCount();
        totalGross = run.getTotalGross();
        totalBasic = run.getTotalBasic();
        totalAllowances = run.getTotalAllowances();
        totalPaye = run.getTotalPaye();
        totalNssf = run.getTotalNssf();
        totalShif = run.getTotalShif();
        totalHousingLevy = run.getTotalHousingLevy();
        totalNet = run.getTotalNet();
        currency = run.getCurrency();
        initiatedBy = run.getInitiatedBy();
        approvedBy = run.getApprovedBy();
        approvedAt = run.getApprovedAt();
        completedAt = run.getCompletedAt();
        createdAt = run.getCreatedAt();

        String status = run.getStatus().name();
        String payFrequency = run.getPayFrequency().name();

        PayrollRunResponse payrollRunResponse = new PayrollRunResponse( id, period, payFrequency, status, employeeCount, totalGross, totalBasic, totalAllowances, totalPaye, totalNssf, totalShif, totalHousingLevy, totalNet, currency, initiatedBy, approvedBy, approvedAt, completedAt, createdAt );

        return payrollRunResponse;
    }

    @Override
    public PaySlipResponse toResponse(PaySlip slip) {
        if ( slip == null ) {
            return null;
        }

        UUID payrollRunId = null;
        String period = null;
        UUID id = null;
        UUID employeeId = null;
        String employeeNumber = null;
        String employeeName = null;
        BigDecimal basicPay = null;
        BigDecimal housingAllowance = null;
        BigDecimal transportAllowance = null;
        BigDecimal medicalAllowance = null;
        BigDecimal otherAllowances = null;
        BigDecimal totalAllowances = null;
        BigDecimal grossPay = null;
        BigDecimal paye = null;
        BigDecimal nssf = null;
        BigDecimal nssfEmployer = null;
        BigDecimal shif = null;
        BigDecimal housingLevy = null;
        BigDecimal housingLevyEmployer = null;
        BigDecimal helb = null;
        BigDecimal personalRelief = null;
        BigDecimal insuranceRelief = null;
        BigDecimal totalDeductions = null;
        BigDecimal netPay = null;
        String currency = null;
        String mpesaReceipt = null;

        payrollRunId = slipPayrollRunId( slip );
        period = slipPayrollRunPeriod( slip );
        id = slip.getId();
        employeeId = slip.getEmployeeId();
        employeeNumber = slip.getEmployeeNumber();
        employeeName = slip.getEmployeeName();
        basicPay = slip.getBasicPay();
        housingAllowance = slip.getHousingAllowance();
        transportAllowance = slip.getTransportAllowance();
        medicalAllowance = slip.getMedicalAllowance();
        otherAllowances = slip.getOtherAllowances();
        totalAllowances = slip.getTotalAllowances();
        grossPay = slip.getGrossPay();
        paye = slip.getPaye();
        nssf = slip.getNssf();
        nssfEmployer = slip.getNssfEmployer();
        shif = slip.getShif();
        housingLevy = slip.getHousingLevy();
        housingLevyEmployer = slip.getHousingLevyEmployer();
        helb = slip.getHelb();
        personalRelief = slip.getPersonalRelief();
        insuranceRelief = slip.getInsuranceRelief();
        totalDeductions = slip.getTotalDeductions();
        netPay = slip.getNetPay();
        currency = slip.getCurrency();
        mpesaReceipt = slip.getMpesaReceipt();

        String paymentStatus = slip.getPaymentStatus().name();

        PaySlipResponse paySlipResponse = new PaySlipResponse( id, payrollRunId, period, employeeId, employeeNumber, employeeName, basicPay, housingAllowance, transportAllowance, medicalAllowance, otherAllowances, totalAllowances, grossPay, paye, nssf, nssfEmployer, shif, housingLevy, housingLevyEmployer, helb, personalRelief, insuranceRelief, totalDeductions, netPay, currency, paymentStatus, mpesaReceipt );

        return paySlipResponse;
    }

    private UUID slipPayrollRunId(PaySlip paySlip) {
        PayrollRun payrollRun = paySlip.getPayrollRun();
        if ( payrollRun == null ) {
            return null;
        }
        return payrollRun.getId();
    }

    private String slipPayrollRunPeriod(PaySlip paySlip) {
        PayrollRun payrollRun = paySlip.getPayrollRun();
        if ( payrollRun == null ) {
            return null;
        }
        return payrollRun.getPeriod();
    }
}
