"use client";

import dynamic from "next/dynamic";

const LoginComponent = dynamic(
    () => import("@/components/auth/login/loginComponent"),
    { ssr: false }
);

const LoginClient = () => {
    return <LoginComponent />;
};

export default LoginClient;

