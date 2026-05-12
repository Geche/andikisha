"use client";

import dynamic from "next/dynamic";

const HolidayCalendarsComponent = dynamic(
  () => import("@/components/hrm/attendance/holiday-calendar/holidayCalendar"),
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
const HolidayCalendarClient = () => {
  return (
    <><HolidayCalendarsComponent/></>
  )
}

export default HolidayCalendarClient