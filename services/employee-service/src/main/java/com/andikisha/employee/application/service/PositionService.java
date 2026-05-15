package com.andikisha.employee.application.service;

import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.response.PositionResponse;
import com.andikisha.employee.application.mapper.EmployeeMapper;
import com.andikisha.employee.domain.model.Position;
import com.andikisha.employee.domain.repository.PositionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PositionService {

    private final PositionRepository positionRepository;
    private final EmployeeMapper mapper;

    public PositionService(PositionRepository positionRepository, EmployeeMapper mapper) {
        this.positionRepository = positionRepository;
        this.mapper = mapper;
    }

    public List<PositionResponse> findAll() {
        String tenantId = TenantContext.requireTenantId();
        return positionRepository.findByTenantIdAndActiveTrue(tenantId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public PositionResponse create(String title, String description, String gradeLevel) {
        String tenantId = TenantContext.requireTenantId();
        if (positionRepository.existsByTenantIdAndTitle(tenantId, title)) {
            throw new DuplicateResourceException("Position", "title", title);
        }
        Position position = Position.create(tenantId, title, description, gradeLevel);
        position = positionRepository.save(position);
        return mapper.toResponse(position);
    }
}
