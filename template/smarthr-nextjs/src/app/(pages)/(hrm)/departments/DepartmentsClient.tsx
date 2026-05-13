"use client";

import dynamic from "next/dynamic";

const DepartmentComponent = dynamic(
    () => import("@/components/hrm/employees/deparment"),
    { ssr: false }
);

const DepartmentsClient = () => {
    return <DepartmentComponent />;
};

export default DepartmentsClient;





