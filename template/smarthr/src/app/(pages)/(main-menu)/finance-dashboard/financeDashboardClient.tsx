"use client";
import dynamic from 'next/dynamic';
import React from 'react'
const FinanceDashboardComponent = dynamic(
  () => import("@/components/mainMenu/finance-dashboard/financeDashboard"),
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
const FinanceDashboardClient = () => {
  return (
    <><FinanceDashboardComponent/></>
  )
}

export default FinanceDashboardClient