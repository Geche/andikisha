"use client";

import dynamic from "next/dynamic";

const PolicyComponent = dynamic(
    () => import("@/components/hrm/employees/policy"),
    { ssr: false }
);

const PolicyClient = () => {
    return <PolicyComponent />;
};

export default PolicyClient;





