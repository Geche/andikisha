"use client";

import dynamic from "next/dynamic";

const EscalationRulesComponent = dynamic(
  () => import("@/components/super-admin/escalation-rules/escalationRules"),
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
const EscalationRulesClient = () => {
  return (
    <><EscalationRulesComponent/></>
  )
}

export default EscalationRulesClient