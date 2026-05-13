"use client";

import dynamic from "next/dynamic";

const ShiftSwapRequestsComponent = dynamic(
  () => import("@/components/hrm/attendance/shift-swap-requests/shiftSwapRequests"),
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

const ShiftSwapRequestsClient = () => {
  return (
    <><ShiftSwapRequestsComponent/></>
  )
}

export default ShiftSwapRequestsClient