"use client";

import dynamic from "next/dynamic";

const HelpDeskDashboardComponent = dynamic(
  () => import("@/components/mainMenu/help-desk-dashboard/helpDeskDashboard"),
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

const HelpDeskDashboardClient = () => {
  return (
    <><HelpDeskDashboardComponent/></>
  )
}

export default HelpDeskDashboardClient