package com.andikisha.integration.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.integration.application.dto.response.FilingRecordResponse;
import com.andikisha.integration.application.service.FilingService;
import com.andikisha.integration.domain.model.FilingRecord;
import com.andikisha.integration.domain.model.IntegrationType;
import com.andikisha.integration.domain.repository.FilingRecordRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FilingServiceTest {

    private static final String TENANT_ID = "tenant-filing-test";
    private static final String PERIOD    = "2024-01";

    @Mock FilingRecordRepository repository;

    private FilingService service;

    @BeforeEach
    void setUp() {
        service = new FilingService(repository, new ObjectMapper());
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // -------------------------------------------------------------------------
    // createPayeFiling
    // -------------------------------------------------------------------------

    @Test
    void createPayeFiling_happyPath_returnsResponse() {
        when(repository.findByTenantIdAndFilingTypeAndPeriod(
                TENANT_ID, IntegrationType.KRA_ITAX, PERIOD))
                .thenReturn(Optional.empty());
        when(repository.save(any(FilingRecord.class)))
                .thenAnswer(i -> i.getArgument(0));

        FilingRecordResponse response = service.createPayeFiling(
                PERIOD, 10, new BigDecimal("150000.00"));

        assertThat(response.filingType()).isEqualTo("KRA_ITAX");
        assertThat(response.period()).isEqualTo(PERIOD);
        assertThat(response.status()).isEqualTo("PENDING");
        assertThat(response.employeeCount()).isEqualTo(10);
        assertThat(response.totalAmount()).isEqualByComparingTo("150000.00");
    }

    @Test
    void createPayeFiling_duplicatePeriod_throwsBusinessRuleException() {
        FilingRecord existing = FilingRecord.create(
                TENANT_ID, IntegrationType.KRA_ITAX, PERIOD, 5,
                new BigDecimal("80000"), BigDecimal.ZERO);
        when(repository.findByTenantIdAndFilingTypeAndPeriod(
                TENANT_ID, IntegrationType.KRA_ITAX, PERIOD))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.createPayeFiling(
                PERIOD, 10, new BigDecimal("150000.00")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("PAYE filing already exists");
    }

    // -------------------------------------------------------------------------
    // createNssfFiling
    // -------------------------------------------------------------------------

    @Test
    void createNssfFiling_happyPath_returnsResponseWithBothTotals() {
        when(repository.findByTenantIdAndFilingTypeAndPeriod(
                TENANT_ID, IntegrationType.NSSF_REMITTANCE, PERIOD))
                .thenReturn(Optional.empty());
        when(repository.save(any(FilingRecord.class)))
                .thenAnswer(i -> i.getArgument(0));

        FilingRecordResponse response = service.createNssfFiling(
                PERIOD, 10, new BigDecimal("21600.00"), new BigDecimal("21600.00"));

        assertThat(response.filingType()).isEqualTo("NSSF_REMITTANCE");
        assertThat(response.totalAmount()).isEqualByComparingTo("21600.00");
        assertThat(response.employerAmount()).isEqualByComparingTo("21600.00");
    }

    @Test
    void createNssfFiling_duplicatePeriod_throwsBusinessRuleException() {
        FilingRecord existing = FilingRecord.create(
                TENANT_ID, IntegrationType.NSSF_REMITTANCE, PERIOD, 5,
                new BigDecimal("10800"), new BigDecimal("10800"));
        when(repository.findByTenantIdAndFilingTypeAndPeriod(
                TENANT_ID, IntegrationType.NSSF_REMITTANCE, PERIOD))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.createNssfFiling(
                PERIOD, 10, new BigDecimal("21600"), new BigDecimal("21600")))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("NSSF filing already exists");
    }

    // -------------------------------------------------------------------------
    // createShifFiling
    // -------------------------------------------------------------------------

    @Test
    void createShifFiling_happyPath_returnsResponse() {
        when(repository.findByTenantIdAndFilingTypeAndPeriod(
                TENANT_ID, IntegrationType.SHIF_REMITTANCE, PERIOD))
                .thenReturn(Optional.empty());
        when(repository.save(any(FilingRecord.class)))
                .thenAnswer(i -> i.getArgument(0));

        FilingRecordResponse response = service.createShifFiling(
                PERIOD, 10, new BigDecimal("27500.00"));

        assertThat(response.filingType()).isEqualTo("SHIF_REMITTANCE");
        assertThat(response.totalAmount()).isEqualByComparingTo("27500.00");
    }

    // -------------------------------------------------------------------------
    // getFiling
    // -------------------------------------------------------------------------

    @Test
    void getFiling_whenFound_returnsResponse() {
        UUID id = UUID.randomUUID();
        FilingRecord record = FilingRecord.create(
                TENANT_ID, IntegrationType.KRA_ITAX, PERIOD, 5,
                new BigDecimal("80000"), BigDecimal.ZERO);
        when(repository.findByIdAndTenantId(id, TENANT_ID)).thenReturn(Optional.of(record));

        FilingRecordResponse response = service.getFiling(id);

        assertThat(response.filingType()).isEqualTo("KRA_ITAX");
    }

    @Test
    void getFiling_whenNotFound_throwsResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(repository.findByIdAndTenantId(id, TENANT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getFiling(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
