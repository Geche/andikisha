"use client";

import dynamic from "next/dynamic";

const TablesBasicComponent = dynamic(
    () => import("@/components/uiInterface/table/tables-basic"),
    { ssr: false }
);

const TablesBasicClient = () => {
    return <TablesBasicComponent />;
};

export default TablesBasicClient;

