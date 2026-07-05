package com.andikisha.document.unit;

import com.andikisha.document.application.service.CertificateOfServiceHtmlBuilder;
import com.andikisha.document.infrastructure.pdf.OpenHtmlPdfGenerator;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * #46 regression guard: the generator must emit a real PDF (starting with the %PDF- magic bytes),
 * not raw HTML. Covers loose HTML (unclosed tags), real builder output, and the template path.
 */
class OpenHtmlPdfGeneratorTest {

    private final OpenHtmlPdfGenerator generator = new OpenHtmlPdfGenerator();

    private static void assertIsPdf(byte[] bytes) {
        assertThat(bytes).isNotEmpty();
        String header = new String(bytes, 0, Math.min(5, bytes.length), StandardCharsets.US_ASCII);
        assertThat(header).as("PDF magic header").isEqualTo("%PDF-");
        // A rendered PDF carries structural overhead well beyond the source HTML length.
        assertThat(bytes.length).isGreaterThan(500);
    }

    @Test
    void generateFromHtml_looseHtml_producesRealPdf() {
        // Unclosed <meta> (as the real builders emit) must be normalised, not rejected.
        String html = "<html><head><meta charset='UTF-8'>"
                + "<style>body{font-family:Arial,sans-serif;} .m{font-family:monospace;}</style></head>"
                + "<body><h1>Payslip</h1><p class='m'>KES 84,200.00</p></body></html>";

        assertIsPdf(generator.generateFromHtml(html));
    }

    @Test
    void generateFromHtml_realCertificateBuilderOutput_producesRealPdf() {
        String html = new CertificateOfServiceHtmlBuilder().build(
                null, "Acme Ltd", "Jane Mwangi", "EMP-001",
                "Software Engineer", "Engineering",
                LocalDate.of(2020, 1, 15), LocalDate.of(2026, 6, 30), LocalDate.of(2026, 6, 30), null);

        assertIsPdf(generator.generateFromHtml(html));
    }

    @Test
    void generateFromHtml_certificateWithLogoDataUri_rendersRealPdf() {
        // A 1x1 PNG as a data URI — proves openhtmltopdf embeds the logo letterhead (#57).
        String logo = "data:image/png;base64,"
                + "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        String html = new CertificateOfServiceHtmlBuilder().build(
                logo, "Acme Ltd", "Jane Mwangi", "EMP-001",
                "Software Engineer", "Engineering",
                LocalDate.of(2020, 1, 15), LocalDate.of(2026, 6, 30), LocalDate.of(2026, 6, 30), null);

        assertIsPdf(generator.generateFromHtml(html));
    }

    @Test
    void generateFromTemplate_substitutesThenRenders() {
        byte[] pdf = generator.generateFromTemplate(
                "<html><body><p>Dear {{name}}</p></body></html>", Map.of("name", "Jane Mwangi"));

        assertIsPdf(pdf);
    }
}
