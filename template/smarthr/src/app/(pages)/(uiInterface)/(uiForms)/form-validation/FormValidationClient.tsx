"use client";

import dynamic from "next/dynamic";

const FormValidationComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/layouts/form-validation"),
    { ssr: false }
);

const FormValidationClient = () => {
    return <FormValidationComponent />;
};

export default FormValidationClient;

