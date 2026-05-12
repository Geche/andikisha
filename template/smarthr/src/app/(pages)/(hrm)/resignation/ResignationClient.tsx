"use client";

import dynamic from "next/dynamic";

const ResignationComponent = dynamic(
    () => import("@/components/hrm/resignation"),
    { ssr: false }
);

const ResignationClient = () => {
    return <ResignationComponent />;
};

export default ResignationClient;





