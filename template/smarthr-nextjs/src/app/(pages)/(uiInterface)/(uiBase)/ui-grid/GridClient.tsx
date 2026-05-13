"use client";

import dynamic from "next/dynamic";

const GridComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/grid"),
    { ssr: false }
);

const GridClient = () => {
    return <GridComponent />;
};

export default GridClient;

