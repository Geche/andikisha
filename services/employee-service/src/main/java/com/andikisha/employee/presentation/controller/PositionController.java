package com.andikisha.employee.presentation.controller;

import com.andikisha.employee.application.dto.request.CreatePositionRequest;
import com.andikisha.employee.application.dto.request.UpdatePositionRequest;
import com.andikisha.employee.application.dto.response.PositionResponse;
import com.andikisha.employee.application.service.PositionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/positions")
@Tag(name = "Positions", description = "Position management")
public class PositionController {

    private final PositionService positionService;

    public PositionController(PositionService positionService) {
        this.positionService = positionService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER', 'EMPLOYEE')")
    @Operation(summary = "List all active positions")
    public List<PositionResponse> list() {
        return positionService.findAll();
    }

    @PostMapping("/seed-defaults")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Seed default positions (idempotent — creates missing, skips existing)")
    public List<PositionResponse> seedDefaults() {
        return positionService.seedDefaults();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create a position")
    public PositionResponse create(@Valid @RequestBody CreatePositionRequest request) {
        return positionService.create(request.title(), request.description(), request.gradeLevel());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update a position")
    public PositionResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePositionRequest request) {
        return positionService.update(id, request.title(), request.description(), request.gradeLevel());
    }
}
