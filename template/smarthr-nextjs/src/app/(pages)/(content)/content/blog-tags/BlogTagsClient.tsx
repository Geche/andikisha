"use client";

import dynamic from "next/dynamic";

const BlogTagsComponent = dynamic(
    () => import("@/components/content/blog/blogTags"),
    { ssr: false }
);

const BlogTagsClient = () => {
    return <BlogTagsComponent />;
};

export default BlogTagsClient;

