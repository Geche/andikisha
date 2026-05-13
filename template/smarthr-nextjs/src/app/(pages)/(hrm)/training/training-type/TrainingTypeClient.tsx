"use client";

import dynamic from "next/dynamic";

const TrainingTypeComponent = dynamic(
    () => import("@/components/training/trainingType"),
    { ssr: false }
);

const TrainingTypeClient = () => {
    return <TrainingTypeComponent />;
};

export default TrainingTypeClient;





