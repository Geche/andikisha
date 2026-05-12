"use client";

import dynamic from "next/dynamic";

const TaskComponent = dynamic(
    () => import("@/components/projects/task/task"),
    { ssr: false }
);

const TasksClient = () => {
    return <TaskComponent />;
};

export default TasksClient;





