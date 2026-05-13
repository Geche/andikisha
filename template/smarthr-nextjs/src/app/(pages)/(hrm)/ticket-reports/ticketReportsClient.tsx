"use client";

import dynamic from "next/dynamic";

const TicketReportsComponent = dynamic(
  () => import("@/components/hrm/ticket-reports/ticketReports"),
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

const TicketReportsClient = () => {
  return (
    <><TicketReportsComponent/></>
  )
}

export default TicketReportsClient