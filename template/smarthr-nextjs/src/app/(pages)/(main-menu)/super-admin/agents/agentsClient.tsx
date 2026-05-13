"use client";

import dynamic from "next/dynamic";

const AgentsComponent = dynamic(
  () => import("@/components/super-admin/agents/agents"),
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
const AgentsClient = () => {
  return (
    <><AgentsComponent/></>
  )
}

export default AgentsClient