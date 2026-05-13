"use client";

import dynamic from "next/dynamic";

const ContactListComponent = dynamic(
    () => import("@/components/crm/contacts/contactList"),
    { ssr: false }
);

const ContactListClient = () => {
    return <ContactListComponent />;
};

export default ContactListClient;





