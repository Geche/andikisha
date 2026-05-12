"use client";

import dynamic from "next/dynamic";

const Login2Component = dynamic(
    () => import("@/components/auth/login/login-2"),
    { ssr: false }
);

const Login2Client = () => {
    return <Login2Component />;
};

export default Login2Client;

