"use client";

import dynamic from "next/dynamic";

const ImagesComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/images"),
    { ssr: false }
);

const ImagesClient = () => {
    return <ImagesComponent />;
};

export default ImagesClient;

