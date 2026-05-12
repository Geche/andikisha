"use client";

import dynamic from "next/dynamic";

const BlogCategoriesComponent = dynamic(
    () => import("@/components/content/blog/blogCategories"),
    { ssr: false }
);

const BlogCategoriesClient = () => {
    return <BlogCategoriesComponent />;
};

export default BlogCategoriesClient;

