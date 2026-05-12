"use client";

import dynamic from "next/dynamic";

const ProjectReportComponent = dynamic(
    () => import("@/components/administration/reports/projectreport"),
    { ssr: false }
);

const ProjectReportClient = () => {
    return <ProjectReportComponent />;
};

export default ProjectReportClient;





