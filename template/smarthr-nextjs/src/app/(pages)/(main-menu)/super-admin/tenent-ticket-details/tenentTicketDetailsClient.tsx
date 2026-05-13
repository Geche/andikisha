"use client";

import dynamic from "next/dynamic";

const TenentTicketDetailsComponent = dynamic(
  () => import("@/components/super-admin/tenant-support-tickets/tenentTicketDetails"),
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
const TenentTicketDetailsClient = () => {
  return (
    <><TenentTicketDetailsComponent/></>
  )
}

export default TenentTicketDetailsClient