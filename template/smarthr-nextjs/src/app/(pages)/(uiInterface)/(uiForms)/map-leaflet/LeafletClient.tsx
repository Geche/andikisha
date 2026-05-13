"use client";

import dynamic from "next/dynamic";

const LeafletComponent = dynamic(
    () => import("@/components/uiInterface/map/leaflet"),
    { ssr: false }
);

const LeafletClient = () => {
    return <LeafletComponent />;
};

export default LeafletClient;

