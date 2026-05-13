"use client";

import dynamic from "next/dynamic";

const SimpleList = dynamic(
    () => import("@/components/uiInterface/base-ui/ui-sortable/simple-list"),
    { ssr: false }
);

const SimplelineClient = () => {
    return <SimpleList />;
};

export default SimplelineClient;

