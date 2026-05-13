"use client";

import dynamic from "next/dynamic";

const AlertUiComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/alert-ui"),
    { ssr: false }
);

const AlertClient = () => {
    return <AlertUiComponent />;
};

export default AlertClient;

