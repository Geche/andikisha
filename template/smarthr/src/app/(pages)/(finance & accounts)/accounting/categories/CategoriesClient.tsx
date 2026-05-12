"use client";

import dynamic from "next/dynamic";

const CategoriesComponent = dynamic(
    () => import("@/components/accounting/categories"),
    { ssr: false }
);

const CategoriesClient = () => {
    return <CategoriesComponent />;
};

export default CategoriesClient;





