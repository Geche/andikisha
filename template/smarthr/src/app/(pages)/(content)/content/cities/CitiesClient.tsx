"use client";

import dynamic from "next/dynamic";

const CitiesComponent = dynamic(
    () => import("@/components/content/location/cities"),
    { ssr: false }
);

const CitiesClient = () => {
    return <CitiesComponent />;
};

export default CitiesClient;

