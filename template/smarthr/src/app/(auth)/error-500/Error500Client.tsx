"use client";

import dynamic from "next/dynamic";

const Error500Component = dynamic(
    () => import("@/components/pages/error/error-500"),
    { ssr: false }
);

const Error500Client = () => {
    return <Error500Component />;
};

export default Error500Client;

