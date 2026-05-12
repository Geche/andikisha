"use client";

import dynamic from "next/dynamic";

const ResetPasswordSuccess = dynamic(
    () => import("@/components/auth/resetPasswordSuccess/resetPasswordSuccess"),
    { ssr: false }
);

const SuccessClient = () => {
    return <ResetPasswordSuccess />;
};

export default SuccessClient;
