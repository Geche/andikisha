"use client";

import dynamic from "next/dynamic";

const EmployeeSalaryComponent = dynamic(
    () => import("@/components/finance-accounts/payrool/employee_salary"),
    { ssr: false }
);

const EmployeeSalaryClient = () => {
    return <EmployeeSalaryComponent />;
};

export default EmployeeSalaryClient;





