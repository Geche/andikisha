"use client";

import dynamic from "next/dynamic";

const EmailComponent = dynamic(
    () => import("@/components/application/email"),
    { ssr: false }
);

const EmailClient = () => {
    return <EmailComponent />;
};

export default EmailClient;

