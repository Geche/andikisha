"use client";

import dynamic from "next/dynamic";

const StatesComponent = dynamic(
    () => import("@/components/content/location/states"),
    { ssr: false }
);

const StatesClient = () => {
    return <StatesComponent />;
};

export default StatesClient;

