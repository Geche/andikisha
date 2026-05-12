"use client";

import dynamic from "next/dynamic";

const LearningAnalyticsComponent = dynamic(
  () => import("@/components/training/learning-analytics/learningAnalytics"),
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
const LearningAnalyticsClient = () => {
  return (
    <><LearningAnalyticsComponent/></>
  )
}

export default LearningAnalyticsClient