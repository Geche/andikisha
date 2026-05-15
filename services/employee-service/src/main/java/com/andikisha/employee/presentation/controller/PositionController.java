package com.andikisha.employee.presentation.controller;

import com.andikisha.employee.application.dto.request.CreatePositionRequest;
import com.andikisha.employee.application.dto.response.PositionResponse;
import com.andikisha.employee.application.service.PositionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/positions")
@Tag(name = "Positions", description = "Position management")
public class PositionController {

    private final PositionService positionService;

    public PositionController(PositionService positionService) {
        this.positionService = positionService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR', 'EMPLOYEE')")
    @Operation(summary = "List all active positions")
    public List<PositionResponse> list() {
        return positionService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create a position")
    public PositionResponse create(@Valid @RequestBody CreatePositionRequest request) {
        return positionService.create(request.title(), request.description(), request.gradeLevel());
    }
}
