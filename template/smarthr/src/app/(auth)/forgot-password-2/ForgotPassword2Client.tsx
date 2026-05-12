"use client";

import dynamic from "next/dynamic";

const ForgotPassword2Component = dynamic(
    () => import("@/components/auth/forgotPassword/forgotPassword-2"),
    { ssr: false }
);

const ForgotPassword2Client = () => {
    return <ForgotPassword2Component />;
};

export default ForgotPassword2Client;

