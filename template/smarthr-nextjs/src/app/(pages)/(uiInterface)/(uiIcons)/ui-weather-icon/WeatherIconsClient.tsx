"use client";

import dynamic from "next/dynamic";

const WeatherIconsComponent = dynamic(
    () => import("@/components/uiInterface/icons/weathericons"),
    { ssr: false }
);

const WeatherIconsClient = () => {
    return <WeatherIconsComponent />;
};

export default WeatherIconsClient;

