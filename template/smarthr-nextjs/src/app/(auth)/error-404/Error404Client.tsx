"use client";

import dynamic from "next/dynamic";

const Error404Component = dynamic(
    () => import("@/components/pages/error/error-404"),
    { ssr: false }
);

const Error404Client = () => {
    return <Error404Component />;
};

export default Error404Client;

