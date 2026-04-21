package com.andikisha.integration.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.integration.application.dto.response.FilingRecordResponse;
import com.andikisha.integration.domain.model.FilingRecord;
import com.andikisha.integration.domain.model.IntegrationType;
import com.andikisha.integration.domain.repository.FilingRecordRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class FilingService {

    private static final Logger log = LoggerFactory.getLogger(FilingService.class);
    private final FilingRecordRepository filingRepository;
    private final ObjectMapper objectMapper;

    public FilingService(FilingRecordRepository filingRepository, ObjectMapper objectMapper) {
        this.filingRepository = filingRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public FilingRecordResponse createPayeFiling(String period, int employeeCount,
                                                 BigDecimal totalPaye) {
        String tenantId = TenantContext.requireTenantId();

        filingRepository.findByTenantIdAndFilingTypeAndPeriod(
                        tenantId, IntegrationType.KRA_ITAX, period)
                .ifPresent(existing -> {
                    throw new BusinessRuleException("DUPLICATE_FILING",
                            "PAYE filing already exists for period " + period);
                });

        FilingRecord record = FilingRecord.create(
                tenantId, IntegrationType.KRA_ITAX, period,
                employeeCount, totalPaye, BigDecimal.ZERO);
        record.setFilingData(buildFilingData(tenantId, period, employeeCount, totalPaye, null));
        record = filingRepository.save(record);

        log.info("PAYE filing created for period {}: {} employees, KES {}",
                period, employeeCount, totalPaye);

        return toResponse(record);
    }

    @Transactional
    public FilingRecordResponse createNssfFiling(String period, int employeeCount,
                                                 BigDecimal employeeTotal,
                                                 BigDecimal employerTotal) {
        String tenantId = TenantContext.requireTenantId();

        filingRepository.findByTenantIdAndFilingTypeAndPeriod(
                        tenantId, IntegrationType.NSSF_REMITTANCE, period)
                .ifPresent(existing -> {
                    throw new BusinessRuleException("DUPLICATE_FILING",
                            "NSSF filing already exists for period " + period);
                });

        FilingRecord record = FilingRecord.create(
                tenantId, IntegrationType.NSSF_REMITTANCE, period,
                employeeCount, employeeTotal, employerTotal);
        record = filingRepository.save(record);

        log.info("NSSF filing created for period {}: {} employees, employee KES {}, employer KES {}",
                period, employeeCount, employeeTotal, employerTotal);

        return toResponse(record);
    }

    @Transactional
    public FilingRecordResponse createShifFiling(String period, int employeeCount,
                                                 BigDecimal totalShif) {
        String tenantId = TenantContext.requireTenantId();

        filingRepository.findByTenantIdAndFilingTypeAndPeriod(
                        tenantId, IntegrationType.SHIF_REMITTANCE, period)
                .ifPresent(existing -> {
                    throw new BusinessRuleException("DUPLICATE_FILING",
                            "SHIF filing already exists for period " + period);
                });

        FilingRecord record = FilingRecord.create(
                tenantId, IntegrationType.SHIF_REMITTANCE, period,
                employeeCount, totalShif, BigDecimal.ZERO);
        record = filingRepository.save(record);

        log.info("SHIF filing created for period {}: {} employees, KES {}",
                period, employeeCount, totalShif);

        return toResponse(record);
    }

    public Page<FilingRecordResponse> listFilings(Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return filingRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable)
                .map(this::toResponse);
    }

    public Page<FilingRecordResponse> listByType(IntegrationType filingType, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return filingRepository.findByTenantIdAndFilingTypeOrderByPeriodDesc(
                        tenantId, filingType, pageable)
                .map(this::toResponse);
    }

    public FilingRecordResponse getFiling(UUID filingId) {
        String tenantId = TenantContext.requireTenantId();
        FilingRecord record = filingRepository.findByIdAndTenantId(filingId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("FilingRecord", filingId));
        return toResponse(record);
    }

    private String buildFilingData(String tenantId, String period,
                                   int count, BigDecimal total, BigDecimal employerTotal) {
        try {
            Map<String, Object> data = new java.util.LinkedHashMap<>();
            data.put("tenantId", tenantId);
            data.put("period", period);
            data.put("employeeCount", count);
            data.put("totalAmount", total);
            if (employerTotal != null) {
                data.put("employerTotal", employerTotal);
            }
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize filing data", e);
        }
    }

    private FilingRecordResponse toResponse(FilingRecord r) {
        return new FilingRecordResponse(
                r.getId(), r.getFilingType().name(), r.getPeriod(),
                r.getStatus().name(), r.getEmployeeCount(),
                r.getTotalAmount(), r.getEmployerAmount(),
                r.getFileReference(), r.getAcknowledgmentNumber(),
                r.getSubmittedAt(), r.getConfirmedAt(), r.getErrorMessage()
        );
    }
}
