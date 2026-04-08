package com.andikisha.employee.application.mapper;

import com.andikisha.employee.application.dto.response.DepartmentResponse;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.dto.response.EmployeeResponse;
import com.andikisha.employee.application.dto.response.EmployeeSummaryResponse;
import com.andikisha.employee.application.dto.response.PositionResponse;
import com.andikisha.employee.domain.model.Department;
import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.domain.model.Position;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "departmentId",   source = "department.id")
    @Mapping(target = "departmentName", source = "department.name")
    @Mapping(target = "positionId",     source = "position.id")
    @Mapping(target = "positionTitle",  source = "position.title")
    @Mapping(target = "employmentType", expression = "java(e.getEmploymentType().name())")
    @Mapping(target = "status",         expression = "java(e.getStatus().name())")
    @Mapping(target = "basicSalary",        source = "salaryStructure.basicSalary.amount")
    @Mapping(target = "housingAllowance",   source = "salaryStructure.housingAllowance.amount")
    @Mapping(target = "transportAllowance", source = "salaryStructure.transportAllowance.amount")
    @Mapping(target = "medicalAllowance",   source = "salaryStructure.medicalAllowance.amount")
    @Mapping(target = "otherAllowances",    source = "salaryStructure.otherAllowances.amount")
    @Mapping(target = "grossPay",   expression = "java(e.getSalaryStructure().grossPay().getAmount())")
    @Mapping(target = "currency",   source = "salaryStructure.basicSalary.currency")
    @Mapping(target = "gender",     expression = "java(e.getGender() != null ? e.getGender().name() : null)")
    EmployeeResponse toResponse(Employee e);

    @Mapping(target = "departmentId",   source = "department.id")
    @Mapping(target = "departmentName", source = "department.name")
    @Mapping(target = "positionId",     source = "position.id")
    @Mapping(target = "positionTitle",  source = "position.title")
    @Mapping(target = "employmentType", expression = "java(e.getEmploymentType().name())")
    @Mapping(target = "status",         expression = "java(e.getStatus().name())")
    @Mapping(target = "basicSalary",        source = "salaryStructure.basicSalary.amount")
    @Mapping(target = "housingAllowance",   source = "salaryStructure.housingAllowance.amount")
    @Mapping(target = "transportAllowance", source = "salaryStructure.transportAllowance.amount")
    @Mapping(target = "medicalAllowance",   source = "salaryStructure.medicalAllowance.amount")
    @Mapping(target = "otherAllowances",    source = "salaryStructure.otherAllowances.amount")
    @Mapping(target = "grossPay",   expression = "java(e.getSalaryStructure().grossPay().getAmount())")
    @Mapping(target = "currency",   source = "salaryStructure.basicSalary.currency")
    @Mapping(target = "gender",     expression = "java(e.getGender() != null ? e.getGender().name() : null)")
    EmployeeDetailResponse toDetailResponse(Employee e);

    @Mapping(target = "departmentName", source = "department.name")
    @Mapping(target = "positionTitle",  source = "position.title")
    @Mapping(target = "status", expression = "java(e.getStatus().name())")
    EmployeeSummaryResponse toSummary(Employee e);

    @Mapping(target = "parentId",      source = "parent.id")
    @Mapping(target = "employeeCount", ignore = true)
    DepartmentResponse toResponse(Department d);

    PositionResponse toResponse(Position p);
}
