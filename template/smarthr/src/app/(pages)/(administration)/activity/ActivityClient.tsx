"use client";

import dynamic from "next/dynamic";

const ActivityComponent = dynamic(
    () => import("@/components/administration/help-support/activity"),
    { ssr: false }
);

const ActivityClient = () => {
    return <ActivityComponent />;
};

export default ActivityClient;





