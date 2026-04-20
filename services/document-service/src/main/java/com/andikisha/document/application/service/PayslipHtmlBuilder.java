package com.andikisha.document.application.service;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class PayslipHtmlBuilder {

    public String build(String employeeName, String employeeNumber, String period,
                        Map<String, BigDecimal> earnings,
                        Map<String, BigDecimal> deductions,
                        Map<String, BigDecimal> reliefs,
                        BigDecimal grossPay, BigDecimal netPay) {

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head>")
                .append("<meta charset='UTF-8'>")
                .append("<style>")
                .append("body{font-family:Arial,sans-serif;font-size:12px;margin:20px;color:#1a1a1a;}")
                .append("h1{font-size:18px;margin-bottom:5px;}")
                .append("h2{font-size:14px;color:#333;border-bottom:1px solid #ccc;padding-bottom:5px;margin-top:20px;}")
                .append("table{width:100%;border-collapse:collapse;margin-bottom:15px;}")
                .append("td{padding:5px 8px;border-bottom:1px solid #eee;}")
                .append("td.label{color:#555;width:65%;}")
                .append("td.amount{text-align:right;font-family:monospace;}")
                .append(".total td{font-weight:bold;border-top:2px solid #333;border-bottom:none;}")
                .append(".header-table td{border:none;padding:2px 8px;}")
                .append(".footer{color:#999;font-size:10px;margin-top:30px;border-top:1px solid #eee;padding-top:10px;}")
                .append("</style></head><body>");

        html.append("<h1>PAYSLIP</h1>");
        html.append("<table class='header-table'>");
        appendRow(html, "Employee Name:", employeeName);
        appendRow(html, "Employee Number:", employeeNumber);
        appendRow(html, "Pay Period:", period);
        html.append("</table>");

        html.append("<h2>Earnings</h2><table>");
        for (var entry : earnings.entrySet()) {
            appendAmountRow(html, entry.getKey(), entry.getValue(), false);
        }
        appendAmountRow(html, "Gross Pay", grossPay, true);
        html.append("</table>");

        html.append("<h2>Deductions</h2><table>");
        for (var entry : deductions.entrySet()) {
            appendAmountRow(html, entry.getKey(), entry.getValue(), false);
        }
        html.append("</table>");

        if (reliefs != null && !reliefs.isEmpty()) {
            html.append("<h2>Tax Reliefs</h2><table>");
            for (var entry : reliefs.entrySet()) {
                html.append("<tr><td class='label'>").append(escape(entry.getKey()))
                        .append("</td><td class='amount'>(").append(formatKes(entry.getValue()))
                        .append(")</td></tr>");
            }
            html.append("</table>");
        }

        html.append("<table><tr class='total'>")
                .append("<td class='label' style='font-size:14px;'>NET PAY</td>")
                .append("<td class='amount' style='font-size:14px;'>").append(formatKes(netPay))
                .append("</td></tr></table>");

        html.append("<p class='footer'>This is a computer-generated document and does not require a signature.</p>");
        html.append("</body></html>");

        return html.toString();
    }

    private void appendRow(StringBuilder html, String label, String value) {
        html.append("<tr><td class='label'>").append(escape(label))
                .append("</td><td>").append(escape(value)).append("</td></tr>");
    }

    private void appendAmountRow(StringBuilder html, String label, BigDecimal amount, boolean total) {
        String rowClass = total ? " class='total'" : "";
        html.append("<tr").append(rowClass).append(">")
                .append("<td class='label'>").append(escape(label)).append("</td>")
                .append("<td class='amount'>").append(formatKes(amount)).append("</td>")
                .append("</tr>");
    }

    private String formatKes(BigDecimal amount) {
        if (amount == null) return "KES 0.00";
        return String.format("KES %,.2f", amount);
    }

    private String escape(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
