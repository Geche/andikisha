"use client";

import dynamic from "next/dynamic";

const CustomjsComponent = dynamic(
    () => import("@/components/settings/otherSettings/custom-js"),
    { ssr: false }
);

const CustomJsClient = () => {
    return <CustomjsComponent />;
};

export default CustomJsClient;





