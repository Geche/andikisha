"use client";

import dynamic from "next/dynamic";

const Register2Component = dynamic(
    () => import("@/components/auth/register/register-2"),
    { ssr: false }
);

const Register2Client = () => {
    return <Register2Component />;
};

export default Register2Client;

