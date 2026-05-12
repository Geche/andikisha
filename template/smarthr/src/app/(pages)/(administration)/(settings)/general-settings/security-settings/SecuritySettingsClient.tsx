"use client";

import dynamic from "next/dynamic";

const SecuritysettingsComponent = dynamic(
    () => import("@/components/settings/generalSettings/security-settings"),
    { ssr: false }
);

const SecuritySettingsClient = () => {
    return <SecuritysettingsComponent />;
};

export default SecuritySettingsClient;





