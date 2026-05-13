"use client";

import dynamic from "next/dynamic";

const ClipBoardComponent = dynamic(
    () => import("@/components/uiInterface/advanced-ui/clipboard"),
    { ssr: false }
);

const ClipboardClient = () => {
    return <ClipBoardComponent />;
};

export default ClipboardClient;

