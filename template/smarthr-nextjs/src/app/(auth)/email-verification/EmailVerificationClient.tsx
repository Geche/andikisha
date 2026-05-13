"use client";

import dynamic from "next/dynamic";

const EmailVerificationComponent = dynamic(
    () => import("@/components/auth/emailVerification/emailVerification"),
    { ssr: false }
);

const EmailVerificationClient = () => {
    return <EmailVerificationComponent />;
};

export default EmailVerificationClient;

