"use client";

import dynamic from "next/dynamic";

const OtpSettingsComponent = dynamic(
    () => import("@/components/settings/systemSettings/otp-settings"),
    { ssr: false }
);

const OtpSettingsClient = () => {
    return <OtpSettingsComponent />;
};

export default OtpSettingsClient;





