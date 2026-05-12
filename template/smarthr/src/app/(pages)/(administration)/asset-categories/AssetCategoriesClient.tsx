"use client";

import dynamic from "next/dynamic";

const AssetsCategoryComponent = dynamic(
    () => import("@/components/administration/asset-category"),
    { ssr: false }
);

const AssetCategoriesClient = () => {
    return <AssetsCategoryComponent />;
};

export default AssetCategoriesClient;





