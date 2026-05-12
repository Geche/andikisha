"use client";

import dynamic from "next/dynamic";

const ProfilesettingsComponent = dynamic(
    () => import("@/components/settings/generalSettings/profile-settings"),
    { ssr: false }
);

const ProfileSettingsClient = () => {
    return <ProfilesettingsComponent />;
};

export default ProfileSettingsClient;





