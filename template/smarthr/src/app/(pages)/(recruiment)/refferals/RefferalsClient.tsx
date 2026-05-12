"use client";

import dynamic from "next/dynamic";

const RefferalListComponent = dynamic(
    () => import("@/components/recruitment/refferal/refferallist"),
    { ssr: false }
);

const RefferalsClient = () => {
    return <RefferalListComponent />;
};

export default RefferalsClient;





