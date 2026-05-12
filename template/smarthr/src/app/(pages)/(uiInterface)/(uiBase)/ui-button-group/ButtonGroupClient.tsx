"use client";

import dynamic from "next/dynamic";

const ButtonsGroupComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/buttonsgroup"),
    { ssr: false }
);

const ButtonGroupClient = () => {
    return <ButtonsGroupComponent />;
};

export default ButtonGroupClient;

