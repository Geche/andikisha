"use client";

import dynamic from "next/dynamic";

const CardsComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/cards"),
    { ssr: false }
);

const CardsClient = () => {
    return <CardsComponent />;
};

export default CardsClient;

