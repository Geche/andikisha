"use client";

import dynamic from "next/dynamic";

const CertificationTrackingComponent = dynamic(
  () => import("@/components/training/certification-tracking/certificationTracking"),
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
const CertificationTrackingClient = () => {
  return (
    <><CertificationTrackingComponent/></>
  )
}

export default CertificationTrackingClient