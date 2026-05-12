"use client";

import dynamic from "next/dynamic";

const FormMaskComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/form-mask"),
    { ssr: false }
);

const FormMaskClient = () => {
    return <FormMaskComponent />;
};

export default FormMaskClient;

