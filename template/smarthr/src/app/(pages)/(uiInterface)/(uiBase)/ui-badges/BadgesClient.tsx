"use client";

import dynamic from "next/dynamic";

const BadgesComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/badges"),
    { ssr: false }
);

const BadgesClient = () => {
    return <BadgesComponent />;
};

export default BadgesClient;

