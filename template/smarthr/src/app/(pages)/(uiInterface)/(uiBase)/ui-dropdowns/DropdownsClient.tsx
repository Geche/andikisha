"use client";

import dynamic from "next/dynamic";

const DropdownsComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/dropdowns"),
    { ssr: false }
);

const DropdownsClient = () => {
    return <DropdownsComponent />;
};

export default DropdownsClient;

