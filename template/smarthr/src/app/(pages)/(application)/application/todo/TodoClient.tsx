"use client";

import dynamic from "next/dynamic";

const TodoComponent = dynamic(
    () => import("@/components/application/todo/todo"),
    { ssr: false }
);

const TodoClient = () => {
    return <TodoComponent />;
};

export default TodoClient;

