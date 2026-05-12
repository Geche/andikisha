"use client";

import dynamic from "next/dynamic";

const ToastsComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/toasts"),
    { ssr: false }
);

const ToastsClient = () => {
    return <ToastsComponent />;
};

export default ToastsClient;

