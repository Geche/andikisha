"use client";

import dynamic from "next/dynamic";

const EmployeeDetailsComponent = dynamic(
    () => import("@/components/hrm/employees/employeedetails"),
    { ssr: false }
);

const EmployeeDetailsClient = () => {
    return <EmployeeDetailsComponent />;
};

export default EmployeeDetailsClient;





