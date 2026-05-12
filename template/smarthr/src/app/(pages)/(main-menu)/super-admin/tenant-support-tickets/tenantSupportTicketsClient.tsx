"use client";

import dynamic from "next/dynamic";

const TenantSupportTicketsComponent = dynamic(
  () => import("@/components/super-admin/tenant-support-tickets/tenantSupportTickets"),
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
const TenantSupportTicketsClient = () => {
  return (
    <><TenantSupportTicketsComponent/></>
  )
}

export default TenantSupportTicketsClient