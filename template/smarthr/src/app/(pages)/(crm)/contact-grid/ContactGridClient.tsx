"use client";

import dynamic from "next/dynamic";

const ContactGridComponent = dynamic(
    () => import("@/components/crm/contacts/contactGrid"),
    { ssr: false }
);

const ContactGridClient = () => {
    return <ContactGridComponent />;
};

export default ContactGridClient;





