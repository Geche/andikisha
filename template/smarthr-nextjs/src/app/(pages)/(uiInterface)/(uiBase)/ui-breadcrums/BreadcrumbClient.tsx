"use client";

import dynamic from "next/dynamic";

const BreadcrumbComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/breadcrumb"),
    { ssr: false }
);

const BreadcrumbClient = () => {
    return <BreadcrumbComponent />;
};

export default BreadcrumbClient;

