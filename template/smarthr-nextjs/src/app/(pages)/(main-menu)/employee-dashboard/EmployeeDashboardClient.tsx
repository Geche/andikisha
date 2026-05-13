"use client";

import dynamic from "next/dynamic";

const EmployeeDashboardComponent = dynamic(
    () => import("@/components/mainMenu/employeeDashboard/employee-dashboard"),
    { ssr: false }
);

const EmployeeDashboardClient = () => {
    return <EmployeeDashboardComponent />;
};

export default EmployeeDashboardClient;





