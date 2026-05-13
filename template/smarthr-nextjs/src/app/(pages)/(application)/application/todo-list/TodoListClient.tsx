"use client";

import dynamic from "next/dynamic";

const TodoListComponent = dynamic(
    () => import("@/components/application/todo/todolist"),
    { ssr: false }
);

const TodoListClient = () => {
    return <TodoListComponent />;
};

export default TodoListClient;

