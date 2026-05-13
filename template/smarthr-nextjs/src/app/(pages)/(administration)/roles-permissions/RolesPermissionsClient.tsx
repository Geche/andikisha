"use client";

import dynamic from "next/dynamic";

const RolesPermissionComponent = dynamic(
    () => import("@/components/administration/user-management/rolePermission"),
    { ssr: false }
);

const RolesPermissionsClient = () => {
    return <RolesPermissionComponent />;
};

export default RolesPermissionsClient;





