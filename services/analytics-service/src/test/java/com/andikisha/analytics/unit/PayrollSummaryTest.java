package com.andikisha.analytics.unit;

import com.andikisha.analytics.domain.model.PayrollSummary;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class PayrollSummaryTest {

    private static final String TENANT = "tenant-a";
    private static final String PERIOD = "2026-04";

    @Test
    void create_withEmployees_calculatesAverages() {
        PayrollSummary s = PayrollSummary.create(
                TENANT, PERIOD, 2,
                new BigDecimal("200000.00"), new BigDecimal("160000.00"),
                new BigDecimal("30000.00"), new BigDecimal("2000.00"),
                new BigDecimal("5500.00"), new BigDecimal("3000.00"),
                "run-1", "admin"
        );

        assertThat(s.getTenantId()).isEqualTo(TENANT);
        assertThat(s.getPeriod()).isEqualTo(PERIOD);
        assertThat(s.getEmployeeCount()).isEqualTo(2);
        assertThat(s.getTotalGross()).isEqualTo(new BigDecimal("200000.00"));
        assertThat(s.getTotalNet()).isEqualTo(new BigDecimal("160000.00"));
        assertThat(s.getTotalPaye()).isEqualTo(new BigDecimal("30000.00"));
        assertThat(s.getTotalNssf()).isEqualTo(new BigDecimal("2000.00"));
        assertThat(s.getTotalShif()).isEqualTo(new BigDecimal("5500.00"));
        assertThat(s.getTotalHousingLevy()).isEqualTo(new BigDecimal("3000.00"));
        assertThat(s.getAverageGross()).isEqualTo(new BigDecimal("100000.00"));
        assertThat(s.getAverageNet()).isEqualTo(new BigDecimal("80000.00"));
        assertThat(s.getCurrency()).isEqualTo("KES");
        assertThat(s.getPayrollRunId()).isEqualTo("run-1");
        assertThat(s.getApprovedBy()).isEqualTo("admin");
    }

    @Test
    void create_withZeroEmployees_setsAveragesToZero() {
        PayrollSummary s = PayrollSummary.create(
                TENANT, PERIOD, 0,
                new BigDecimal("50000.00"), new BigDecimal("40000.00"),
                BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO,
                "run-1", "admin"
        );

        assertThat(s.getAverageGross()).isEqualTo(BigDecimal.ZERO);
        assertThat(s.getAverageNet()).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    void create_withOneEmployee_averagesEqualTotals() {
        PayrollSummary s = PayrollSummary.create(
                TENANT, PERIOD, 1,
                new BigDecimal("150000.00"), new BigDecimal("120000.00"),
                new BigDecimal("22500.00"), new BigDecimal("1000.00"),
                new BigDecimal("4125.00"), new BigDecimal("2250.00"),
                "run-1", "admin"
        );

        assertThat(s.getAverageGross()).isEqualTo(new BigDecimal("150000.00"));
        assertThat(s.getAverageNet()).isEqualTo(new BigDecimal("120000.00"));
    }
}
