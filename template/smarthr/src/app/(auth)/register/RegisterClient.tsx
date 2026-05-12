"use client";

import dynamic from "next/dynamic";

const RegisterComponent = dynamic(
    () => import("@/components/auth/register/register"),
    { ssr: false }
);

const RegisterClient = () => {
    return <RegisterComponent />;
};

export default RegisterClient;

