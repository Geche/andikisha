package com.andikisha.document.infrastructure.pdf;

import com.andikisha.document.application.port.PdfGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class OpenHtmlPdfGenerator implements PdfGenerator {

    private static final Logger log = LoggerFactory.getLogger(OpenHtmlPdfGenerator.class);

    @Override
    public byte[] generateFromHtml(String html) {
        // For production, use openhtmltopdf or iText:
        //
        // try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
        //     PdfRendererBuilder builder = new PdfRendererBuilder();
        //     builder.useFastMode();
        //     builder.withHtmlContent(html, null);
        //     builder.toStream(os);
        //     builder.run();
        //     return os.toByteArray();
        // }
        //
        // Gradle dependency:
        // implementation("com.openhtmltopdf:openhtmltopdf-pdfbox:1.0.10")

        // For now, store the HTML as bytes. The frontend can render it directly
        // or you can add the PDF library when needed.
        log.debug("Generating PDF from HTML ({} chars)", html.length());
        return html.getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] generateFromTemplate(String template, Map<String, Object> variables) {
        String rendered = template;
        for (var entry : variables.entrySet()) {
            rendered = rendered.replace(
                    "{{" + entry.getKey() + "}}",
                    entry.getValue() != null ? entry.getValue().toString() : "");
        }
        return generateFromHtml(rendered);
    }
}