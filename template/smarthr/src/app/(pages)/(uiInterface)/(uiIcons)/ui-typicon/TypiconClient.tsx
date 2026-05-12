"use client";

import dynamic from "next/dynamic";

const TypiconIcons = dynamic(
    () => import("@/components/uiInterface/icons/typicons"),
    { ssr: false }
);

const TypiconClient = () => {
    return <TypiconIcons />;
};

export default TypiconClient;

