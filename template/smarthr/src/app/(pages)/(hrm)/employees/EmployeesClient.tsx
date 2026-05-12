"use client";

import dynamic from "next/dynamic";

const EmployeeListComponent = dynamic(
    () => import("@/components/hrm/employees/employeesList"),
    { ssr: false }
);

const EmployeesClient = () => {
    return <EmployeeListComponent />;
};

export default EmployeesClient;





