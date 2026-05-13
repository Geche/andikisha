"use client";

import dynamic from "next/dynamic";

const RatingComponent = dynamic(
    () => import("@/components/uiInterface/advanced-ui/rating"),
    { ssr: false }
);

const RatingClient = () => {
    return <RatingComponent />;
};

export default RatingClient;

