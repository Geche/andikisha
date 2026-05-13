"use client";

import dynamic from "next/dynamic";

const GalleryComponent = dynamic(
    () => import("@/components/pages/gallery"),
    { ssr: false }
);

const GalleryClient = () => {
    return <GalleryComponent />;
};

export default GalleryClient;





