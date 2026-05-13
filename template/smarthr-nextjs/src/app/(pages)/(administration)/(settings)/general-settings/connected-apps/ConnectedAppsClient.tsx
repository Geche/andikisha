"use client";

import dynamic from "next/dynamic";

const ConnectedAppsComponent = dynamic(
    () => import("@/components/settings/generalSettings/connected-apps"),
    { ssr: false }
);

const ConnectedAppsClient = () => {
    return <ConnectedAppsComponent />;
};

export default ConnectedAppsClient;





