"use client";

import dynamic from "next/dynamic";

const EmailVerification3Component = dynamic(
    () => import("@/components/auth/emailVerification/emailVerification-3"),
    { ssr: false }
);

const EmailVerification3Client = () => {
    return <EmailVerification3Component />;
};

export default EmailVerification3Client;

