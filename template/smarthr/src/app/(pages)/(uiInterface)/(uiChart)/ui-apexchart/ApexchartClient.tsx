"use client";

import dynamic from "next/dynamic";

const ApexchartComponent = dynamic(
    () => import("@/components/uiInterface/charts/apexcharts"),
    { ssr: false }
);

const ApexchartClient = () => {
    return <ApexchartComponent />;
};

export default ApexchartClient;

