"use client";

import dynamic from "next/dynamic";

const BackupComponent = dynamic(
    () => import("@/components/settings/otherSettings/backup"),
    { ssr: false }
);

const BackupClient = () => {
    return <BackupComponent />;
};

export default BackupClient;





