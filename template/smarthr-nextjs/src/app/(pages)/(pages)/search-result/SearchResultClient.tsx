"use client";

import dynamic from "next/dynamic";

const SearchResultComponent = dynamic(
    () => import("@/components/pages/search-result"),
    { ssr: false }
);

const SearchResultClient = () => {
    return <SearchResultComponent />;
};

export default SearchResultClient;





