"use client";

import dynamic from "next/dynamic";

const PackagesComponent = dynamic(
    () => import("@/components/super-admin/packages/packagelist"),
    { ssr: false }
);

const PackageClient = () => {
    return <PackagesComponent />;
};

export default PackageClient;





