"use client";

import dynamic from "next/dynamic";

const ResetPasswordComponent = dynamic(
    () => import("@/components/auth/resetPassword/resetPassword"),
    { ssr: false }
);

const ResetPasswordClient = () => {
    return <ResetPasswordComponent />;
};

export default ResetPasswordClient;

