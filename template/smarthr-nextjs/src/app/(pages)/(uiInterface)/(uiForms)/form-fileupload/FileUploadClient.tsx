"use client";

import dynamic from "next/dynamic";

const FileUpload = dynamic(
    () => import("@/components/uiInterface/forms/formelements/fileupload"),
    { ssr: false }
);

const FileUploadClient = () => {
    return <FileUpload />;
};

export default FileUploadClient;

