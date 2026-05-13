"use client";

import dynamic from "next/dynamic";

const StarterPageComponent = dynamic(
    () => import("@/components/pages/starter"),
    { ssr: false }
);

const StarterClient = () => {
    return <StarterPageComponent />;
};

export default StarterClient;





