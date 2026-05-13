"use client";

import dynamic from "next/dynamic";

const PaymentGatewaysComponent = dynamic(
    () => import("@/components/settings/financialSettings/paymentGateways"),
    { ssr: false }
);

const PaymentGatewaysClient = () => {
    return <PaymentGatewaysComponent />;
};

export default PaymentGatewaysClient;





