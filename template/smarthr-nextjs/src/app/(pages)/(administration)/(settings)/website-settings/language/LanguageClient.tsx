"use client";

import dynamic from "next/dynamic";

const LanguageComponent = dynamic(
    () => import("@/components/settings/websiteSettings/language"),
    { ssr: false }
);

const LanguageClient = () => {
    return <LanguageComponent />;
};

export default LanguageClient;





