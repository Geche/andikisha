"use client";

import dynamic from "next/dynamic";

const Register3Component = dynamic(
    () => import("@/components/auth/register/register-3"),
    { ssr: false }
);

const Register3Client = () => {
    return <Register3Component />;
};

export default Register3Client;

