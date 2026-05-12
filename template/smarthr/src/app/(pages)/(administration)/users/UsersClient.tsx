"use client";

import dynamic from "next/dynamic";

const Users = dynamic(
    () => import("@/components/administration/user-management/users"),
    { ssr: false }
);

const UsersClient = () => {
    return <Users />;
};

export default UsersClient;





