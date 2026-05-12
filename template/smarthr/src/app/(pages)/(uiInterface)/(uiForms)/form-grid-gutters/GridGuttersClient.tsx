"use client";

import dynamic from "next/dynamic";

const GridGuttersComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/grid-gutters"),
    { ssr: false }
);

const GridGuttersClient = () => {
    return <GridGuttersComponent />;
};

export default GridGuttersClient;

