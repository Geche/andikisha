"use client";

import dynamic from "next/dynamic";

const BasicInputsComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/basic-inputs"),
    { ssr: false }
);

const BasicInputsClient = () => {
    return <BasicInputsComponent />;
};

export default BasicInputsClient;

