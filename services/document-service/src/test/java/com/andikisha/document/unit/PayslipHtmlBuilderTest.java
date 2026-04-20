package com.andikisha.document.unit;

import com.andikisha.document.application.service.PayslipHtmlBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class PayslipHtmlBuilderTest {

    private PayslipHtmlBuilder builder;

    @BeforeEach
    void setUp() {
        builder = new PayslipHtmlBuilder();
    }

    @Test
    void build_containsEmployeeDetails() {
        String html = buildSample();

        assertThat(html).contains("Jane Mwangi");
        assertThat(html).contains("EMP-001");
        assertThat(html).contains("2024-04");
    }

    @Test
    void build_containsEarningsAndGrossPay() {
        String html = buildSample();

        assertThat(html).contains("Basic Salary");
        assertThat(html).contains("Gross Pay");
        assertThat(html).contains("KES 50,000.00");
    }

    @Test
    void build_containsDeductionLines() {
        String html = buildSample();

        assertThat(html).contains("PAYE");
        assertThat(html).contains("NSSF");
    }

    @Test
    void build_containsNetPay() {
        String html = buildSample();

        assertThat(html).contains("NET PAY");
        assertThat(html).contains("KES 38,000.00");
    }

    @Test
    void build_withReliefs_includesTaxReliefSection() {
        Map<String, BigDecimal> reliefs = Map.of("Personal Relief", new BigDecimal("2400"));

        String html = builder.build("Jane", "EMP-001", "2024-04",
                Map.of("Salary", new BigDecimal("50000")),
                Map.of("PAYE", new BigDecimal("5000")),
                reliefs,
                new BigDecimal("50000"), new BigDecimal("45000"));

        assertThat(html).contains("Tax Reliefs");
        assertThat(html).contains("Personal Relief");
    }

    @Test
    void build_withEmptyReliefs_omitsTaxReliefSection() {
        String html = builder.build("Jane", "EMP-001", "2024-04",
                Map.of("Salary", new BigDecimal("50000")),
                Map.of("PAYE", new BigDecimal("5000")),
                Map.of(),
                new BigDecimal("50000"), new BigDecimal("45000"));

        assertThat(html).doesNotContain("Tax Reliefs");
    }

    @Test
    void build_htmlEscapesSpecialCharsInNames() {
        String html = builder.build("Smith & Jones <Nairobi>", "EMP-001", "2024-04",
                Map.of("Salary", BigDecimal.TEN),
                Map.of(),
                null,
                BigDecimal.TEN, BigDecimal.TEN);

        // Ampersand, less-than, and greater-than must be entity-encoded
        assertThat(html)
                .contains("Smith &amp; Jones")
                .contains("&lt;Nairobi&gt;")
                .doesNotContain("Smith & Jones")
                .doesNotContain("<Nairobi>");
    }

    @Test
    void build_nullNetPay_formatsAsZero() {
        String html = builder.build("Jane", "EMP-001", "2024-04",
                Map.of("Salary", new BigDecimal("50000")),
                Map.of(),
                null,
                new BigDecimal("50000"), null);

        assertThat(html).contains("KES 0.00");
    }

    @Test
    void build_isValidHtmlStructure() {
        String html = buildSample();

        assertThat(html).startsWith("<!DOCTYPE html>");
        assertThat(html).contains("<html>").contains("</html>");
        assertThat(html).contains("<body>").contains("</body>");
        assertThat(html).contains("computer-generated document");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private String buildSample() {
        Map<String, BigDecimal> earnings = new LinkedHashMap<>();
        earnings.put("Basic Salary", new BigDecimal("45000"));
        earnings.put("House Allowance", new BigDecimal("5000"));

        Map<String, BigDecimal> deductions = new LinkedHashMap<>();
        deductions.put("PAYE", new BigDecimal("8000"));
        deductions.put("NSSF", new BigDecimal("2160"));
        deductions.put("SHIF", new BigDecimal("1375"));
        deductions.put("Housing Levy", new BigDecimal("750"));
        deductions.put("Housing Levy Employer", new BigDecimal("715"));

        Map<String, BigDecimal> reliefs = Map.of();

        return builder.build("Jane Mwangi", "EMP-001", "2024-04",
                earnings, deductions, reliefs,
                new BigDecimal("50000"), new BigDecimal("38000"));
    }
}
