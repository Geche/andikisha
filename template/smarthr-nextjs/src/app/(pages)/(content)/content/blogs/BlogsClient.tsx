"use client";

import dynamic from "next/dynamic";

const BlogsComponent = dynamic(
    () => import("@/components/content/blog/blogs"),
    { ssr: false }
);

const BlogsClient = () => {
    return <BlogsComponent />;
};

export default BlogsClient;

