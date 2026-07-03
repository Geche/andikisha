package com.andikisha.document.application.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Builds the HTML body of a Kenya Employment Act §52 Certificate of Service.
 *
 * Legal constraints baked into the layout:
 *   - §52(2) forbids the certificate from stating the reason for termination or
 *     any judgement of the employee's conduct/capability unless the employee
 *     requests it. The termination reason carried on EmployeeTerminatedEvent is
 *     therefore deliberately NOT rendered here.
 *   - §52(1) requires the name/description of the employer, the name of the
 *     employee, the dates of engagement and of the end of employment, and the
 *     nature/description of the work.
 */
@Component
public class CertificateOfServiceHtmlBuilder {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("d MMMM yyyy");

    public String build(String employerName, String employeeName, String employeeNumber,
                        String positionTitle, String departmentName,
                        LocalDate hireDate, LocalDate terminationDate, LocalDate issueDate) {

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head>")
                .append("<meta charset='UTF-8'>")
                .append("<style>")
                .append("body{font-family:Arial,sans-serif;font-size:12px;margin:40px;color:#1a1a1a;line-height:1.6;}")
                .append("h1{font-size:20px;text-align:center;margin-bottom:4px;letter-spacing:1px;}")
                .append(".subtitle{text-align:center;color:#555;font-size:11px;margin-bottom:30px;}")
                .append(".employer{text-align:center;font-size:14px;font-weight:bold;margin-bottom:24px;}")
                .append("table{width:100%;border-collapse:collapse;margin:20px 0;}")
                .append("td{padding:6px 8px;border-bottom:1px solid #eee;vertical-align:top;}")
                .append("td.label{color:#555;width:35%;}")
                .append("p{margin:14px 0;}")
                .append(".footer{color:#999;font-size:10px;margin-top:40px;border-top:1px solid #eee;padding-top:10px;}")
                .append("</style></head><body>");

        html.append("<h1>CERTIFICATE OF SERVICE</h1>");
        html.append("<div class='subtitle'>Issued pursuant to Section 52 of the Employment Act, 2007 (Kenya)</div>");
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

        html.append("<p class='footer'>This is a computer-generated Certificate of Service. ")
                .append("In accordance with Section 52(2) of the Employment Act, it contains no statement ")
                .append("as to the reason for termination or the employee's conduct or capability.</p>");
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
