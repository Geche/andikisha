"use client";

import dynamic from "next/dynamic";

const NotificationssettingsComponent = dynamic(
    () => import("@/components/settings/generalSettings/notifications-settings"),
    { ssr: false }
);

const NotificationsSettingsClient = () => {
    return <NotificationssettingsComponent />;
};

export default NotificationsSettingsClient;





