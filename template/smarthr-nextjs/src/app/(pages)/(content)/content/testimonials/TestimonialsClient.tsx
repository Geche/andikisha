"use client";

import dynamic from "next/dynamic";

const TestimonialsComponent = dynamic(
    () => import("@/components/content/testimonials"),
    { ssr: false }
);

const TestimonialsClient = () => {
    return <TestimonialsComponent />;
};

export default TestimonialsClient;

