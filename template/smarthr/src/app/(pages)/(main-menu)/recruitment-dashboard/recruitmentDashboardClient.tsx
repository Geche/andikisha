"use client";

import dynamic from "next/dynamic";

const RecruitmentDashboardComponent = dynamic(
  () => import("@/components/mainMenu/recruitment-dashboard/recruitmentDashboard"),
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
const RecruitmentDashboardClient = () => {
  return (
    <><RecruitmentDashboardComponent/></>
  )
}

export default RecruitmentDashboardClient