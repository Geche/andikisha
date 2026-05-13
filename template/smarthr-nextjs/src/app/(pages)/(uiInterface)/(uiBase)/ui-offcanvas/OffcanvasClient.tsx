"use client";

import dynamic from "next/dynamic";

const Offcanvas = dynamic(
    () => import("@/components/uiInterface/base-ui/offcanvas"),
    { ssr: false }
);

const OffcanvasClient = () => {
    return <Offcanvas />;
};

export default OffcanvasClient;

