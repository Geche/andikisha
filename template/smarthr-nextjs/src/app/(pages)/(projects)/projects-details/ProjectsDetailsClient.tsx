"use client";

import dynamic from "next/dynamic";

const ProjectDetailsComponent = dynamic(
    () => import("@/components/projects/project/projectdetails"),
    { ssr: false }
);

const ProjectsDetailsClient = () => {
    return <ProjectDetailsComponent />;
};

export default ProjectsDetailsClient;

