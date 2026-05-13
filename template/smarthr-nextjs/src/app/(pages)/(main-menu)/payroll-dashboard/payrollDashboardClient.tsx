"use client";
import dynamic from "next/dynamic";

const PayrollDashboardComponent = dynamic(
  () => import("@/components/mainMenu/payroll-dashboard/payrollDashboard"),
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

const PayrollDashboardClient = () => {
  return (
   <><PayrollDashboardComponent/></>
  )
}

export default PayrollDashboardClient