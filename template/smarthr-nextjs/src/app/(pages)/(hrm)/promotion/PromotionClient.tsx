"use client";

import dynamic from "next/dynamic";

const PromotionComponent = dynamic(
    () => import("@/components/hrm/promotion"),
    { ssr: false }
);

const PromotionClient = () => {
    return <PromotionComponent />;
};

export default PromotionClient;





