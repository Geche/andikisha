"use client";

import dynamic from "next/dynamic";

const BlogCommentsComponent = dynamic(
    () => import("@/components/content/blog/blogComments"),
    { ssr: false }
);

const BlogCommentsClient = () => {
    return <BlogCommentsComponent />;
};

export default BlogCommentsClient;

