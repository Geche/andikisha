"use client";

import dynamic from "next/dynamic";

const ResetPassword3Component = dynamic(
    () => import("@/components/auth/resetPassword/resetPassword-3"),
    { ssr: false }
);

const ResetPassword3Client = () => {
    return <ResetPassword3Component />;
};

export default ResetPassword3Client;

