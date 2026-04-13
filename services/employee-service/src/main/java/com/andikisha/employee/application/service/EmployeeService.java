package com.andikisha.employee.application.service;

import com.andikisha.common.domain.Money;
import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.request.CreateEmployeeRequest;
import com.andikisha.employee.application.dto.request.UpdateEmployeeRequest;
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
                request.otherAllowances() != null ? Money.of(request.otherAllowances(), currency) : null
        );

        EmploymentType empType = parseEnum(EmploymentType.class, request.employmentType());
        LocalDate hireDate = request.hireDate() != null ? request.hireDate() : LocalDate.now();
        String employeeNumber = numberGenerator.generate(tenantId);

        Employee employee = Employee.create(
                tenantId, employeeNumber,
                request.firstName(), request.lastName(),
                request.nationalId(), request.phoneNumber(),
                request.email(), request.kraPin(),
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

        eventPublisher.publishEmployeeCreated(employee);

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

        if (request.bankName() != null) {
            employee.updateBankDetails(
                    request.bankName(), request.bankAccountNumber(), request.bankBranch());
        }

        employee = employeeRepository.save(employee);
        eventPublisher.publishEmployeeUpdated(employee, updatedBy);

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
                request.otherAllowances() != null ? Money.of(request.otherAllowances(), currency) : null
        );

        employee.updateSalary(newSalary);
        employee = employeeRepository.save(employee);

        historyRepository.save(EmployeeHistory.record(
                tenantId, employeeId, "SALARY_CHANGE", "basicSalary",
                oldSalary.toPlainString(), request.basicSalary().toPlainString(), changedBy));

        eventPublisher.publishSalaryChanged(employee, oldSalary, request.basicSalary(), changedBy);

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

        eventPublisher.publishEmployeeTerminated(employee, reason, terminatedBy);
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
}
