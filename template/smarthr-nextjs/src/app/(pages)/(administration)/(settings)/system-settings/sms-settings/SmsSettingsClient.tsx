"use client";

import dynamic from "next/dynamic";

const SmsSettingsComponent = dynamic(
    () => import("@/components/settings/systemSettings/sms-template"),
    { ssr: false }
);

const SmsSettingsClient = () => {
    return <SmsSettingsComponent />;
};

export default SmsSettingsClient;





