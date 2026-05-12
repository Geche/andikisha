"use client";

import dynamic from "next/dynamic";

const WorkFromHomeComponent = dynamic(
  () => import("@/components/hrm/attendance/work-from-home/workFromHome"),
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

const WfhManagementClient = () => {
  return (
    <><WorkFromHomeComponent/></>
  )
}

export default WfhManagementClient