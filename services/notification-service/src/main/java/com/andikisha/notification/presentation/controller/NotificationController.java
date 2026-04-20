package com.andikisha.notification.presentation.controller;

import com.andikisha.notification.application.dto.response.NotificationResponse;
import com.andikisha.notification.application.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Notification history and preferences")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get my notifications")
    public Page<NotificationResponse> myNotifications(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-ID") String userId,
            Pageable pageable) {
        return notificationService.getForRecipient(UUID.fromString(userId), pageable);
    }

    @GetMapping("/me/unread-count")
    @Operation(summary = "Get unread notification count")
    public Map<String, Long> unreadCount(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-ID") String userId) {
        return Map.of("unreadCount", notificationService.countUnread(UUID.fromString(userId)));
    }

    @GetMapping
    @Operation(summary = "List all notifications (admin)")
    public Page<NotificationResponse> listAll(
            @RequestHeader("X-Tenant-ID") String tenantId,
            Pageable pageable) {
        return notificationService.listAll(pageable);
    }

    @GetMapping("/employees/{employeeId}")
    @Operation(summary = "Get notifications for a specific employee")
    public Page<NotificationResponse> forEmployee(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID employeeId,
            Pageable pageable) {
        return notificationService.getForRecipient(employeeId, pageable);
    }
}