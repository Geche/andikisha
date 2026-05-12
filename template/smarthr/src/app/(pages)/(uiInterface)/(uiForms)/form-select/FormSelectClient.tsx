"use client";

import dynamic from "next/dynamic";

const FormSelectComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/form-select"),
    { ssr: false }
);

const FormSelectClient = () => {
    return <FormSelectComponent />;
};

export default FormSelectClient;

