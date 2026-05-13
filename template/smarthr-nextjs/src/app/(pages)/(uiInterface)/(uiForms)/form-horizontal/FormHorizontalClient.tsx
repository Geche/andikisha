"use client";

import dynamic from "next/dynamic";

const FormHorizontalComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/layouts/form-horizontal"),
    { ssr: false }
);

const FormHorizontalClient = () => {
    return <FormHorizontalComponent />;
};

export default FormHorizontalClient;

