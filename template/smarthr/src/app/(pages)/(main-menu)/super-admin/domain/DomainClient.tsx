"use client";

import dynamic from "next/dynamic";

const DomainComponent = dynamic(
    () => import("@/components/super-admin/domin"),
    { ssr: false }
);

const DomainClient = () => {
    return <DomainComponent />;
};

export default DomainClient;





