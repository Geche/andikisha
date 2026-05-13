"use client";

import dynamic from "next/dynamic";

const BanIpAddressComponent = dynamic(
    () => import("@/components/settings/otherSettings/banIpaddress"),
    { ssr: false }
);

const BanIpAddressClient = () => {
    return <BanIpAddressComponent />;
};

export default BanIpAddressClient;





