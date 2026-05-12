"use client";

import dynamic from "next/dynamic";

const AisettingsComponent = dynamic(
    () => import("@/components/settings/websiteSettings/ai-settings"),
    { ssr: false }
);

const AiSettingsClient = () => {
    return <AisettingsComponent />;
};

export default AiSettingsClient;





