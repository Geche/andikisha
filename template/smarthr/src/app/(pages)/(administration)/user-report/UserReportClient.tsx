"use client";

import dynamic from "next/dynamic";

const UserReportsComponent = dynamic(
    () => import("@/components/administration/reports/userreports"),
    { ssr: false }
);

const UserReportClient = () => {
    return <UserReportsComponent />;
};

export default UserReportClient;





