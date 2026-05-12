"use client";

import dynamic from "next/dynamic";

const PurchaseTransactionComponent = dynamic(
    () => import("@/components/super-admin/purchase-transaction"),
    { ssr: false }
);

const PurchaseTransactionClient = () => {
    return <PurchaseTransactionComponent />;
};

export default PurchaseTransactionClient;





