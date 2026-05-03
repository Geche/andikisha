package com.andikisha.employee.application.mapper;

import com.andikisha.common.domain.Money;
import com.andikisha.employee.application.dto.response.DepartmentResponse;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.dto.response.EmployeeResponse;
import com.andikisha.employee.application.dto.response.EmployeeSummaryResponse;
import com.andikisha.employee.application.dto.response.PositionResponse;
import com.andikisha.employee.domain.model.Department;
import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.domain.model.Position;
import com.andikisha.employee.domain.model.SalaryStructure;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T01:54:52+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class EmployeeMapperImpl implements EmployeeMapper {

    @Override
    public EmployeeResponse toResponse(Employee e) {
        if ( e == null ) {
            return null;
        }

        UUID departmentId = null;
        String departmentName = null;
        UUID positionId = null;
        String positionTitle = null;
        BigDecimal basicSalary = null;
        BigDecimal housingAllowance = null;
        BigDecimal transportAllowance = null;
        BigDecimal medicalAllowance = null;
        BigDecimal otherAllowances = null;
        String currency = null;
        UUID id = null;
        String tenantId = null;
        String employeeNumber = null;
        String firstName = null;
        String lastName = null;
        String phoneNumber = null;
        String email = null;
        LocalDate dateOfBirth = null;
        LocalDate hireDate = null;
        LocalDate probationEndDate = null;
        LocalDate terminationDate = null;
        String bankName = null;
        String bankAccountNumber = null;
        LocalDateTime createdAt = null;

        departmentId = eDepartmentId( e );
        departmentName = eDepartmentName( e );
        positionId = ePositionId( e );
        positionTitle = ePositionTitle( e );
        basicSalary = eSalaryStructureBasicSalaryAmount( e );
        housingAllowance = eSalaryStructureHousingAllowanceAmount( e );
        transportAllowance = eSalaryStructureTransportAllowanceAmount( e );
        medicalAllowance = eSalaryStructureMedicalAllowanceAmount( e );
        otherAllowances = eSalaryStructureOtherAllowancesAmount( e );
        currency = eSalaryStructureBasicSalaryCurrency( e );
        id = e.getId();
        tenantId = e.getTenantId();
        employeeNumber = e.getEmployeeNumber();
        firstName = e.getFirstName();
        lastName = e.getLastName();
        phoneNumber = e.getPhoneNumber();
        email = e.getEmail();
        dateOfBirth = e.getDateOfBirth();
        hireDate = e.getHireDate();
        probationEndDate = e.getProbationEndDate();
        terminationDate = e.getTerminationDate();
        bankName = e.getBankName();
        bankAccountNumber = e.getBankAccountNumber();
        createdAt = e.getCreatedAt();

        String employmentType = e.getEmploymentType().name();
        String status = e.getStatus().name();
        BigDecimal grossPay = e.getSalaryStructure().grossPay().getAmount();
        String gender = e.getGender() != null ? e.getGender().name() : null;

        EmployeeResponse employeeResponse = new EmployeeResponse( id, tenantId, employeeNumber, firstName, lastName, phoneNumber, email, dateOfBirth, gender, departmentId, departmentName, positionId, positionTitle, employmentType, status, basicSalary, housingAllowance, transportAllowance, medicalAllowance, otherAllowances, grossPay, currency, hireDate, probationEndDate, terminationDate, bankName, bankAccountNumber, createdAt );

        return employeeResponse;
    }

    @Override
    public EmployeeDetailResponse toDetailResponse(Employee e) {
        if ( e == null ) {
            return null;
        }

        UUID departmentId = null;
        String departmentName = null;
        UUID positionId = null;
        String positionTitle = null;
        BigDecimal basicSalary = null;
        BigDecimal housingAllowance = null;
        BigDecimal transportAllowance = null;
        BigDecimal medicalAllowance = null;
        BigDecimal otherAllowances = null;
        String currency = null;
        UUID id = null;
        String tenantId = null;
        String employeeNumber = null;
        String firstName = null;
        String lastName = null;
        String nationalId = null;
        String phoneNumber = null;
        String email = null;
        String kraPin = null;
        String nhifNumber = null;
        String nssfNumber = null;
        LocalDate dateOfBirth = null;
        LocalDate hireDate = null;
        LocalDate probationEndDate = null;
        LocalDate terminationDate = null;
        String bankName = null;
        String bankAccountNumber = null;
        LocalDateTime createdAt = null;

        departmentId = eDepartmentId( e );
        departmentName = eDepartmentName( e );
        positionId = ePositionId( e );
        positionTitle = ePositionTitle( e );
        basicSalary = eSalaryStructureBasicSalaryAmount( e );
        housingAllowance = eSalaryStructureHousingAllowanceAmount( e );
        transportAllowance = eSalaryStructureTransportAllowanceAmount( e );
        medicalAllowance = eSalaryStructureMedicalAllowanceAmount( e );
        otherAllowances = eSalaryStructureOtherAllowancesAmount( e );
        currency = eSalaryStructureBasicSalaryCurrency( e );
        id = e.getId();
        tenantId = e.getTenantId();
        employeeNumber = e.getEmployeeNumber();
        firstName = e.getFirstName();
        lastName = e.getLastName();
        nationalId = e.getNationalId();
        phoneNumber = e.getPhoneNumber();
        email = e.getEmail();
        kraPin = e.getKraPin();
        nhifNumber = e.getNhifNumber();
        nssfNumber = e.getNssfNumber();
        dateOfBirth = e.getDateOfBirth();
        hireDate = e.getHireDate();
        probationEndDate = e.getProbationEndDate();
        terminationDate = e.getTerminationDate();
        bankName = e.getBankName();
        bankAccountNumber = e.getBankAccountNumber();
        createdAt = e.getCreatedAt();

        String employmentType = e.getEmploymentType().name();
        String status = e.getStatus().name();
        BigDecimal grossPay = e.getSalaryStructure().grossPay().getAmount();
        String gender = e.getGender() != null ? e.getGender().name() : null;

        EmployeeDetailResponse employeeDetailResponse = new EmployeeDetailResponse( id, tenantId, employeeNumber, firstName, lastName, nationalId, phoneNumber, email, kraPin, nhifNumber, nssfNumber, dateOfBirth, gender, departmentId, departmentName, positionId, positionTitle, employmentType, status, basicSalary, housingAllowance, transportAllowance, medicalAllowance, otherAllowances, grossPay, currency, hireDate, probationEndDate, terminationDate, bankName, bankAccountNumber, createdAt );

        return employeeDetailResponse;
    }

    @Override
    public EmployeeSummaryResponse toSummary(Employee e) {
        if ( e == null ) {
            return null;
        }

        String departmentName = null;
        String positionTitle = null;
        UUID id = null;
        String employeeNumber = null;
        String firstName = null;
        String lastName = null;
        String phoneNumber = null;
        LocalDate hireDate = null;

        departmentName = eDepartmentName( e );
        positionTitle = ePositionTitle( e );
        id = e.getId();
        employeeNumber = e.getEmployeeNumber();
        firstName = e.getFirstName();
        lastName = e.getLastName();
        phoneNumber = e.getPhoneNumber();
        hireDate = e.getHireDate();

        String status = e.getStatus().name();

        EmployeeSummaryResponse employeeSummaryResponse = new EmployeeSummaryResponse( id, employeeNumber, firstName, lastName, phoneNumber, departmentName, positionTitle, status, hireDate );

        return employeeSummaryResponse;
    }

    @Override
    public DepartmentResponse toResponse(Department d) {
        if ( d == null ) {
            return null;
        }

        UUID parentId = null;
        UUID id = null;
        String name = null;
        String description = null;
        boolean active = false;

        parentId = dParentId( d );
        id = d.getId();
        name = d.getName();
        description = d.getDescription();
        active = d.isActive();

        long employeeCount = 0L;

        DepartmentResponse departmentResponse = new DepartmentResponse( id, name, description, parentId, employeeCount, active );

        return departmentResponse;
    }

    @Override
    public PositionResponse toResponse(Position p) {
        if ( p == null ) {
            return null;
        }

        UUID id = null;
        String title = null;
        String description = null;
        String gradeLevel = null;
        boolean active = false;

        id = p.getId();
        title = p.getTitle();
        description = p.getDescription();
        gradeLevel = p.getGradeLevel();
        active = p.isActive();

        PositionResponse positionResponse = new PositionResponse( id, title, description, gradeLevel, active );

        return positionResponse;
    }

    private UUID eDepartmentId(Employee employee) {
        Department department = employee.getDepartment();
        if ( department == null ) {
            return null;
        }
        return department.getId();
    }

    private String eDepartmentName(Employee employee) {
        Department department = employee.getDepartment();
        if ( department == null ) {
            return null;
        }
        return department.getName();
    }

    private UUID ePositionId(Employee employee) {
        Position position = employee.getPosition();
        if ( position == null ) {
            return null;
        }
        return position.getId();
    }

    private String ePositionTitle(Employee employee) {
        Position position = employee.getPosition();
        if ( position == null ) {
            return null;
        }
        return position.getTitle();
    }

    private BigDecimal eSalaryStructureBasicSalaryAmount(Employee employee) {
        SalaryStructure salaryStructure = employee.getSalaryStructure();
        if ( salaryStructure == null ) {
            return null;
        }
        Money basicSalary = salaryStructure.getBasicSalary();
        if ( basicSalary == null ) {
            return null;
        }
        return basicSalary.getAmount();
    }

    private BigDecimal eSalaryStructureHousingAllowanceAmount(Employee employee) {
        SalaryStructure salaryStructure = employee.getSalaryStructure();
        if ( salaryStructure == null ) {
            return null;
        }
        Money housingAllowance = salaryStructure.getHousingAllowance();
        if ( housingAllowance == null ) {
            return null;
        }
        return housingAllowance.getAmount();
    }

    private BigDecimal eSalaryStructureTransportAllowanceAmount(Employee employee) {
        SalaryStructure salaryStructure = employee.getSalaryStructure();
        if ( salaryStructure == null ) {
            return null;
        }
        Money transportAllowance = salaryStructure.getTransportAllowance();
        if ( transportAllowance == null ) {
            return null;
        }
        return transportAllowance.getAmount();
    }

    private BigDecimal eSalaryStructureMedicalAllowanceAmount(Employee employee) {
        SalaryStructure salaryStructure = employee.getSalaryStructure();
        if ( salaryStructure == null ) {
            return null;
        }
        Money medicalAllowance = salaryStructure.getMedicalAllowance();
        if ( medicalAllowance == null ) {
            return null;
        }
        return medicalAllowance.getAmount();
    }

    private BigDecimal eSalaryStructureOtherAllowancesAmount(Employee employee) {
        SalaryStructure salaryStructure = employee.getSalaryStructure();
        if ( salaryStructure == null ) {
            return null;
        }
        Money otherAllowances = salaryStructure.getOtherAllowances();
        if ( otherAllowances == null ) {
            return null;
        }
        return otherAllowances.getAmount();
    }

    private String eSalaryStructureBasicSalaryCurrency(Employee employee) {
        SalaryStructure salaryStructure = employee.getSalaryStructure();
        if ( salaryStructure == null ) {
            return null;
        }
        Money basicSalary = salaryStructure.getBasicSalary();
        if ( basicSalary == null ) {
            return null;
        }
        return basicSalary.getCurrency();
    }

    private UUID dParentId(Department department) {
        Department parent = department.getParent();
        if ( parent == null ) {
            return null;
        }
        return parent.getId();
    }
}
