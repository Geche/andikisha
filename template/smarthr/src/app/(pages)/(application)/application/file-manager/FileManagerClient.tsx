"use client";

import dynamic from "next/dynamic";

const FileManagerComponent = dynamic(
    () => import("@/components/application/fileManager"),
    { ssr: false }
);

const FileManagerClient = () => {
    return <FileManagerComponent />;
};

export default FileManagerClient;

