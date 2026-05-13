"use client";

import dynamic from "next/dynamic";

const BudgetExpensesComponent = dynamic(
    () => import("@/components/accounting/budget-expenses"),
    { ssr: false }
);

const BudgetsExpensesClient = () => {
    return <BudgetExpensesComponent />;
};

export default BudgetsExpensesClient;





