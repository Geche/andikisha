"use client";

import dynamic from "next/dynamic";

const DragAndDropComponent = dynamic(
    () => import("@/components/uiInterface/advanced-ui/dragdrop"),
    { ssr: false }
);

const DragDropClient = () => {
    return <DragAndDropComponent />;
};

export default DragDropClient;

