"use client";

import dynamic from "next/dynamic";

const ExpensesReportComponent = dynamic(
    () => import("@/components/administration/reports/expensereport"),
    { ssr: false }
);

const ExpensesReportClient = () => {
    return <ExpensesReportComponent />;
};

export default ExpensesReportClient;





