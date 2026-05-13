"use client";

import dynamic from "next/dynamic";

const ResetPasswordSuccess3 = dynamic(
    () => import("@/components/auth/resetPasswordSuccess/resetPasswordSuccess-3"),
    { ssr: false }
);

const SuccessThreeClient = () => {
    return <ResetPasswordSuccess3 />;
};

export default SuccessThreeClient;
