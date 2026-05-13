"use client";

import dynamic from "next/dynamic";

const Clearcache = dynamic(
    () => import("@/components/settings/otherSettings/clearCache"),
    { ssr: false }
);

const ClearCacheClient = () => {
    return <Clearcache />;
};

export default ClearCacheClient;





