package com.andikisha.tenant.presentation.controller;

import com.andikisha.tenant.application.dto.response.PlanResponse;
import com.andikisha.tenant.application.service.PlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/plans")
@Tag(name = "Plans", description = "Subscription plans")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    @Operation(summary = "List available subscription plans")
    public List<PlanResponse> getAvailablePlans() {
        return planService.getAvailablePlans();
    }
}