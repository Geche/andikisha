"use client";

import dynamic from "next/dynamic";

const FormPikersComponent = dynamic(
    () => import("@/components/uiInterface/forms/formelements/formpickers"),
    { ssr: false }
);

const FormPickersClient = () => {
    return <FormPikersComponent />;
};

export default FormPickersClient;

