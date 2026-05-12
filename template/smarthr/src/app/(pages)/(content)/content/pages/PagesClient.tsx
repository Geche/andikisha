"use client";

import dynamic from "next/dynamic";

const PagesComponent = dynamic(
    () => import("@/components/content/pages"),
    { ssr: false }
);

const PagesClient = () => {
    return <PagesComponent />;
};

export default PagesClient;

