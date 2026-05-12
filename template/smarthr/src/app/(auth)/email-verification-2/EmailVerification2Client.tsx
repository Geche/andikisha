"use client";

import dynamic from "next/dynamic";

const EmailVerification2Component = dynamic(
    () => import("@/components/auth/emailVerification/emailVerification-2"),
    { ssr: false }
);

const EmailVerification2Client = () => {
    return <EmailVerification2Component />;
};

export default EmailVerification2Client;

