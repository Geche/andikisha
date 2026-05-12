"use client";

import dynamic from "next/dynamic";

const JobGridComponent = dynamic(
    () => import("@/components/recruitment/jobs/jobgrid"),
    { ssr: false }
);

const JobGridClient = () => {
    return <JobGridComponent />;
};

export default JobGridClient;





