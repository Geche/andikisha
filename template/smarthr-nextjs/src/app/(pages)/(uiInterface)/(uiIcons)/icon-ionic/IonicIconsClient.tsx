"use client";

import dynamic from "next/dynamic";

const IonicIconsComponent = dynamic(
    () => import("@/components/uiInterface/icons/ionicicons"),
    { ssr: false }
);

const IonicIconsClient = () => {
    return <IonicIconsComponent />;
};

export default IonicIconsClient;

