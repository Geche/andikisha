"use client";

import dynamic from "next/dynamic";

const ForgotPasswordComponent = dynamic(
    () => import("@/components/auth/forgotPassword/forgotPassword"),
    { ssr: false }
);

const ForgotPasswordClient = () => {
    return <ForgotPasswordComponent />;
};

export default ForgotPasswordClient;

