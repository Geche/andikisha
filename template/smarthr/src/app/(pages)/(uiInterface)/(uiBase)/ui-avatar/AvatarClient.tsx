"use client";

import dynamic from "next/dynamic";

const AvatarComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/avatar"),
    { ssr: false }
);

const AvatarClient = () => {
    return <AvatarComponent />;
};

export default AvatarClient;

