"use client";

import dynamic from "next/dynamic";

const ProbationManagementComponent = dynamic(
  () => import("@/components/hrm/probation-management/probationManagement"),
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
const ProbationManagementClient = () => {
  return (
    <><ProbationManagementComponent/></>
  )
}

export default ProbationManagementClient