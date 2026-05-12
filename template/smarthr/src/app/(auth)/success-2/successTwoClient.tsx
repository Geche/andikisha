"use client";

import dynamic from "next/dynamic";

const ResetPasswordSuccess2 = dynamic(
    () => import("@/components/auth/resetPasswordSuccess/resetPasswordSuccess-2"),
    { ssr: false }
);

const SuccessTwoClient = () => {
    return <ResetPasswordSuccess2 />;
};

export default SuccessTwoClient;
