"use client";

import dynamic from "next/dynamic";

const InputGroupComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/input-group"),
    { ssr: false }
);

const InputGroupClient = () => {
    return <InputGroupComponent />;
};

export default InputGroupClient;

