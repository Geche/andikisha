"use client";

import dynamic from "next/dynamic";

const CountriesComponent = dynamic(
    () => import("@/components/content/location/countries"),
    { ssr: false }
);

const CountriesClient = () => {
    return <CountriesComponent />;
};

export default CountriesClient;

