"use client";

import dynamic from "next/dynamic";

const ApiKeysComponent = dynamic(
    () => import("@/components/pages/api-keys"),
    { ssr: false }
);

const ApiKeysClient = () => {
    return <ApiKeysComponent />;
};

export default ApiKeysClient;





