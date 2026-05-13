"use client";

import dynamic from "next/dynamic";

const TrainingListComponent = dynamic(
    () => import("@/components/training/trainingList"),
    { ssr: false }
);

const TrainingListClient = () => {
    return <TrainingListComponent />;
};

export default TrainingListClient;





