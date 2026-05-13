"use client";

import dynamic from "next/dynamic";

const TrainersComponent = dynamic(
    () => import("@/components/training/trainers"),
    { ssr: false }
);

const TrainersClient = () => {
    return <TrainersComponent />;
};

export default TrainersClient;





