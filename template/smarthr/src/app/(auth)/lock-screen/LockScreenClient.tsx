"use client";

import dynamic from "next/dynamic";

const LockScreenComponent = dynamic(
    () => import("@/components/auth/lockScreen"),
    { ssr: false }
);

const LockScreenClient = () => {
    return <LockScreenComponent />;
};

export default LockScreenClient;

