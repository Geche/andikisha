"use client";

import dynamic from "next/dynamic";

const PackagesGridComponent = dynamic(
    () => import("@/components/super-admin/packages/packagegrid"),
    { ssr: false }
);

const PackageGridClient = () => {
    return <PackagesGridComponent />;
};

export default PackageGridClient;





