"use client";

import dynamic from "next/dynamic";

const PipelineComponent = dynamic(
    () => import("@/components/crm/pipeline/pipeline"),
    { ssr: false }
);

const PipelineClient = () => {
    return <PipelineComponent />;
};

export default PipelineClient;





