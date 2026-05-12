"use client";

import dynamic from "next/dynamic";

const InvoicesComponent = dynamic(
    () => import("@/components/finance-accounts/sales/invoices"),
    { ssr: false }
);

const InvoicesClient = () => {
    return <InvoicesComponent />;
};

export default InvoicesClient;

