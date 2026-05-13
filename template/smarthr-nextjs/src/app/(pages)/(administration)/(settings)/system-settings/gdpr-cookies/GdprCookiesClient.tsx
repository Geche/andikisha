"use client";

import dynamic from "next/dynamic";

const GdprCookiesComponent = dynamic(
    () => import("@/components/settings/systemSettings/gdprCookies"),
    { ssr: false }
);

const GdprCookiesClient = () => {
    return <GdprCookiesComponent />;
};

export default GdprCookiesClient;





