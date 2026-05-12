"use client";

import dynamic from "next/dynamic";

const ChatComponent = dynamic(
    () => import("@/components/application/chat"),
    { ssr: false }
);

const ChatClient = () => {
    return <ChatComponent />;
};

export default ChatClient;

