package com.andikisha.employee.application.port;

import com.andikisha.employee.domain.model.Employee;
import java.math.BigDecimal;

public interface EmployeeEventPublisher {

    void publishEmployeeCreated(Employee employee);

    void publishEmployeeUpdated(Employee employee, String updatedBy);

    void publishEmployeeTerminated(Employee employee, String reason, String terminatedBy);

    void publishSalaryChanged(Employee employee, BigDecimal oldSalary,
                              BigDecimal newSalary, String changedBy);
}
