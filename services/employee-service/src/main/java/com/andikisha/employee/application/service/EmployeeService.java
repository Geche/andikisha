package com.andikisha.employee.application.service;

import com.andikisha.common.domain.Money;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.request.CreateEmployeeRequest;
import com.andikisha.employee.application.dto.request.UpdateEmployeeRequest;
import com.andikisha.employee.application.dto.request.UpdateProfileRequest;
import com.andikisha.employee.application.dto.request.UpdateSalaryRequest;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.mapper.EmployeeMapper;
import com.andikisha.employee.application.port.EmployeeEventPublisher;
import com.andikisha.employee.domain.exception.DepartmentNotFoundException;
import com.andikisha.employee.domain.exception.EmployeeNotFoundException;
import com.andikisha.employee.domain.exception.PositionNotFoundException;
import com.andikisha.employee.domain.model.Department;
import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.domain.model.EmployeeHistory;
import com.andikisha.employee.domain.model.EmploymentType;
import com.andikisha.employee.domain.model.Gender;
import com.andikisha.employee.domain.model.Position;
import com.andikisha.employee.domain.model.SalaryStructure;
import com.andikisha.employee.domain.repository.DepartmentRepository;
import com.andikisha.employee.domain.repository.EmployeeHistoryRepository;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import com.andikisha.employee.domain.repository.PositionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;
    private final EmployeeHistoryRepository historyRepository;
    private final EmployeeMapper mapper;
    private final EmployeeEventPublisher eventPublisher;
    private final EmployeeNumberGenerator numberGenerator;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           PositionRepository positionRepository,
                           EmployeeHistoryRepository historyRepository,
                           EmployeeMapper mapper,
                           EmployeeEventPublisher eventPublisher,
                           EmployeeNumberGenerator numberGenerator) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
        this.historyRepository = historyRepository;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
        this.numberGenerator = numberGenerator;
    }

    @Transactional
    public EmployeeDetailResponse create(CreateEmployeeRequest request, String createdBy) {
        String tenantId = TenantContext.requireTenantId();

        if (employeeRepository.existsByTenantIdAndNationalId(tenantId, request.nationalId())) {
            throw new DuplicateResourceException("Employee", "nationalId", request.nationalId());
        }
        if (employeeRepository.existsByTenantIdAndPhoneNumber(tenantId, request.phoneNumber())) {
            throw new DuplicateResourceException("Employee", "phoneNumber", request.phoneNumber());
        }
        if (request.email() != null
                && employeeRepository.existsByTenantIdAndEmail(tenantId, request.email())) {
            throw new DuplicateResourceException("Employee", "email", request.email());
        }
        if (request.kraPin() != null && !request.kraPin().isBlank()
                && employeeRepository.existsByTenantIdAndKraPin(tenantId, request.kraPin().toUpperCase())) {
            throw new DuplicateResourceException("Employee", "kraPin", request.kraPin());
        }

        Department department = null;
        if (request.departmentId() != null) {
            department = departmentRepository.findByIdAndTenantId(request.departmentId(), tenantId)
                    .orElseThrow(() -> new DepartmentNotFoundException(request.departmentId()));
        }

        Position position = null;
        if (request.positionId() != null) {
            position = positionRepository.findByIdAndTenantId(request.positionId(), tenantId)
                    .orElseThrow(() -> new PositionNotFoundException(request.positionId()));
        }

        String currency = request.currency() != null ? request.currency() : "KES";
        SalaryStructure salary = new SalaryStructure(
                Money.of(request.basicSalary(), currency),
                request.housingAllowance() != null ? Money.of(request.housingAllowance(), currency) : null,
                request.transportAllowance() != null ? Money.of(request.transportAllowance(), currency) : null,
                request.medicalAllowance() != null ? Money.of(request.medicalAllowance(), currency) : null,
                request.otherAllowances() != null ? Money.of(request.otherAllowances(), currency) : null,
                request.helbMonthlyDeduction() != null ? Money.of(request.helbMonthlyDeduction(), currency) : null
        );

        EmploymentType empType = parseEnum(EmploymentType.class, request.employmentType());
        LocalDate hireDate = request.hireDate() != null ? request.hireDate() : LocalDate.now();
        String employeeNumber = numberGenerator.generate(tenantId);

        Employee employee = Employee.create(
                tenantId, employeeNumber,
                request.firstName(), request.lastName(),
                request.nationalId(), request.phoneNumber(),
                request.email(), request.kraPin() != null ? request.kraPin().toUpperCase() : null,
                request.nhifNumber(), request.nssfNumber(),
                empType, salary, department, position, hireDate
        );

        if (request.dateOfBirth() != null) {
            employee.updatePersonalDetails(null, null, null, null,
                    request.dateOfBirth(),
                    request.gender() != null ? parseEnum(Gender.class, request.gender()) : null);
        }

        employee = employeeRepository.save(employee);

        historyRepository.save(EmployeeHistory.record(
                tenantId, employee.getId(), "CREATED", null, null, null, createdBy));

        final Employee created = employee;
        publishAfterCommit(() -> eventPublisher.publishEmployeeCreated(created));

        return mapper.toDetailResponse(employee);
    }

    @Transactional
    public EmployeeDetailResponse update(UUID employeeId, UpdateEmployeeRequest request,
                                         String updatedBy) {
        String tenantId = TenantContext.requireTenantId();

        Employee employee = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        employee.updatePersonalDetails(
                request.firstName(), request.lastName(),
                request.phoneNumber(), request.email(),
                request.dateOfBirth(),
                request.gender() != null ? parseEnum(Gender.class, request.gender()) : null
        );

        if (request.departmentId() != null
                && !request.departmentId().equals(
                employee.getDepartment() != null ? employee.getDepartment().getId() : null)) {
            Department newDept = departmentRepository.findByIdAndTenantId(
                            request.departmentId(), tenantId)
                    .orElseThrow(() -> new DepartmentNotFoundException(request.departmentId()));
            String oldDept = employee.getDepartment() != null
                    ? employee.getDepartment().getName() : "none";
            employee.transferDepartment(newDept);
            historyRepository.save(EmployeeHistory.record(
                    tenantId, employeeId, "TRANSFER", "department",
                    oldDept, newDept.getName(), updatedBy));
        }

        if (request.positionId() != null
                && !request.positionId().equals(
                employee.getPosition() != null ? employee.getPosition().getId() : null)) {
            Position newPos = positionRepository.findByIdAndTenantId(request.positionId(), tenantId)
                    .orElseThrow(() -> new PositionNotFoundException(request.positionId()));
            String oldPos = employee.getPosition() != null ? employee.getPosition().getTitle() : "none";
            employee.assignPosition(newPos);
            historyRepository.save(EmployeeHistory.record(
                    tenantId, employeeId, "POSITION_CHANGE", "position",
                    oldPos, newPos.getTitle(), updatedBy));
        }

        if (request.bankName() != null) {
            // Tier-2 audit: bank details
            if (!java.util.Objects.equals(request.bankName(), employee.getBankName())) {
                historyRepository.save(EmployeeHistory.record(tenantId, employeeId,
                        "FIELD_CHANGE", "bankName",
                        employee.getBankName(), request.bankName(), updatedBy));
            }
            if (!java.util.Objects.equals(request.bankAccountNumber(), employee.getBankAccountNumber())) {
                historyRepository.save(EmployeeHistory.record(tenantId, employeeId,
                        "FIELD_CHANGE", "bankAccountNumber",
                        maskAccount(employee.getBankAccountNumber()),
                        maskAccount(request.bankAccountNumber()),
                        updatedBy));
            }
            employee.updateBankDetails(
                    request.bankName(), request.bankAccountNumber(), request.bankBranch());
        }

        if (request.kraPin() != null || request.nhifNumber() != null || request.nssfNumber() != null) {
            // Tier-2 audit: statutory IDs
            if (request.kraPin() != null && !request.kraPin().equals(employee.getKraPin())) {
                historyRepository.save(EmployeeHistory.record(tenantId, employeeId,
                        "FIELD_CHANGE", "kraPin", employee.getKraPin(), request.kraPin(), updatedBy));
            }
            if (request.nhifNumber() != null && !request.nhifNumber().equals(employee.getNhifNumber())) {
                historyRepository.save(EmployeeHistory.record(tenantId, employeeId,
                        "FIELD_CHANGE", "nhifNumber", employee.getNhifNumber(), request.nhifNumber(), updatedBy));
            }
            if (request.nssfNumber() != null && !request.nssfNumber().equals(employee.getNssfNumber())) {
                historyRepository.save(EmployeeHistory.record(tenantId, employeeId,
                        "FIELD_CHANGE", "nssfNumber", employee.getNssfNumber(), request.nssfNumber(), updatedBy));
            }
            employee.updateStatutoryIds(request.kraPin(), request.nhifNumber(), request.nssfNumber());
        }

        employee = employeeRepository.save(employee);
        final Employee updated = employee;
        publishAfterCommit(() -> eventPublisher.publishEmployeeUpdated(updated, updatedBy));

        return mapper.toDetailResponse(employee);
    }

    @Transactional
    public EmployeeDetailResponse updateSalary(UUID employeeId, UpdateSalaryRequest request,
                                               String changedBy) {
        String tenantId = TenantContext.requireTenantId();

        Employee employee = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        BigDecimal oldSalary = employee.getSalaryStructure().getBasicSalary().getAmount();
        String currency = employee.getSalaryStructure().getBasicSalary().getCurrency();

        SalaryStructure newSalary = new SalaryStructure(
                Money.of(request.basicSalary(), currency),
                request.housingAllowance() != null ? Money.of(request.housingAllowance(), currency) : null,
                request.transportAllowance() != null ? Money.of(request.transportAllowance(), currency) : null,
                request.medicalAllowance() != null ? Money.of(request.medicalAllowance(), currency) : null,
                request.otherAllowances() != null ? Money.of(request.otherAllowances(), currency) : null,
                request.helbMonthlyDeduction() != null ? Money.of(request.helbMonthlyDeduction(), currency) : null
        );

        employee.updateSalary(newSalary);
        employee = employeeRepository.save(employee);

        historyRepository.save(EmployeeHistory.record(
                tenantId, employeeId, "SALARY_CHANGE", "basicSalary",
                oldSalary.toPlainString(), request.basicSalary().toPlainString(), changedBy));

        final Employee salaryUpdated = employee;
        final BigDecimal newBasicSalary = request.basicSalary();
        publishAfterCommit(() -> eventPublisher.publishSalaryChanged(salaryUpdated, oldSalary, newBasicSalary, changedBy));

        return mapper.toDetailResponse(employee);
    }

    @Transactional
    public void terminate(UUID employeeId, String reason, String terminatedBy) {
        String tenantId = TenantContext.requireTenantId();

        Employee employee = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        String previousStatus = employee.getStatus().name();
        employee.terminate(reason);
        employeeRepository.save(employee);

        historyRepository.save(EmployeeHistory.record(
                tenantId, employeeId, "TERMINATED", "status",
                previousStatus, "TERMINATED", terminatedBy));

        final Employee terminated = employee;
        publishAfterCommit(() -> eventPublisher.publishEmployeeTerminated(terminated, reason, terminatedBy));
    }

    @Transactional
    public EmployeeDetailResponse confirmProbation(UUID employeeId, String confirmedBy) {
        String tenantId = TenantContext.requireTenantId();

        Employee employee = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));

        employee.confirmProbation();
        employee = employeeRepository.save(employee);

        historyRepository.save(EmployeeHistory.record(
                tenantId, employeeId, "PROBATION_CONFIRMED", "status",
                "ON_PROBATION", "ACTIVE", confirmedBy));

        return mapper.toDetailResponse(employee);
    }

    private static <E extends Enum<E>> E parseEnum(Class<E> type, String value) {
        try {
            return Enum.valueOf(type, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid value '" + value + "' for " + type.getSimpleName());
        }
    }

    /**
     * Defers event publication until after the current transaction commits.
     * If no transaction is active, publishes immediately.
     */
    @Transactional
    public EmployeeDetailResponse selfUpdateProfile(UUID employeeId, UpdateProfileRequest request) {
        String tenantId = TenantContext.requireTenantId();
        Employee employee = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));
        employee.updateTier1Profile(
                request.phoneNumber(),
                request.personalEmail(),
                request.emergencyContactName(),
                request.emergencyContactPhone());
        employee = employeeRepository.save(employee);
        final Employee saved = employee;
        publishAfterCommit(() -> eventPublisher.publishEmployeeUpdated(saved, employeeId.toString()));
        return mapper.toDetailResponse(employee);
    }

    @Transactional
    public EmployeeDetailResponse updateAvatarUrl(UUID employeeId, String avatarUrl) {
        String tenantId = TenantContext.requireTenantId();
        Employee employee = employeeRepository.findByIdAndTenantId(employeeId, tenantId)
                .orElseThrow(() -> new EmployeeNotFoundException(employeeId));
        employee.updateAvatarUrl(avatarUrl);
        return mapper.toDetailResponse(employeeRepository.save(employee));
    }

    private static String maskAccount(String acct) {
        if (acct == null || acct.isBlank()) return null;
        return "****" + (acct.length() > 4 ? acct.substring(acct.length() - 4) : acct);
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
