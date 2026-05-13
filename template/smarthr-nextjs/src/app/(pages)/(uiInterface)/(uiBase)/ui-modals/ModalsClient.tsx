"use client";

import dynamic from "next/dynamic";

const ModalsComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/modals"),
    { ssr: false }
);

const ModalsClient = () => {
    return <ModalsComponent />;
};

export default ModalsClient;

