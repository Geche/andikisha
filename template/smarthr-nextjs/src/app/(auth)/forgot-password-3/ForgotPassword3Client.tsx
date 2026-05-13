"use client";

import dynamic from "next/dynamic";

const ForgotPassword3Component = dynamic(
    () => import("@/components/auth/forgotPassword/forgotPassword-3"),
    { ssr: false }
);

const ForgotPassword3Client = () => {
    return <ForgotPassword3Component />;
};

export default ForgotPassword3Client;

