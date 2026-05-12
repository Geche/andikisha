"use client";

import dynamic from "next/dynamic";

const ProfileComponent = dynamic(
    () => import("@/components/pages/profile"),
    { ssr: false }
);

const ProfileClient = () => {
    return <ProfileComponent />;
};

export default ProfileClient;





