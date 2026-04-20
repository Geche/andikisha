package com.andikisha.document.application.port;

import java.util.Map;

public interface PdfGenerator {

    byte[] generateFromHtml(String html);

    byte[] generateFromTemplate(String template, Map<String, Object> variables);
}