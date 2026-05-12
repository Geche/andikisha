"use client";
import dynamic from 'next/dynamic';
const TicketAutomationComponent = dynamic(
  () => import("@/components/hrm/ticket-automation/ticketAutomation"),
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
const TicketAutomationClient = () => {
  return (
    <><TicketAutomationComponent/></>
  )
}

export default TicketAutomationClient