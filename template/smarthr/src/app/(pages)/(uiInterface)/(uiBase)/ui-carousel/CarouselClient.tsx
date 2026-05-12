"use client";

import dynamic from "next/dynamic";

const CarouselComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/carousel"),
    { ssr: false }
);

const CarouselClient = () => {
    return <CarouselComponent />;
};

export default CarouselClient;

