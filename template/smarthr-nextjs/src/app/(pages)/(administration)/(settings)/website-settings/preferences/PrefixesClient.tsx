"use client";

import dynamic from "next/dynamic";

const PreferenceComponent = dynamic(
    () => import("@/components/settings/websiteSettings/preferences"),
    { ssr: false }
);

const PrefixesClient = () => {
    return <PreferenceComponent />;
};

export default PrefixesClient;





