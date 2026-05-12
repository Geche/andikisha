"use client";

import dynamic from "next/dynamic";

const EmailSettingsComponent = dynamic(
    () => import("@/components/settings/systemSettings/emailSettings"),
    { ssr: false }
);

const EmailSettingsClient = () => {
    return <EmailSettingsComponent />;
};

export default EmailSettingsClient;





