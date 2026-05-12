"use client";

import dynamic from "next/dynamic";

const FloatingLabelComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/layouts/floating-label"),
    { ssr: false }
);

const FloatingLabelsClient = () => {
    return <FloatingLabelComponent />;
};

export default FloatingLabelsClient;

