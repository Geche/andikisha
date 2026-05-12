"use client";

import dynamic from "next/dynamic";

const BudgetRevenuesComponent = dynamic(
    () => import("@/components/accounting/budget-revenues"),
    { ssr: false }
);

const BudgetRevenuesClient = () => {
    return <BudgetRevenuesComponent />;
};

export default BudgetRevenuesClient;





