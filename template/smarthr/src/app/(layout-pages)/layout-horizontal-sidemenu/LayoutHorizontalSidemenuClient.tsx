"use client";

import dynamic from "next/dynamic";

const AdminDashboardComponent = dynamic(
    () => import("@/components/mainMenu/adminDashboard"),
    { ssr: false }
);

const LayoutHorizontalSidemenuClient = () => {
    return <AdminDashboardComponent />;
};

export default LayoutHorizontalSidemenuClient;

