"use client";

import dynamic from "next/dynamic";

const KnowledgebaseComponent = dynamic(
    () => import("@/components/administration/help-support/knowledgebase"),
    { ssr: false }
);

const KnowledgebaseClient = () => {
    return <KnowledgebaseComponent />;
};

export default KnowledgebaseClient;





