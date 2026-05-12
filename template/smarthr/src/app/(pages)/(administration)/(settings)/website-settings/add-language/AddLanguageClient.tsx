"use client";

import dynamic from "next/dynamic";

const AddLanguageComponent = dynamic(
    () => import("@/components/settings/websiteSettings/add-language"),
    { ssr: false }
);

const AddLanguageClient = () => {
    return <AddLanguageComponent />;
};

export default AddLanguageClient;

