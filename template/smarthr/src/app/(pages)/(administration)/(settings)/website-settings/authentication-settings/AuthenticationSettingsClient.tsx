"use client";

import dynamic from "next/dynamic";

const AuthenticationsettingsComponent = dynamic(
    () => import("@/components/settings/websiteSettings/authentication-settings"),
    { ssr: false }
);

const AuthenticationSettingsClient = () => {
    return <AuthenticationsettingsComponent />;
};

export default AuthenticationSettingsClient;





