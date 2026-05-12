"use client";

import dynamic from "next/dynamic";

const EmailtemplatesComponent = dynamic(
    () => import("@/components/settings/systemSettings/email-templates"),
    { ssr: false }
);

const EmailTemplatesClient = () => {
    return <EmailtemplatesComponent />;
};

export default EmailTemplatesClient;





