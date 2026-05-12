"use client";

import dynamic from "next/dynamic";

const TypographyComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/typography"),
    { ssr: false }
);

const TypographyClient = () => {
    return <TypographyComponent />;
};

export default TypographyClient;

