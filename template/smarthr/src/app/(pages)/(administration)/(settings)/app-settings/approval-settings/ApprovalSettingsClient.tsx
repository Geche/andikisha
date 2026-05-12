"use client";

import dynamic from "next/dynamic";

const ApprovalsettingsComponent = dynamic(
    () => import("@/components/settings/appSettings/approval-settings"),
    { ssr: false }
);

const ApprovalSettingsClient = () => {
    return <ApprovalsettingsComponent />;
};

export default ApprovalSettingsClient;





