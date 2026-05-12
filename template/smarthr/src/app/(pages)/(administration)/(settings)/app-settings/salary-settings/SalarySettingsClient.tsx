"use client";

import dynamic from "next/dynamic";

const SalarysettingsComponent = dynamic(
    () => import("@/components/settings/appSettings/salary-settings"),
    { ssr: false }
);

const SalarySettingsClient = () => {
    return <SalarysettingsComponent />;
};

export default SalarySettingsClient;





