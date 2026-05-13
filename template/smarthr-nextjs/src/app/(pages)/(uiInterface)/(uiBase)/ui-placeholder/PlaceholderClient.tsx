"use client";

import dynamic from "next/dynamic";

const PlaceholderComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/placeholder"),
    { ssr: false }
);

const PlaceholderClient = () => {
    return <PlaceholderComponent />;
};

export default PlaceholderClient;

