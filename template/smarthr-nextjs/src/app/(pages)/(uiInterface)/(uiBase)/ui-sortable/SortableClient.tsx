"use client";

import dynamic from "next/dynamic";

const Sortable = dynamic(
    () => import("@/components/uiInterface/base-ui/ui-sortable"),
    { ssr: false }
);

const SortableClient = () => {
    return <Sortable />;
};

export default SortableClient;

