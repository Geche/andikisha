"use client";

import dynamic from "next/dynamic";

const CounterComponent = dynamic(
    () => import("@/components/uiInterface/advanced-ui/counter"),
    { ssr: false }
);

const CounterClient = () => {
    return <CounterComponent />;
};

export default CounterClient;

