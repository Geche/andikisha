"use client";

import dynamic from "next/dynamic";

const TaskDetailsComponent = dynamic(
    () => import("@/components/projects/task/taskdetails"),
    { ssr: false }
);

const TaskDetailsClient = () => {
    return <TaskDetailsComponent />;
};

export default TaskDetailsClient;

