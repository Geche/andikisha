"use client";

import dynamic from "next/dynamic";

const FormWizardComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/form-wizard"),
    { ssr: false }
);

const FormWizardClient = () => {
    return <FormWizardComponent />;
};

export default FormWizardClient;

