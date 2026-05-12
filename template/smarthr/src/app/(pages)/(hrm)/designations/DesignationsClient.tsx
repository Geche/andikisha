"use client";

import dynamic from "next/dynamic";

const DesignationsComponent = dynamic(
    () => import("@/components/hrm/employees/designations"),
    { ssr: false }
);

const DesignationsClient = () => {
    return <DesignationsComponent />;
};

export default DesignationsClient;





