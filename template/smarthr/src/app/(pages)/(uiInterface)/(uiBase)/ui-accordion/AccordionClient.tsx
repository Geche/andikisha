"use client";

import dynamic from "next/dynamic";

const AccordionComponent = dynamic(
    () => import("@/components/uiInterface/base-ui/accordion"),
    { ssr: false }
);

const AccordionClient = () => {
    return <AccordionComponent />;
};

export default AccordionClient;

