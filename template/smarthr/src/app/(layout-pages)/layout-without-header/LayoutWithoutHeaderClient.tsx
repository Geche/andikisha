"use client";

import dynamic from "next/dynamic";

const AdminDashboardComponent = dynamic(
    () => import("@/components/mainMenu/adminDashboard"),
    { ssr: false }
);

const LayoutWithoutHeaderClient = () => {
    return <AdminDashboardComponent />;
};

export default LayoutWithoutHeaderClient;

