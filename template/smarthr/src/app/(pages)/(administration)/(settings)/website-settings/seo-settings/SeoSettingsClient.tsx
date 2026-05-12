"use client";

import dynamic from "next/dynamic";

const SeosettingsComponent = dynamic(
    () => import("@/components/settings/websiteSettings/seo-settings"),
    { ssr: false }
);

const SeoSettingsClient = () => {
    return <SeosettingsComponent />;
};

export default SeoSettingsClient;





