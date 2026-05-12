"use client";

import dynamic from "next/dynamic";

const AdminDashboardComponent = dynamic(
    () => import("@/components/mainMenu/adminDashboard"),
    { ssr: false }
);

const LayoutDarkClient = () => {
    return <AdminDashboardComponent />;
};

export default LayoutDarkClient;

