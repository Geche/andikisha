"use client";

import dynamic from "next/dynamic";

const AttendanceDashboardComponent = dynamic(
  () => import("@/components/mainMenu/attendance-dashboard/attendanceDashboard"),
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

const AttendanceDashboardClient = () => {
  return (
    <><AttendanceDashboardComponent/></>
  )
}

export default AttendanceDashboardClient