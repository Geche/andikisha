package com.andikisha.employee.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.request.CreateLifecycleTemplateRequest;
import com.andikisha.employee.application.dto.request.LifecycleTaskDefinitionRequest;
import com.andikisha.employee.application.dto.request.UpdateLifecycleTemplateRequest;
import com.andikisha.employee.application.dto.response.LifecycleInstanceResponse;
import com.andikisha.employee.application.dto.response.LifecycleTaskResponse;
import com.andikisha.employee.application.dto.response.LifecycleTemplateResponse;
import com.andikisha.employee.application.mapper.LifecycleMapper;
import com.andikisha.employee.application.port.EmployeeEventPublisher;
import com.andikisha.employee.domain.exception.EmployeeNotFoundException;
import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.domain.model.EmploymentStatus;
import com.andikisha.employee.domain.model.EmploymentType;
import com.andikisha.employee.domain.model.LifecycleAssigneeRole;
import com.andikisha.employee.domain.model.LifecycleInstanceStatus;
import com.andikisha.employee.domain.model.LifecycleTask;
import com.andikisha.employee.domain.model.LifecycleTaskDefinition;
import com.andikisha.employee.domain.model.LifecycleType;
import com.andikisha.employee.domain.model.LifecycleWorkflowInstance;
import com.andikisha.employee.domain.model.LifecycleWorkflowTemplate;
import com.andikisha.employee.domain.model.TaskCompletionType;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import com.andikisha.employee.domain.repository.LifecycleTaskRepository;
import com.andikisha.employee.domain.repository.LifecycleWorkflowInstanceRepository;
import com.andikisha.employee.domain.repository.LifecycleWorkflowTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class LifecycleWorkflowService {

    /** Instance statuses that count as "still open" — not yet completed or cancelled. */
    static final List<LifecycleInstanceStatus> OPEN_STATUSES = List.of(
            LifecycleInstanceStatus.PENDING,
            LifecycleInstanceStatus.IN_PROGRESS,
            LifecycleInstanceStatus.BLOCKED);

    private final LifecycleWorkflowTemplateRepository templateRepository;
    private final LifecycleWorkflowInstanceRepository instanceRepository;
    private final LifecycleTaskRepository taskRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;
    private final EmployeeEventPublisher eventPublisher;
    private final LifecycleMapper mapper;

    public LifecycleWorkflowService(LifecycleWorkflowTemplateRepository templateRepository,
                                    LifecycleWorkflowInstanceRepository instanceRepository,
                                    LifecycleTaskRepository taskRepository,
                                    EmployeeRepository employeeRepository,
                                    EmployeeService employeeService,
                                    EmployeeEventPublisher eventPublisher,
                                    LifecycleMapper mapper) {
        this.templateRepository = templateRepository;
        this.instanceRepository = instanceRepository;
        this.taskRepository = taskRepository;
        this.employeeRepository = employeeRepository;
        this.employeeService = employeeService;
        this.eventPublisher = eventPublisher;
        this.mapper = mapper;
    }

    // ── Templates ────────────────────────────────────────────────────────────

    /** List templates; lazily seeds tenant defaults on first access (hence read-write). */
    @Transactional
    public List<LifecycleTemplateResponse> listTemplates() {
        String tenantId = TenantContext.requireTenantId();
        ensureDefaultTemplates(tenantId);
        return templateRepository.findByTenantIdOrderByTypeAsc(tenantId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public LifecycleTemplateResponse createTemplate(CreateLifecycleTemplateRequest request) {
        String tenantId = TenantContext.requireTenantId();
        LifecycleType type = parseEnum(LifecycleType.class, request.type());
        Set<EmploymentType> types = parseEmploymentTypes(request.applicableEmploymentTypes());

        LifecycleWorkflowTemplate template =
                LifecycleWorkflowTemplate.create(tenantId, type, request.name(), types);
        applyTaskDefinitions(template, tenantId, request.tasks());

        return mapper.toResponse(templateRepository.save(template));
    }

    @Transactional
    public LifecycleTemplateResponse updateTemplate(UUID templateId,
                                                    UpdateLifecycleTemplateRequest request) {
        String tenantId = TenantContext.requireTenantId();
        LifecycleWorkflowTemplate template = templateRepository
                .findByIdAndTenantId(templateId, tenantId)
                .orElseThrow(() -> new BusinessRuleException("TEMPLATE_NOT_FOUND",
                        "Lifecycle template not found: " + templateId));

        template.rename(request.name());
        template.updateApplicableTypes(parseEmploymentTypes(request.applicableEmploymentTypes()));
        template.clearTaskDefinitions();
        applyTaskDefinitions(template, tenantId, request.tasks());

        return mapper.toResponse(templateRepository.save(template));
    }

    @Transactional
    public void deactivateTemplate(UUID templateId) {
        String tenantId = TenantContext.requireTenantId();
        LifecycleWorkflowTemplate template = templateRepository
                .findByIdAndTenantId(templateId, tenantId)
                .orElseThrow(() -> new BusinessRuleException("TEMPLATE_NOT_FOUND",
                        "Lifecycle template not found: " + templateId));
        template.deactivate();
        templateRepository.save(template);
    }

    /**
     * Seeds the sensible Kenyan-SME default ONBOARDING/OFFBOARDING templates the first
     * time a tenant touches the module. Idempotent per type — only creates a default
     * when the tenant has no template of that type at all.
     */
    void ensureDefaultTemplates(String tenantId) {
        if (!templateRepository.existsByTenantIdAndType(tenantId, LifecycleType.ONBOARDING)) {
            LifecycleWorkflowTemplate onboarding = LifecycleWorkflowTemplate.create(
                    tenantId, LifecycleType.ONBOARDING, "Default Onboarding", new LinkedHashSet<>());
            int i = 0;
            onboarding.addTaskDefinition(LifecycleTaskDefinition.create(tenantId, i++,
                    "Upload national ID", null,
                    LifecycleAssigneeRole.EMPLOYEE, TaskCompletionType.DOCUMENT_UPLOAD, null));
            onboarding.addTaskDefinition(LifecycleTaskDefinition.create(tenantId, i++,
                    "Confirm KRA PIN", null,
                    LifecycleAssigneeRole.EMPLOYEE, TaskCompletionType.MANUAL, null));
            onboarding.addTaskDefinition(LifecycleTaskDefinition.create(tenantId, i++,
                    "Provide bank / M-Pesa details", null,
                    LifecycleAssigneeRole.EMPLOYEE, TaskCompletionType.MANUAL, null));
            onboarding.addTaskDefinition(LifecycleTaskDefinition.create(tenantId, i,
                    "Acknowledge employment contract", null,
                    LifecycleAssigneeRole.EMPLOYEE, TaskCompletionType.MANUAL, null));
            templateRepository.save(onboarding);
        }

        if (!templateRepository.existsByTenantIdAndType(tenantId, LifecycleType.OFFBOARDING)) {
            LifecycleWorkflowTemplate offboarding = LifecycleWorkflowTemplate.create(
                    tenantId, LifecycleType.OFFBOARDING, "Default Offboarding", new LinkedHashSet<>());
            int i = 0;
            offboarding.addTaskDefinition(LifecycleTaskDefinition.create(tenantId, i++,
                    "Handover of duties", null,
                    LifecycleAssigneeRole.LINE_MANAGER, TaskCompletionType.MANUAL, null));
            offboarding.addTaskDefinition(LifecycleTaskDefinition.create(tenantId, i++,
                    "Revoke system access", null,
                    LifecycleAssigneeRole.ADMIN, TaskCompletionType.MANUAL, null));
            offboarding.addTaskDefinition(LifecycleTaskDefinition.create(tenantId, i++,
                    "Return company property", null,
                    LifecycleAssigneeRole.HR_OFFICER, TaskCompletionType.MANUAL, null));
            offboarding.addTaskDefinition(LifecycleTaskDefinition.create(tenantId, i,
                    "Final pay — link to payroll", null,
                    LifecycleAssigneeRole.HR_MANAGER, TaskCompletionType.MANUAL, null));
            templateRepository.save(offboarding);
        }
    }

    // ── Initiation ───────────────────────────────────────────────────────────

    @Transactional
    public LifecycleInstanceResponse initiateOnboarding(UUID employeeId, String actor) {
        String tenantId = TenantContext.requireTenantId();
        ensureDefaultTemplates(tenantId);

        Employee employee = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));
        if (employee.getStatus() == EmploymentStatus.TERMINATED) {
            throw new BusinessRuleException("EMPLOYEE_TERMINATED",
                    "Cannot onboard a terminated employee");
        }
        if (instanceRepository.existsByTenantIdAndEmployeeIdAndTypeAndStatusIn(
                tenantId, employeeId, LifecycleType.ONBOARDING, OPEN_STATUSES)) {
            throw new BusinessRuleException("ONBOARDING_IN_PROGRESS",
                    "This employee already has an open onboarding workflow");
        }

        LifecycleWorkflowTemplate template = requireActiveTemplate(tenantId, LifecycleType.ONBOARDING);
        LifecycleWorkflowInstance instance =
                materialise(tenantId, employee, template, LifecycleType.ONBOARDING, actor);
        instance = instanceRepository.save(instance);

        final LifecycleWorkflowInstance started = instance;
        publishAfterCommit(() -> eventPublisher.publishOnboardingStarted(started));
        return mapper.toResponse(instance);
    }

    @Transactional
    public LifecycleInstanceResponse initiateOffboarding(UUID employeeId, String actor) {
        String tenantId = TenantContext.requireTenantId();
        ensureDefaultTemplates(tenantId);

        Employee employee = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));
        if (employee.getStatus() == EmploymentStatus.TERMINATED) {
            throw new BusinessRuleException("EMPLOYEE_TERMINATED",
                    "Cannot offboard an already-terminated employee");
        }
        if (instanceRepository.existsByTenantIdAndEmployeeIdAndTypeAndStatusIn(
                tenantId, employeeId, LifecycleType.OFFBOARDING, OPEN_STATUSES)) {
            throw new BusinessRuleException("OFFBOARDING_IN_PROGRESS",
                    "This employee already has an open offboarding workflow");
        }

        LifecycleWorkflowTemplate template = requireActiveTemplate(tenantId, LifecycleType.OFFBOARDING);
        LifecycleWorkflowInstance instance =
                materialise(tenantId, employee, template, LifecycleType.OFFBOARDING, actor);
        instance = instanceRepository.save(instance);

        final LifecycleWorkflowInstance started = instance;
        publishAfterCommit(() -> eventPublisher.publishOffboardingStarted(started));
        return mapper.toResponse(instance);
    }

    // ── Reads ────────────────────────────────────────────────────────────────

    public List<LifecycleInstanceResponse> listInstances(String type, String status) {
        String tenantId = TenantContext.requireTenantId();
        LifecycleType typeFilter = type != null ? parseEnum(LifecycleType.class, type) : null;
        LifecycleInstanceStatus statusFilter =
                status != null ? parseEnum(LifecycleInstanceStatus.class, status) : null;

        List<LifecycleWorkflowInstance> results;
        if (typeFilter != null && statusFilter != null) {
            results = instanceRepository.findByTenantIdAndTypeAndStatusOrderByStartedAtDesc(
                    tenantId, typeFilter, statusFilter);
        } else if (typeFilter != null) {
            results = instanceRepository.findByTenantIdAndTypeOrderByStartedAtDesc(tenantId, typeFilter);
        } else if (statusFilter != null) {
            results = instanceRepository.findByTenantIdAndStatusOrderByStartedAtDesc(tenantId, statusFilter);
        } else {
            results = instanceRepository.findByTenantIdOrderByStartedAtDesc(tenantId);
        }
        return results.stream().map(mapper::toResponse).toList();
    }

    public List<LifecycleInstanceResponse> listInstancesForEmployee(UUID employeeId) {
        String tenantId = TenantContext.requireTenantId();
        return instanceRepository.findByTenantIdAndEmployeeIdOrderByStartedAtDesc(tenantId, employeeId)
                .stream().map(mapper::toResponse).toList();
    }

    public LifecycleInstanceResponse getInstance(UUID instanceId) {
        String tenantId = TenantContext.requireTenantId();
        return instanceRepository.findByIdAndTenantId(instanceId, tenantId)
                .map(mapper::toResponse)
                .orElseThrow(() -> new BusinessRuleException("INSTANCE_NOT_FOUND",
                        "Lifecycle instance not found: " + instanceId));
    }

    public List<LifecycleTaskResponse> myOnboardingTasks(UUID employeeId) {
        String tenantId = TenantContext.requireTenantId();
        return taskRepository.findOpenEmployeeOnboardingTasks(tenantId, employeeId)
                .stream().map(mapper::toTaskResponse).toList();
    }

    // ── Task completion / skip ────────────────────────────────────────────────

    @Transactional
    public LifecycleInstanceResponse completeTask(UUID taskId, String callerRole,
                                                  UUID callerEmployeeId, String actor,
                                                  UUID documentId) {
        String tenantId = TenantContext.requireTenantId();
        LifecycleTask task = taskRepository.findByIdAndTenantId(taskId, tenantId)
                .orElseThrow(() -> new BusinessRuleException("TASK_NOT_FOUND",
                        "Lifecycle task not found: " + taskId));

        LifecycleWorkflowInstance instance = task.getInstance();
        requireOpenInstance(instance);
        authorizeTaskAction(task, callerRole, callerEmployeeId);

        task.complete(actor, documentId);
        return finishIfComplete(instance, actor);
    }

    @Transactional
    public LifecycleInstanceResponse skipTask(UUID taskId, String callerRole,
                                              UUID callerEmployeeId, String actor) {
        String tenantId = TenantContext.requireTenantId();
        LifecycleTask task = taskRepository.findByIdAndTenantId(taskId, tenantId)
                .orElseThrow(() -> new BusinessRuleException("TASK_NOT_FOUND",
                        "Lifecycle task not found: " + taskId));

        LifecycleWorkflowInstance instance = task.getInstance();
        requireOpenInstance(instance);
        authorizeTaskAction(task, callerRole, callerEmployeeId);

        task.skip(actor);
        return finishIfComplete(instance, actor);
    }

    /**
     * Recomputes instance state after a task changes. When every task is DONE/SKIPPED the
     * instance is finished:
     * <ul>
     *   <li>ONBOARDING → COMPLETED + OnboardingCompletedEvent. Employment status is NOT
     *       touched and confirmProbation is NOT called (Adjustment 1).</li>
     *   <li>OFFBOARDING → instance COMPLETED first, THEN {@code terminate()} (which fires the
     *       single EmployeeTerminatedEvent), then archive the employee (D2). Because the
     *       instance is already COMPLETED, terminate's cancel-open-offboarding sweep skips it.</li>
     * </ul>
     */
    private LifecycleInstanceResponse finishIfComplete(LifecycleWorkflowInstance instance,
                                                       String actor) {
        if (!instance.allTasksResolved()) {
            instanceRepository.save(instance);
            return mapper.toResponse(instance);
        }

        instance.markCompleted(Instant.now());
        instanceRepository.save(instance);

        if (instance.getType() == LifecycleType.ONBOARDING) {
            final LifecycleWorkflowInstance completed = instance;
            publishAfterCommit(() -> eventPublisher.publishOnboardingCompleted(completed));
            return mapper.toResponse(instance);
        }

        // OFFBOARDING completion — single termination path, no separate offboarding-completed event.
        // The instance is already COMPLETED (saved above), so terminate()'s cancel-open-offboarding
        // sweep (OPEN statuses only) never touches it. terminate() also archives the employee (D2 —
        // both exit paths archive identically) and fires the single EmployeeTerminatedEvent.
        employeeService.terminate(instance.getEmployeeId(), "Offboarding completed", actor);
        return mapper.toResponse(instance);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private LifecycleWorkflowInstance materialise(String tenantId, Employee employee,
                                                  LifecycleWorkflowTemplate template,
                                                  LifecycleType type, String actor) {
        LifecycleWorkflowInstance instance = LifecycleWorkflowInstance.start(
                tenantId, employee.getId(), template.getId(), type, actor);
        LocalDate startDate = LocalDate.now();
        for (LifecycleTaskDefinition def : template.getTaskDefinitions()) {
            LocalDate dueDate = def.getDueOffsetDays() != null
                    ? startDate.plusDays(def.getDueOffsetDays()) : null;
            instance.addTask(LifecycleTask.create(
                    tenantId, def.getTitle(), def.getDescription(),
                    def.getAssigneeRole(), dueDate, def.getCompletionType()));
        }
        return instance;
    }

    private LifecycleWorkflowTemplate requireActiveTemplate(String tenantId, LifecycleType type) {
        return templateRepository
                .findFirstByTenantIdAndTypeAndActiveTrueOrderByCreatedAtAsc(tenantId, type)
                .orElseThrow(() -> new BusinessRuleException("NO_ACTIVE_TEMPLATE",
                        "No active " + type + " template configured"));
    }

    private void requireOpenInstance(LifecycleWorkflowInstance instance) {
        if (!instance.isOpen()) {
            throw new BusinessRuleException("INSTANCE_CLOSED",
                    "This workflow is already " + instance.getStatus());
        }
    }

    /**
     * HR_MANAGER and ADMIN may complete/skip any task. Everyone else may only act on their
     * OWN EMPLOYEE-assigned task — the caller's X-Employee-ID must match the instance's
     * employeeId and the task must be EMPLOYEE-assigned. Ownership is never derived from the
     * user account id (authentication.name); it is the trusted gateway X-Employee-ID header.
     */
    private void authorizeTaskAction(LifecycleTask task, String callerRole, UUID callerEmployeeId) {
        if (isPrivileged(callerRole)) {
            return;
        }
        if (callerEmployeeId == null) {
            throw new BusinessRuleException("NO_EMPLOYEE_CONTEXT",
                    "Only the assigned employee can complete this task");
        }
        boolean ownEmployeeTask = task.getAssigneeRole() == LifecycleAssigneeRole.EMPLOYEE
                && callerEmployeeId.equals(task.getInstance().getEmployeeId());
        if (!ownEmployeeTask) {
            throw new BusinessRuleException("NOT_OWNER",
                    "You can only complete your own tasks");
        }
    }

    private boolean isPrivileged(String callerRole) {
        if (callerRole == null) {
            return false;
        }
        String r = callerRole.toUpperCase();
        return r.contains("HR_MANAGER") || r.contains("ADMIN");
    }

    private void applyTaskDefinitions(LifecycleWorkflowTemplate template, String tenantId,
                                      List<LifecycleTaskDefinitionRequest> tasks) {
        int order = 0;
        for (LifecycleTaskDefinitionRequest t : tasks) {
            template.addTaskDefinition(LifecycleTaskDefinition.create(
                    tenantId, order++, t.title(), t.description(),
                    parseEnum(LifecycleAssigneeRole.class, t.assigneeRole()),
                    parseEnum(TaskCompletionType.class, t.completionType()),
                    t.dueOffsetDays()));
        }
    }

    private Set<EmploymentType> parseEmploymentTypes(List<String> raw) {
        if (raw == null || raw.isEmpty()) {
            return new LinkedHashSet<>();
        }
        return raw.stream()
                .map(v -> parseEnum(EmploymentType.class, v))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private static <E extends Enum<E>> E parseEnum(Class<E> type, String value) {
        try {
            return Enum.valueOf(type, value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BusinessRuleException("INVALID_ENUM_VALUE",
                    "Invalid value '" + value + "' for " + type.getSimpleName());
        }
    }

    private void publishAfterCommit(Runnable publishAction) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            publishAction.run();
                        }
                    });
        } else {
            publishAction.run();
        }
    }
}
