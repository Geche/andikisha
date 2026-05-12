"use client";

import dynamic from "next/dynamic";

const TaskReportComponent = dynamic(
    () => import("@/components/administration/reports/taskreport"),
    { ssr: false }
);

const TaskReportClient = () => {
    return <TaskReportComponent />;
};

export default TaskReportClient;





