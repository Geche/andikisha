"use client";

import dynamic from "next/dynamic";

const CustomFieldsComponent = dynamic(
    () => import("@/components/settings/appSettings/customFields"),
    { ssr: false }
);

const CustomFieldsClient = () => {
    return <CustomFieldsComponent />;
};

export default CustomFieldsClient;





