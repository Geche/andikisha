"use client";

import dynamic from "next/dynamic";

const CustomcssComponent = dynamic(
    () => import("@/components/settings/otherSettings/custom-css"),
    { ssr: false }
);

const CustomCssClient = () => {
    return <CustomcssComponent />;
};

export default CustomCssClient;





