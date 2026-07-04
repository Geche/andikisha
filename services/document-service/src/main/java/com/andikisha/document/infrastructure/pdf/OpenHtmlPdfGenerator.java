package com.andikisha.document.infrastructure.pdf;

import com.andikisha.document.application.port.PdfGenerator;
import com.openhtmltopdf.pdfboxout.PDFontSupplier;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.jsoup.Jsoup;
import org.jsoup.helper.W3CDom;
import org.jsoup.nodes.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.Map;

/**
 * Renders HTML to a real PDF via openhtmltopdf (#46 — previously this returned raw HTML bytes).
 *
 * <p>The HTML builders emit loose HTML (e.g. unclosed {@code <meta>}), which openhtmltopdf's strict
 * XML parser rejects, so the markup is first normalised to well-formed XHTML with jsoup. The
 * Standard-14 base fonts (Helvetica/Courier) are registered for the families the builders use —
 * no TTF is bundled; Kenyan payroll/HR documents are Latin/English, well within WinAnsi coverage.
 */
@Component
public class OpenHtmlPdfGenerator implements PdfGenerator {

    private static final Logger log = LoggerFactory.getLogger(OpenHtmlPdfGenerator.class);

    @Override
    public byte[] generateFromHtml(String html) {
        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            Document jsoupDoc = Jsoup.parse(html);
            jsoupDoc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
            org.w3c.dom.Document w3c = new W3CDom().fromJsoup(jsoupDoc);

            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            // Map the CSS families the builders use to Standard-14 fonts so text actually renders.
            builder.useFont(new PDFontSupplier(PDType1Font.HELVETICA), "Arial");
            builder.useFont(new PDFontSupplier(PDType1Font.HELVETICA), "sans-serif");
            builder.useFont(new PDFontSupplier(PDType1Font.COURIER), "monospace");
            builder.withW3cDocument(w3c, null);
            builder.toStream(os);
            builder.run();

            byte[] pdf = os.toByteArray();
            log.debug("Rendered PDF from HTML ({} chars -> {} bytes)", html.length(), pdf.length);
            return pdf;
        } catch (Exception e) {
            throw new RuntimeException("Failed to render PDF from HTML", e);
        }
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
