"use client";

import dynamic from "next/dynamic";

const EmployeesGridComponent = dynamic(
    () => import("@/components/hrm/employees/employeesGrid"),
    { ssr: false }
);

const EmployeesGridClient = () => {
    return <EmployeesGridComponent />;
};

export default EmployeesGridClient;





