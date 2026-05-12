"use client";

import dynamic from "next/dynamic";

const UnderConstructionComponent = dynamic(
    () => import("@/components/pages/underConstruction"),
    { ssr: false }
);

const UnderConstructionClient = () => {
    return <UnderConstructionComponent />;
};

export default UnderConstructionClient;

