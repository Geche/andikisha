"use client";

import dynamic from "next/dynamic";

const ButtonsComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/buttons"),
    { ssr: false }
);

const ButtonsClient = () => {
    return <ButtonsComponent />;
};

export default ButtonsClient;

