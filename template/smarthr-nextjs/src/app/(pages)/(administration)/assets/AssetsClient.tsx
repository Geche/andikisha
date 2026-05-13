"use client";

import dynamic from "next/dynamic";

const AssetsComponent = dynamic(
    () => import("@/components/administration/asset"),
    { ssr: false }
);

const AssetsClient = () => {
    return <AssetsComponent />;
};

export default AssetsClient;





