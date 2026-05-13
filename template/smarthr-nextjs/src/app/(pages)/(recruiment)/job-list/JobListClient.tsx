"use client";

import dynamic from "next/dynamic";

const JobListComponent = dynamic(
    () => import("@/components/recruitment/joblist/joblist"),
    { ssr: false }
);

const JobListClient = () => {
    return <JobListComponent />;
};

export default JobListClient;





