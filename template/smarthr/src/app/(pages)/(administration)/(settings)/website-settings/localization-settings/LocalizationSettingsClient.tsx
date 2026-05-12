"use client";

import dynamic from "next/dynamic";

const LocalizationsettingsComponent = dynamic(
    () => import("@/components/settings/websiteSettings/localization-settings"),
    { ssr: false }
);

const LocalizationSettingsClient = () => {
    return <LocalizationsettingsComponent />;
};

export default LocalizationSettingsClient;





