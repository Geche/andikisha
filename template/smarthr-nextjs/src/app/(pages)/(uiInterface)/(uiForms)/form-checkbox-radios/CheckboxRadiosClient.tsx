"use client";

import dynamic from "next/dynamic";

const CheckboxRadios = dynamic(
    () => import("@/components/uiInterface/forms/formelements/checkbox-radios"),
    { ssr: false }
);

const CheckboxRadiosClient = () => {
    return <CheckboxRadios />;
};

export default CheckboxRadiosClient;

