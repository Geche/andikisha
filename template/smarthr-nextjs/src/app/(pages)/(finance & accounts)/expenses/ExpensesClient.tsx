"use client";

import dynamic from "next/dynamic";

const ExpensesComponent = dynamic(
    () => import("@/components/finance-accounts/sales/expenses"),
    { ssr: false }
);

const ExpensesClient = () => {
    return <ExpensesComponent />;
};

export default ExpensesClient;





