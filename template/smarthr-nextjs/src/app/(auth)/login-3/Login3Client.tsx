"use client";

import dynamic from "next/dynamic";

const Login3Component = dynamic(
    () => import("@/components/auth/login/login-3"),
    { ssr: false }
);

const Login3Client = () => {
    return <Login3Component />;
};

export default Login3Client;

