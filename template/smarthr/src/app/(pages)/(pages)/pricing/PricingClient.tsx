"use client";

import dynamic from "next/dynamic";

const PricingComponent = dynamic(
    () => import("@/components/pages/pricing"),
    { ssr: false }
);

const PricingClient = () => {
    return <PricingComponent />;
};

export default PricingClient;





