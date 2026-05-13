"use client";

import dynamic from "next/dynamic";

const ContactDetailsComponent = dynamic(
    () => import("@/components/crm/contacts/contactDetails"),
    { ssr: false }
);

const ContactDetailsClient = () => {
    return <ContactDetailsComponent />;
};

export default ContactDetailsClient;





