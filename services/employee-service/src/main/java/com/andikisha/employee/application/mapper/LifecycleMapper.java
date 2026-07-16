package com.andikisha.employee.application.mapper;

import com.andikisha.employee.application.dto.response.LifecycleInstanceResponse;
import com.andikisha.employee.application.dto.response.LifecycleTaskDefinitionResponse;
import com.andikisha.employee.application.dto.response.LifecycleTaskResponse;
import com.andikisha.employee.application.dto.response.LifecycleTemplateResponse;
import com.andikisha.employee.domain.model.EmploymentType;
import com.andikisha.employee.domain.model.LifecycleTask;
import com.andikisha.employee.domain.model.LifecycleTaskDefinition;
import com.andikisha.employee.domain.model.LifecycleWorkflowInstance;
import com.andikisha.employee.domain.model.LifecycleWorkflowTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Manual mapping — the nested collections and the computed progress counts make
 * MapStruct awkward here, and the service already assembles the aggregates.
 */
@Component
public class LifecycleMapper {

    public LifecycleTemplateResponse toResponse(LifecycleWorkflowTemplate t) {
        List<LifecycleTaskDefinitionResponse> defs = t.getTaskDefinitions().stream()
                .map(this::toDefinitionResponse)
                .toList();
        List<String> types = t.getApplicableEmploymentTypes().stream()
                .map(EmploymentType::name)
                .toList();
        return new LifecycleTemplateResponse(
                t.getId(), t.getType().name(), t.getName(), t.isActive(), types, defs);
    }

    public LifecycleTaskDefinitionResponse toDefinitionResponse(LifecycleTaskDefinition d) {
        return new LifecycleTaskDefinitionResponse(
                d.getId(), d.getOrderIndex(), d.getTitle(), d.getDescription(),
                d.getAssigneeRole().name(), d.getCompletionType().name(), d.getDueOffsetDays());
    }

    public LifecycleInstanceResponse toResponse(LifecycleWorkflowInstance i) {
        List<LifecycleTaskResponse> tasks = i.getTasks().stream()
                .map(this::toTaskResponse)
                .toList();
        int total = i.getTasks().size();
        int completed = (int) i.getTasks().stream()
                .filter(LifecycleTask::isResolved)
                .count();
        return new LifecycleInstanceResponse(
                i.getId(), i.getEmployeeId(), i.getTemplateId(), i.getType().name(),
                i.getStatus().name(), i.getStartedAt(), i.getCompletedAt(),
                i.getInitiatedBy(), i.getSystemNote(), completed, total, tasks);
    }

    public LifecycleTaskResponse toTaskResponse(LifecycleTask t) {
        return new LifecycleTaskResponse(
                t.getId(), t.getTitle(), t.getDescription(), t.getAssigneeRole().name(),
                t.getDueDate(), t.getStatus().name(), t.getCompletionType().name(),
                t.getCompletedBy(), t.getCompletedAt(), t.getDocumentId());
    }
}
