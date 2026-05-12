"use client";

import dynamic from "next/dynamic";

const StorageComponent = dynamic(
    () => import("@/components/settings/otherSettings/storage"),
    { ssr: false }
);

const StorageSettingsClient = () => {
    return <StorageComponent />;
};

export default StorageSettingsClient;





