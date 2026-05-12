"use client";

import dynamic from "next/dynamic";

const FormVerticalComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/layouts/form-vertical"),
    { ssr: false }
);

const FormVerticalClient = () => {
    return <FormVerticalComponent />;
};

export default FormVerticalClient;

