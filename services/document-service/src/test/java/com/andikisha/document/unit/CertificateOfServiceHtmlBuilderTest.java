package com.andikisha.document.unit;

import com.andikisha.document.application.service.CertificateOfServiceHtmlBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class CertificateOfServiceHtmlBuilderTest {

    private CertificateOfServiceHtmlBuilder builder;

    @BeforeEach
    void setUp() {
        builder = new CertificateOfServiceHtmlBuilder();
    }

    @Test
    void build_containsEmployeeAndEmploymentDetails() {
        String html = sample();

        assertThat(html)
                .contains("CERTIFICATE OF SERVICE")
                .contains("Acme Ltd")
                .contains("Jane Mwangi")
                .contains("EMP-001")
                .contains("Software Engineer")
                .contains("Engineering");
    }

    @Test
    void build_statesPeriodOfEmployment() {
        String html = builder.build("Acme Ltd", "Jane Mwangi", "EMP-001",
                "Engineer", "Engineering",
                LocalDate.of(2020, 1, 15), LocalDate.of(2026, 6, 30), LocalDate.of(2026, 6, 30));

        assertThat(html)
                .contains("15 January 2020")
                .contains("30 June 2026");
    }

    @Test
    void build_citesEmploymentActSection52() {
        assertThat(sample()).contains("Section 52");
    }

    /**
     * §52(2) of the Employment Act forbids the certificate from stating the reason for termination
     * or any judgement of the employee's conduct. The termination reason must never be rendered.
     */
    @Test
    void build_doesNotContainTerminationReason() {
        String html = builder.build("Acme Ltd", "Jane Mwangi", "EMP-001",
                "Engineer", "Engineering",
                LocalDate.of(2020, 1, 15), LocalDate.of(2026, 6, 30), LocalDate.of(2026, 6, 30));

        // The actual termination reason value carried on the event must never leak onto the
        // certificate. (The footer's boilerplate legally *references* the exclusion of the reason;
        // what must be absent is any concrete reason value.)
        assertThat(html)
                .doesNotContain("Redundancy")
                .doesNotContain("Misconduct")
                .doesNotContain("Poor performance");
    }

    @Test
    void build_nullDates_renderNotOnRecord() {
        String html = builder.build("Acme Ltd", "Jane Mwangi", "EMP-001",
                "Engineer", "Engineering", null, null, LocalDate.of(2026, 6, 30));

        assertThat(html).contains("Not on record");
    }

    @Test
    void build_escapesSpecialCharsInNames() {
        String html = builder.build("Smith & Sons <Nairobi>", "Ann <A>", "EMP-9",
                "Clerk", "Ops", LocalDate.of(2021, 3, 1), LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 1));

        assertThat(html)
                .contains("Smith &amp; Sons")
                .contains("&lt;Nairobi&gt;")
                .doesNotContain("Smith & Sons")
                .doesNotContain("<Nairobi>");
    }

    @Test
    void build_isValidHtmlStructure() {
        String html = sample();

        assertThat(html).startsWith("<!DOCTYPE html>");
        assertThat(html).contains("<html>").contains("</html>");
        assertThat(html).contains("<body>").contains("</body>");
    }

    private String sample() {
        return builder.build("Acme Ltd", "Jane Mwangi", "EMP-001",
                "Software Engineer", "Engineering",
                LocalDate.of(2020, 1, 15), LocalDate.of(2026, 6, 30), LocalDate.of(2026, 6, 30));
    }
}
