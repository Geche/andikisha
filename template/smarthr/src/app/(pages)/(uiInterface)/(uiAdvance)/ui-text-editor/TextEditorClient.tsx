"use client";

import dynamic from "next/dynamic";

const TextEditorComponent = dynamic(
    () => import("@/components/uiInterface/advanced-ui/texteditor"),
    { ssr: false }
);

const TextEditorClient = () => {
    return <TextEditorComponent />;
};

export default TextEditorClient;

