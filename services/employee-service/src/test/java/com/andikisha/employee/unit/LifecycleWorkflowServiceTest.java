package com.andikisha.employee.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.mapper.LifecycleMapper;
import com.andikisha.employee.application.port.EmployeeEventPublisher;
import com.andikisha.employee.application.service.EmployeeService;
import com.andikisha.employee.application.service.LifecycleWorkflowService;
import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.domain.model.EmploymentStatus;
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
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LifecycleWorkflowServiceTest {

    @Mock private LifecycleWorkflowTemplateRepository templateRepository;
    @Mock private LifecycleWorkflowInstanceRepository instanceRepository;
    @Mock private LifecycleTaskRepository taskRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private EmployeeService employeeService;
    @Mock private EmployeeEventPublisher eventPublisher;
    @Mock private LifecycleMapper mapper;

    @InjectMocks private LifecycleWorkflowService service;

    private static final String TENANT_ID = "test-tenant";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // ── 1. Materialisation ─────────────────────────────────────────────────────

    @Test
    void initiateOnboarding_materialisesTaskDefinitionsInOrder_withComputedDueDates() {
        UUID employeeId = UUID.randomUUID();
        Employee employee = mock(Employee.class);
        when(employee.getId()).thenReturn(employeeId);
        when(employee.getStatus()).thenReturn(EmploymentStatus.ACTIVE);
        when(employeeRepository.findByIdAndTenantId(employeeId, TENANT_ID))
                .thenReturn(Optional.of(employee));

        when(templateRepository.existsByTenantIdAndType(eq(TENANT_ID), any())).thenReturn(true);
        when(instanceRepository.existsByTenantIdAndEmployeeIdAndTypeAndStatusIn(
                eq(TENANT_ID), eq(employeeId), eq(LifecycleType.ONBOARDING), any()))
                .thenReturn(false);

        LifecycleWorkflowTemplate template = LifecycleWorkflowTemplate.create(
                TENANT_ID, LifecycleType.ONBOARDING, "Default Onboarding", new LinkedHashSet<>());
        template.addTaskDefinition(LifecycleTaskDefinition.create(TENANT_ID, 0, "Upload national ID",
                null, LifecycleAssigneeRole.EMPLOYEE, TaskCompletionType.DOCUMENT_UPLOAD, null));
        template.addTaskDefinition(LifecycleTaskDefinition.create(TENANT_ID, 1, "Confirm KRA PIN",
                null, LifecycleAssigneeRole.EMPLOYEE, TaskCompletionType.MANUAL, 5));
        template.addTaskDefinition(LifecycleTaskDefinition.create(TENANT_ID, 2, "Acknowledge contract",
                null, LifecycleAssigneeRole.EMPLOYEE, TaskCompletionType.MANUAL, null));
        when(templateRepository.findFirstByTenantIdAndTypeAndActiveTrueOrderByCreatedAtAsc(
                TENANT_ID, LifecycleType.ONBOARDING)).thenReturn(Optional.of(template));

        when(instanceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.initiateOnboarding(employeeId, "hr-user");

        ArgumentCaptor<LifecycleWorkflowInstance> captor =
                ArgumentCaptor.forClass(LifecycleWorkflowInstance.class);
        verify(instanceRepository).save(captor.capture());
        LifecycleWorkflowInstance instance = captor.getValue();

        assertThat(instance.getType()).isEqualTo(LifecycleType.ONBOARDING);
        assertThat(instance.getStatus()).isEqualTo(LifecycleInstanceStatus.IN_PROGRESS);
        assertThat(instance.getEmployeeId()).isEqualTo(employeeId);
        assertThat(instance.getTasks()).hasSize(3);
        assertThat(instance.getTasks()).extracting(LifecycleTask::getTitle)
                .containsExactly("Upload national ID", "Confirm KRA PIN", "Acknowledge contract");
        // dueDate computed from offset only where dueOffsetDays is set
        assertThat(instance.getTasks().get(0).getDueDate()).isNull();
        assertThat(instance.getTasks().get(1).getDueDate()).isEqualTo(LocalDate.now().plusDays(5));
        assertThat(instance.getTasks().get(2).getDueDate()).isNull();

        verify(eventPublisher).publishOnboardingStarted(any(LifecycleWorkflowInstance.class));
    }

    // ── 2. Assignee authorisation matrix ────────────────────────────────────────

    @Test
    void completeTask_employeeCompletesOwnEmployeeTask_succeeds() {
        UUID owner = UUID.randomUUID();
        LifecycleWorkflowInstance instance = onboardingInstanceWithTwoEmployeeTasks(owner);
        LifecycleTask task = instance.getTasks().get(0);
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        service.completeTask(UUID.randomUUID(), "EMPLOYEE", owner, "user-1", null);

        assertThat(task.getStatus()).isEqualTo(com.andikisha.employee.domain.model.LifecycleTaskStatus.DONE);
        // second task still open → instance not finished
        assertThat(instance.getStatus()).isEqualTo(LifecycleInstanceStatus.IN_PROGRESS);
    }

    @Test
    void completeTask_employeeCompletesAnotherEmployeesTask_throwsNotOwner() {
        UUID owner = UUID.randomUUID();
        UUID caller = UUID.randomUUID();
        LifecycleWorkflowInstance instance = onboardingInstanceWithTwoEmployeeTasks(owner);
        LifecycleTask task = instance.getTasks().get(0);
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> service.completeTask(UUID.randomUUID(), "EMPLOYEE", caller, "user-1", null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("your own");
    }

    @Test
    void completeTask_employeeCompletesNonEmployeeTask_throwsNotOwner() {
        UUID owner = UUID.randomUUID();
        LifecycleWorkflowInstance instance = LifecycleWorkflowInstance.start(
                TENANT_ID, owner, UUID.randomUUID(), LifecycleType.OFFBOARDING, "init");
        instance.addTask(LifecycleTask.create(TENANT_ID, "Revoke system access", null,
                LifecycleAssigneeRole.ADMIN, null, TaskCompletionType.MANUAL));
        LifecycleTask task = instance.getTasks().get(0);
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> service.completeTask(UUID.randomUUID(), "EMPLOYEE", owner, "user-1", null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("your own");
    }

    @Test
    void completeTask_hrManagerCompletesAnyTask_succeeds() {
        UUID owner = UUID.randomUUID();
        LifecycleWorkflowInstance instance = onboardingInstanceWithTwoEmployeeTasks(owner);
        LifecycleTask task = instance.getTasks().get(0);
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        // HR_MANAGER with no X-Employee-ID may still complete another employee's task
        service.completeTask(UUID.randomUUID(), "HR_MANAGER", null, "hr-user", null);

        assertThat(task.getStatus()).isEqualTo(com.andikisha.employee.domain.model.LifecycleTaskStatus.DONE);
    }

    @Test
    void completeTask_adminCompletesAnyTask_succeeds() {
        UUID owner = UUID.randomUUID();
        LifecycleWorkflowInstance instance = onboardingInstanceWithTwoEmployeeTasks(owner);
        LifecycleTask task = instance.getTasks().get(1);
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        service.completeTask(UUID.randomUUID(), "ADMIN", null, "admin-user", null);

        assertThat(task.getStatus()).isEqualTo(com.andikisha.employee.domain.model.LifecycleTaskStatus.DONE);
    }

    // ── 3. Onboarding completion does not change employment status ──────────────

    @Test
    void completingLastOnboardingTask_completesInstance_withoutTouchingEmploymentStatus() {
        UUID owner = UUID.randomUUID();
        LifecycleWorkflowInstance instance = LifecycleWorkflowInstance.start(
                TENANT_ID, owner, UUID.randomUUID(), LifecycleType.ONBOARDING, "init");
        instance.addTask(LifecycleTask.create(TENANT_ID, "Confirm KRA PIN", null,
                LifecycleAssigneeRole.EMPLOYEE, null, TaskCompletionType.MANUAL));
        LifecycleTask task = instance.getTasks().get(0);
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        service.completeTask(UUID.randomUUID(), "EMPLOYEE", owner, "user-1", null);

        assertThat(instance.getStatus()).isEqualTo(LifecycleInstanceStatus.COMPLETED);
        assertThat(instance.getCompletedAt()).isNotNull();
        verify(eventPublisher).publishOnboardingCompleted(any(LifecycleWorkflowInstance.class));

        // Adjustment 1: no EmploymentStatus change, no confirmProbation, employee never even loaded
        verify(employeeService, never()).confirmProbation(any(), any());
        verify(employeeService, never()).terminate(any(), any(), any());
        verify(employeeRepository, never()).findByIdAndTenantId(eq(owner), any());
    }

    // ── 4. Offboarding completion fires exactly one termination path ────────────

    @Test
    void completingLastOffboardingTask_completesInstanceThenTerminatesOnce() {
        UUID employeeId = UUID.randomUUID();
        LifecycleWorkflowInstance instance = LifecycleWorkflowInstance.start(
                TENANT_ID, employeeId, UUID.randomUUID(), LifecycleType.OFFBOARDING, "init");
        instance.addTask(LifecycleTask.create(TENANT_ID, "Return company property", null,
                LifecycleAssigneeRole.HR_OFFICER, null, TaskCompletionType.MANUAL));
        LifecycleTask task = instance.getTasks().get(0);
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        service.completeTask(UUID.randomUUID(), "HR_MANAGER", null, "hr-user", null);

        // The instance ends COMPLETED, never CANCELLED — and it is marked COMPLETED BEFORE
        // terminate() runs (proven by the inOrder below), so terminate()'s open-offboarding
        // cancel sweep can never match it. That the sweep filters to OPEN statuses only
        // (excluding COMPLETED) is asserted structurally in EmployeeServiceTest.
        assertThat(instance.getStatus()).isEqualTo(LifecycleInstanceStatus.COMPLETED);
        assertThat(instance.getStatus()).isNotEqualTo(LifecycleInstanceStatus.CANCELLED);

        var inOrder = org.mockito.Mockito.inOrder(instanceRepository, employeeService);
        inOrder.verify(instanceRepository).save(instance);
        inOrder.verify(employeeService).terminate(employeeId, "Offboarding completed", "hr-user");

        // Exactly one termination via the existing path; archiving now happens INSIDE terminate()
        // (asserted in EmployeeServiceTest), and no offboarding-completed event exists.
        verify(employeeService, times(1)).terminate(employeeId, "Offboarding completed", "hr-user");
        verify(eventPublisher, never()).publishOnboardingCompleted(any());
    }

    // ── 5. Closed instances reject task complete/skip ───────────────────────────

    @Test
    void completeTask_onCancelledInstance_throwsInstanceClosed() {
        LifecycleTask task = closedOffboardingTask(inst -> inst.cancelBySystem("Closed by direct termination"));
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> service.completeTask(UUID.randomUUID(), "HR_MANAGER", null, "hr-user", null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already");
    }

    @Test
    void completeTask_onCompletedInstance_throwsInstanceClosed() {
        LifecycleTask task = closedOffboardingTask(inst -> inst.markCompleted(Instant.now()));
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> service.completeTask(UUID.randomUUID(), "HR_MANAGER", null, "hr-user", null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already");
    }

    @Test
    void skipTask_onCancelledInstance_throwsInstanceClosed() {
        LifecycleTask task = closedOffboardingTask(inst -> inst.cancelBySystem("Closed by direct termination"));
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> service.skipTask(UUID.randomUUID(), "HR_MANAGER", null, "hr-user"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already");
    }

    @Test
    void skipTask_onCompletedInstance_throwsInstanceClosed() {
        LifecycleTask task = closedOffboardingTask(inst -> inst.markCompleted(Instant.now()));
        when(taskRepository.findByIdAndTenantId(any(), eq(TENANT_ID))).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> service.skipTask(UUID.randomUUID(), "HR_MANAGER", null, "hr-user"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already");
    }

    // ── helpers ─────────────────────────────────────────────────────────────────

    private LifecycleWorkflowInstance onboardingInstanceWithTwoEmployeeTasks(UUID employeeId) {
        LifecycleWorkflowInstance instance = LifecycleWorkflowInstance.start(
                TENANT_ID, employeeId, UUID.randomUUID(), LifecycleType.ONBOARDING, "init");
        instance.addTask(LifecycleTask.create(TENANT_ID, "Upload national ID", null,
                LifecycleAssigneeRole.EMPLOYEE, null, TaskCompletionType.DOCUMENT_UPLOAD));
        instance.addTask(LifecycleTask.create(TENANT_ID, "Confirm KRA PIN", null,
                LifecycleAssigneeRole.EMPLOYEE, null, TaskCompletionType.MANUAL));
        return instance;
    }

    /** An offboarding instance with one task, moved to a closed state via {@code closer}. */
    private LifecycleTask closedOffboardingTask(
            java.util.function.Consumer<LifecycleWorkflowInstance> closer) {
        LifecycleWorkflowInstance instance = LifecycleWorkflowInstance.start(
                TENANT_ID, UUID.randomUUID(), UUID.randomUUID(), LifecycleType.OFFBOARDING, "init");
        instance.addTask(LifecycleTask.create(TENANT_ID, "Handover", null,
                LifecycleAssigneeRole.LINE_MANAGER, null, TaskCompletionType.MANUAL));
        closer.accept(instance);
        return instance.getTasks().get(0);
    }
}
