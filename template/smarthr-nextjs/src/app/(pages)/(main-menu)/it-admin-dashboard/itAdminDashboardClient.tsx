"use client";

import dynamic from "next/dynamic";

const ItAdminDashboardComponent = dynamic(
  () => import("@/components/mainMenu/it-admin-dashboard/itAdminDashboard"),
  {
    ssr: false,
    loading: () => (
      <div>
        <div id="global-loader">
          <div className="whirly-loader"> </div>
        </div>
      </div>
    ),
  },
);
const ItAdminDashboardClient = () => {
  return (
    <><ItAdminDashboardComponent/></>
  )
}

export default ItAdminDashboardClient