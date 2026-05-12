"use client";

import dynamic from "next/dynamic";

const AdminDashboardComponent = dynamic(
    () => import("@/components/mainMenu/adminDashboard"),
    { ssr: false }
);

const LayoutDetachedClient = () => {
    return <AdminDashboardComponent />;
};

export default LayoutDetachedClient;

