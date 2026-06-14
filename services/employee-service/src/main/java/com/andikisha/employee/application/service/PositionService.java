package com.andikisha.employee.application.service;

import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.response.PositionResponse;
import com.andikisha.employee.application.mapper.EmployeeMapper;
import com.andikisha.employee.domain.exception.PositionNotFoundException;
import com.andikisha.employee.domain.model.Position;
import com.andikisha.employee.domain.repository.PositionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PositionService {

    private record DefaultPosition(String title, String description, String gradeLevel) {}

    private static final List<DefaultPosition> DEFAULT_POSITIONS = List.of(
        new DefaultPosition("HR Officer",                     "Handles recruitment and employee relations",        "L3"),
        new DefaultPosition("Sales Representative",           "Field and inside sales",                           "L2"),
        new DefaultPosition("Sales Manager",                  "Manages the sales team and targets",               "L4"),
        new DefaultPosition("Software Engineer",              "Full-stack and backend development",               "L4"),
        new DefaultPosition("Accountant",                     "Bookkeeping, payroll processing, tax filing",      "L3"),
        new DefaultPosition("Operations Manager",             "Oversees daily operational workflows",             "L5"),
        new DefaultPosition("Customer Service Representative","First-line customer support",                      "L2"),
        new DefaultPosition("Marketing Officer",              "Brand management and digital marketing",           "L3"),
        new DefaultPosition("Administrative Assistant",       "Office administration and executive support",      "L2"),
        new DefaultPosition("Finance Manager",                "Financial planning, reporting, and compliance",    "L5")
    );

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
    public List<PositionResponse> seedDefaults() {
        String tenantId = TenantContext.requireTenantId();
        for (DefaultPosition p : DEFAULT_POSITIONS) {
            if (!positionRepository.existsByTenantIdAndTitle(tenantId, p.title())) {
                positionRepository.save(Position.create(tenantId, p.title(), p.description(), p.gradeLevel()));
            }
        }
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

    // R3-3 (EMP-BACKLOG-003): mirrors DepartmentService.update — positions had no
    // update path while departments did.
    @Transactional
    public PositionResponse update(UUID id, String title, String description, String gradeLevel) {
        String tenantId = TenantContext.requireTenantId();
        Position position = positionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new PositionNotFoundException(id));
        position.update(title, description, gradeLevel);
        position = positionRepository.save(position);
        return mapper.toResponse(position);
    }
}
