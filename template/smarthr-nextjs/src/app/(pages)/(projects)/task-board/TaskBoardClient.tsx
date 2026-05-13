"use client";

import dynamic from "next/dynamic";

const TaskBoardComponent = dynamic(
    () => import("@/components/projects/task/task-board"),
    { ssr: false }
);

const TaskBoardClient = () => {
    return <TaskBoardComponent />;
};

export default TaskBoardClient;





