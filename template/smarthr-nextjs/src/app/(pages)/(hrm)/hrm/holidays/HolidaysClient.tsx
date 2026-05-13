"use client";

import dynamic from "next/dynamic";

const HolidaysComponent = dynamic(
    () => import("@/components/hrm/holidays"),
    { ssr: false }
);

const HolidaysClient = () => {
    return <HolidaysComponent />;
};

export default HolidaysClient;





