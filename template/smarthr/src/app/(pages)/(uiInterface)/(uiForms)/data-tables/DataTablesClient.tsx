"use client";

import dynamic from "next/dynamic";

const DataTablesComponent = dynamic(
    () => import("@/components/uiInterface/table/data-tables"),
    { ssr: false }
);

const DataTablesClient = () => {
    return <DataTablesComponent />;
};

export default DataTablesClient;

