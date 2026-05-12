"use client";

import dynamic from "next/dynamic";

const ProjectComponent = dynamic(
    () => import("@/components/projects/project/project"),
    { ssr: false }
);

const ProjectsGridClient = () => {
    return <ProjectComponent />;
};

export default ProjectsGridClient;





