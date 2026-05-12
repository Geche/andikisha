"use client";

import dynamic from "next/dynamic";

const KanbanViewComponent = dynamic(
    () => import("@/components/application/kanbanView"),
    { ssr: false }
);

const KanbanViewClient = () => {
    return <KanbanViewComponent />;
};

export default KanbanViewClient;

