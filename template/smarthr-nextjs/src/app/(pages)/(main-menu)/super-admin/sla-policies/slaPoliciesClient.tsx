"use client";

import dynamic from "next/dynamic";

const SlaPolicies = dynamic(
  () => import("@/components/super-admin/sla-policies/slaPolicies"),
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

const SlaPoliciesClient = () => {
  return (
    <><SlaPolicies/></>
  )
}

export default SlaPoliciesClient