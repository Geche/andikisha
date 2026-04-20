package com.andikisha.document.infrastructure.messaging;

import com.andikisha.document.application.port.DocumentEventPublisher;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.infrastructure.config.RabbitMqConfig;
import com.andikisha.events.document.DocumentReadyEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class RabbitDocumentEventPublisher implements DocumentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitDocumentEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public RabbitDocumentEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishDocumentReady(Document doc) {
        var event = new DocumentReadyEvent(
                doc.getTenantId(),
                doc.getId().toString(),
                doc.getEmployeeId() != null ? doc.getEmployeeId().toString() : null,
                doc.getDocumentType().name(),
                doc.getFileName(),
                doc.getPeriod()
        );
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.DOCUMENT_EXCHANGE, "document.ready", event);
        log.info("Published document ready: {} for {}",
                doc.getFileName(), doc.getEmployeeName());
    }
}