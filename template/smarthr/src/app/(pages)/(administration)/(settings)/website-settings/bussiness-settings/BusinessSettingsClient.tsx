"use client";

import dynamic from "next/dynamic";

const BussinesssettingsComponent = dynamic(
    () => import("@/components/settings/websiteSettings/bussiness-settings"),
    { ssr: false }
);

const BusinessSettingsClient = () => {
    return <BussinesssettingsComponent />;
};

export default BusinessSettingsClient;





