"use client";

import dynamic from "next/dynamic";

const BudgetsComponent = dynamic(
    () => import("@/components/accounting/budgets"),
    { ssr: false }
);

const BudgetsClient = () => {
    return <BudgetsComponent />;
};

export default BudgetsClient;





