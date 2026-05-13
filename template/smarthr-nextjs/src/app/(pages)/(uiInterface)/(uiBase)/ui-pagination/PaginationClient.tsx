"use client";

import dynamic from "next/dynamic";

const PaginationComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/pagination"),
    { ssr: false }
);

const PaginationClient = () => {
    return <PaginationComponent />;
};

export default PaginationClient;

