"use client";

import dynamic from "next/dynamic";

const RangeSlidesComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/rangeslider"),
    { ssr: false }
);

const RangesliderClient = () => {
    return <RangeSlidesComponent />;
};

export default RangesliderClient;

