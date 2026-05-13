"use client";

import dynamic from "next/dynamic";

const AppearanceComponent = dynamic(
    () => import("@/components/settings/websiteSettings/appearance"),
    { ssr: false }
);

const AppearanceClient = () => {
    return <AppearanceComponent />;
};

export default AppearanceClient;





