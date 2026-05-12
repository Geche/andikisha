"use client";

import dynamic from "next/dynamic";

const AdminDashboardComponent = dynamic(
    () => import("@/components/mainMenu/adminDashboard"),
    { ssr: false }
);

const LayoutHorizontalBoxClient = () => {
    return <AdminDashboardComponent />;
};

export default LayoutHorizontalBoxClient;

