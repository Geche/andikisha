"use client";

import dynamic from "next/dynamic";

const ProjectListComponent = dynamic(
    () => import("@/components/projects/project/projectlist"),
    { ssr: false }
);

const ProjectsClient = () => {
    return <ProjectListComponent />;
};

export default ProjectsClient;





