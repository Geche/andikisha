package com.andikisha.employee.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.domain.Money;
import com.andikisha.common.exception.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Entity
@Table(name = "employees",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"tenant_id", "national_id"}),
                @UniqueConstraint(columnNames = {"tenant_id", "employee_number"}),
                @UniqueConstraint(columnNames = {"tenant_id", "phone_number"})
        })
public class Employee extends BaseEntity {

    // Getters
    @Column(name = "employee_number", nullable = false, length = 20)
    private String employeeNumber;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "national_id", nullable = false, length = 20)
    private String nationalId;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(length = 255)
    private String email;

    @Column(name = "kra_pin", nullable = false, length = 20)
    private String kraPin;

    @Column(name = "nhif_number", nullable = false, length = 20)
    private String nhifNumber;

    @Column(name = "nssf_number", nullable = false, length = 20)
    private String nssfNumber;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    @Column(name = "reporting_to")
    private UUID reportingTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 20)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EmploymentStatus status;

    @Embedded
    private SalaryStructure salaryStructure;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "probation_end_date")
    private LocalDate probationEndDate;

    @Column(name = "termination_date")
    private LocalDate terminationDate;

    @Column(name = "termination_reason")
    private String terminationReason;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Column(name = "bank_branch", length = 100)
    private String bankBranch;

    protected Employee() {}

    public static Employee create(String tenantId, String employeeNumber,
                                  String firstName, String lastName,
                                  String nationalId, String phoneNumber,
                                  String email, String kraPin,
                                  String nhifNumber, String nssfNumber,
                                  EmploymentType employmentType,
                                  SalaryStructure salaryStructure,
                                  Department department, Position position,
                                  LocalDate hireDate) {
        Employee emp = new Employee();
        emp.setTenantId(tenantId);
        emp.employeeNumber = employeeNumber;
        emp.firstName = firstName;
        emp.lastName = lastName;
        emp.nationalId = nationalId;
        emp.phoneNumber = phoneNumber;
        emp.email = email != null ? email.toLowerCase().trim() : null;
        emp.kraPin = kraPin;
        emp.nhifNumber = nhifNumber;
        emp.nssfNumber = nssfNumber;
        emp.employmentType = employmentType;
        emp.salaryStructure = salaryStructure;
        emp.department = department;
        emp.position = position;
        emp.hireDate = hireDate;
        emp.status = EmploymentStatus.ON_PROBATION;
        emp.probationEndDate = hireDate.plusMonths(3);
        return emp;
    }

    public void updatePersonalDetails(String firstName, String lastName,
                                      String phoneNumber, String email,
                                      LocalDate dateOfBirth, Gender gender) {
        if (firstName != null && !firstName.isBlank()) this.firstName = firstName;
        if (lastName != null && !lastName.isBlank()) this.lastName = lastName;
        if (phoneNumber != null && !phoneNumber.isBlank()) this.phoneNumber = phoneNumber;
        if (email != null) this.email = email.toLowerCase().trim();
        if (dateOfBirth != null) this.dateOfBirth = dateOfBirth;
        if (gender != null) this.gender = gender;
    }

    public void updateBankDetails(String bankName, String accountNumber, String branch) {
        this.bankName = bankName;
        this.bankAccountNumber = accountNumber;
        this.bankBranch = branch;
    }

    public void updateSalary(SalaryStructure newSalary) {
        if (this.status == EmploymentStatus.TERMINATED) {
            throw new BusinessRuleException("Cannot update salary for a terminated employee");
        }
        if (!newSalary.getBasicSalary().isPositive()) {
            throw new BusinessRuleException("Basic salary must be positive");
        }
        this.salaryStructure = newSalary;
    }

    public void transferDepartment(Department newDepartment) {
        if (this.status == EmploymentStatus.TERMINATED) {
            throw new BusinessRuleException("Cannot transfer a terminated employee");
        }
        this.department = newDepartment;
    }

    public void promote(Position newPosition, SalaryStructure newSalary) {
        if (this.status == EmploymentStatus.TERMINATED) {
            throw new BusinessRuleException("Cannot promote a terminated employee");
        }
        this.position = newPosition;
        this.salaryStructure = newSalary;
    }

    public void confirmProbation() {
        if (this.status != EmploymentStatus.ON_PROBATION) {
            throw new BusinessRuleException("Employee is not on probation");
        }
        this.status = EmploymentStatus.ACTIVE;
        this.probationEndDate = null;
    }

    public void suspend(String reason) {
        if (this.status == EmploymentStatus.TERMINATED) {
            throw new BusinessRuleException("Cannot suspend a terminated employee");
        }
        this.status = EmploymentStatus.SUSPENDED;
    }

    public void reinstate() {
        if (this.status != EmploymentStatus.SUSPENDED) {
            throw new BusinessRuleException("Employee is not suspended");
        }
        this.status = EmploymentStatus.ACTIVE;
    }

    public void markOnLeave() {
        this.status = EmploymentStatus.ON_LEAVE;
    }

    public void returnFromLeave() {
        if (this.status != EmploymentStatus.ON_LEAVE) {
            throw new BusinessRuleException("Employee is not on leave");
        }
        this.status = EmploymentStatus.ACTIVE;
    }

    public void terminate(String reason) {
        if (this.status == EmploymentStatus.TERMINATED) {
            throw new BusinessRuleException("Employee is already terminated");
        }
        this.status = EmploymentStatus.TERMINATED;
        this.terminationDate = LocalDate.now();
        this.terminationReason = reason;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

}