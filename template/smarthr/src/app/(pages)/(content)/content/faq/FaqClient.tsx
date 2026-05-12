"use client";

import dynamic from "next/dynamic";

const FaqComponent = dynamic(
    () => import("@/components/content/faq"),
    { ssr: false }
);

const FaqClient = () => {
    return <FaqComponent />;
};

export default FaqClient;

