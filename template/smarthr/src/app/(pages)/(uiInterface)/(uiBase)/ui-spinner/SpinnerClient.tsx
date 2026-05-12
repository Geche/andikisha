"use client";

import dynamic from "next/dynamic";

const SpinnerComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/spinner"),
    { ssr: false }
);

const SpinnerClient = () => {
    return <SpinnerComponent />;
};

export default SpinnerClient;

