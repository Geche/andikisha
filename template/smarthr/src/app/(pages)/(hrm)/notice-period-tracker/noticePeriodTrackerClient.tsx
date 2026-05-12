"use client";

import dynamic from "next/dynamic";

const NoticePeriodTrackerComponent = dynamic(
  () => import("@/components/hrm/notice-period-tracker/noticePeriodTracker"),
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

const NoticePeriodTrackerClient = () => {
  return (
    <><NoticePeriodTrackerComponent/></>
  )
}

export default NoticePeriodTrackerClient