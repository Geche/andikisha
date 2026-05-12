"use client";

import dynamic from "next/dynamic";

const ComingSoonComponent = dynamic(
    () => import("@/components/pages/comingSoon"),
    { ssr: false }
);

const ComingSoonClient = () => {
    return <ComingSoonComponent />;
};

export default ComingSoonClient;

