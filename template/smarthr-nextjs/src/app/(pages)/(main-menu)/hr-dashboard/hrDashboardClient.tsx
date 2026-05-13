"use client";
import dynamic from "next/dynamic";
import React from "react";
const HrDashboardComponent = dynamic(
  () => import("@/components/mainMenu/hr-dashboard/hrDashboard"),
  { ssr: false },
);
const HrDashboardClient = () => {
  return (
    <>
      <HrDashboardComponent />
    </>
  );
};

export default HrDashboardClient;
