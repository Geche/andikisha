package com.andikisha.document.application.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Builds the HTML body of a Kenya Employment Act, 2007 Section 51 Certificate of Service.
 *
 * Legal basis:
 *   - §51(2) requires the certificate to state the employer's name and postal address, the
 *     employee's name, the dates employment commenced and ended, and the nature and usual place
 *     of the work.
 *   - §51(3) provides that the employer is not required to give a testimonial or reference as to
 *     the employee's character or performance. The certificate is therefore a record of service
 *     only — the termination reason carried on EmployeeTerminatedEvent is deliberately NOT rendered.
 */
@Component
public class CertificateOfServiceHtmlBuilder {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d MMMM yyyy");

    /** Authorized signatory block (#58). Null when the tenant has configured none. */
    public record Signatory(String name, String title, String signatureDataUri) {}

    public String build(String logoDataUri, String employerName, String employeeName, String employeeNumber,
                        String positionTitle, String departmentName,
                        LocalDate hireDate, LocalDate terminationDate, LocalDate issueDate,
                        Signatory signatory) {

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head>")
                .append("<meta charset='UTF-8'>")
                .append("<style>")
                .append("body{font-family:Arial,sans-serif;font-size:12px;margin:40px;color:#1a1a1a;line-height:1.6;}")
                .append(".logo{display:block;margin:0 auto 16px;max-height:80px;}")
                .append("h1{font-size:20px;text-align:center;margin-bottom:4px;letter-spacing:1px;}")
                .append(".subtitle{text-align:center;color:#555;font-size:11px;margin-bottom:30px;}")
                .append(".employer{text-align:center;font-size:14px;font-weight:bold;margin-bottom:24px;}")
                .append("table{width:100%;border-collapse:collapse;margin:20px 0;}")
                .append("td{padding:6px 8px;border-bottom:1px solid #eee;vertical-align:top;}")
                .append("td.label{color:#555;width:35%;}")
                .append("p{margin:14px 0;}")
                .append(".signature{margin-top:40px;}")
                .append(".sig-img{max-height:60px;display:block;margin-bottom:2px;}")
                .append(".sig-line{border-top:1px solid #333;width:240px;padding-top:4px;}")
                .append(".sig-name{font-weight:bold;}")
                .append(".sig-title{color:#555;font-size:11px;}")
                .append(".footer{color:#999;font-size:10px;margin-top:40px;border-top:1px solid #eee;padding-top:10px;}")
                .append("</style></head><body>");

        // Company logo letterhead when the tenant has uploaded one (#57); otherwise a name-only header.
        if (logoDataUri != null && !logoDataUri.isBlank()) {
            html.append("<img class='logo' src='").append(logoDataUri).append("' alt='Company logo'/>");
        }
        html.append("<h1>CERTIFICATE OF SERVICE</h1>");
        html.append("<div class='subtitle'>Issued pursuant to Section 51 of the Employment Act, 2007 (Kenya)</div>");
        html.append("<div class='employer'>").append(escape(employerName)).append("</div>");

        html.append("<p>This is to certify that the following person was employed as set out below:</p>");

        html.append("<table>");
        appendRow(html, "Employee Name", employeeName);
        appendRow(html, "Employee Number", employeeNumber);
        appendRow(html, "Position / Nature of Work", positionTitle);
        appendRow(html, "Department", departmentName);
        appendRow(html, "Date of Engagement", hireDate != null ? DATE.format(hireDate) : "Not on record");
        appendRow(html, "Date Employment Ended", terminationDate != null ? DATE.format(terminationDate) : "Not on record");
        html.append("</table>");

        html.append("<p>This certificate is issued at the request of, and in respect of, the above-named employee ")
                .append("in accordance with the employer's statutory obligation under the Employment Act.</p>");

        html.append("<table><tr>")
                .append("<td class='label'>Date of Issue</td><td>")
                .append(issueDate != null ? DATE.format(issueDate) : "").append("</td>")
                .append("</tr></table>");

        // Authorized signatory block (#58): signature image (if any) over a signature line with the
        // signatory's name and title. HR authorizes issuance via the Issue action (#56).
        if (signatory != null) {
            html.append("<div class='signature'>");
            if (signatory.signatureDataUri() != null && !signatory.signatureDataUri().isBlank()) {
                html.append("<img class='sig-img' src='").append(signatory.signatureDataUri())
                        .append("' alt='Signature'/>");
            }
            html.append("<div class='sig-line'><span class='sig-name'>")
                    .append(escape(signatory.name())).append("</span></div>")
                    .append("<div class='sig-title'>").append(escape(signatory.title())).append("</div>")
                    .append("</div>");
        }

        html.append("<p class='footer'>This is a computer-generated Certificate of Service issued under ")
                .append("Section 51 of the Employment Act, 2007. It is a record of service only; in accordance ")
                .append("with Section 51(3), it is not a testimonial or reference as to the employee's ")
                .append("character or performance.</p>");
        html.append("</body></html>");

        return html.toString();
    }

    private void appendRow(StringBuilder html, String label, String value) {
        html.append("<tr><td class='label'>").append(escape(label))
                .append("</td><td>").append(escape(value == null || value.isBlank() ? "-" : value))
                .append("</td></tr>");
    }

    private String escape(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
