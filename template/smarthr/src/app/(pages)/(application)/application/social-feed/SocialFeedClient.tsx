"use client";

import dynamic from "next/dynamic";

const SocialFeedComponent = dynamic(
    () => import("@/components/application/socialfeed"),
    { ssr: false }
);

const SocialFeedClient = () => {
    return <SocialFeedComponent />;
};

export default SocialFeedClient;

