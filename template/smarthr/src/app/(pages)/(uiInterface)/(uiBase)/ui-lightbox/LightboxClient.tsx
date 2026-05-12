"use client";

import dynamic from "next/dynamic";

const LightboxesComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/lightbox"),
    { ssr: false }
);

const LightboxClient = () => {
    return <LightboxesComponent />;
};

export default LightboxClient;

