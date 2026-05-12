"use client";

import dynamic from "next/dynamic";

const ResetPassword2Component = dynamic(
    () => import("@/components/auth/resetPassword/resetPassword-2"),
    { ssr: false }
);

const ResetPassword2Client = () => {
    return <ResetPassword2Component />;
};

export default ResetPassword2Client;

