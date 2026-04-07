package com.andikisha.tenant.application.service;

import com.andikisha.tenant.application.dto.response.PlanResponse;
import com.andikisha.tenant.application.mapper.TenantMapper;
import com.andikisha.tenant.domain.repository.PlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PlanService {

    private final PlanRepository planRepository;
    private final TenantMapper mapper;

    public PlanService(PlanRepository planRepository, TenantMapper mapper) {
        this.planRepository = planRepository;
        this.mapper = mapper;
    }

    public List<PlanResponse> getAvailablePlans() {
        return planRepository.findByTenantIdAndActiveTrue("SYSTEM")
                .stream().map(mapper::toResponse).toList();
    }
}